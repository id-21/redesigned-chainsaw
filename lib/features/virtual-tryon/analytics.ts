// Admin analytics queries for API usage and cost tracking

import { supabaseAdmin } from '@/lib/supabase-admin';

// =====================================================
// ANALYTICS TYPES
// =====================================================

export interface CostByDateResult {
  date: string;
  api_calls: number;
  total_tokens: number;
  total_cost_usd: number;
  total_cost_inr: number;
}

export interface CostByEndpointResult {
  api_endpoint: string;
  model_used: string;
  calls: number;
  avg_tokens: number;
  avg_cost_usd: number;
  avg_cost_inr: number;
  total_cost_usd: number;
  total_cost_inr: number;
}

export interface TopSpendingUserResult {
  user_id: string;
  user_email?: string;
  api_calls: number;
  total_tokens: number;
  total_spent_usd: number;
  total_spent_inr: number;
}

export interface TokenUsageTrendResult {
  day: string;
  api_endpoint: string;
  input_tokens: number;
  output_tokens: number;
  thinking_tokens: number;
  total_tokens: number;
}

export interface CostByGenerationTypeResult {
  generation_type: string;
  generations: number;
  avg_tokens: number;
  avg_cost_usd: number;
  avg_cost_inr: number;
  total_cost_usd: number;
  total_cost_inr: number;
}

export interface DetailedApiUsageLogResult {
  id: string;
  created_at: string;
  api_endpoint: string;
  model_used: string;
  api_cost_usd: number | null;
  api_cost_inr: number | null;
  user_id: string;
  user_email: string | null;
  product_id: string | null;
  product_images: Array<{ url: string; is_primary?: boolean }> | null;
  generation_id: string | null;
  output_assets: Array<{ url: string; type: string }> | null;
}

// =====================================================
// ANALYTICS QUERIES
// =====================================================

/**
 * Get total API costs by date range
 *
 * @param startDate Start date for filtering
 * @param endDate End date for filtering
 * @returns Daily cost breakdown
 */
export async function getCostsByDate(
  startDate: Date,
  endDate: Date
): Promise<CostByDateResult[]> {
  const { data, error } = await supabaseAdmin.rpc('get_costs_by_date', {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });

  if (error) {
    console.error('Error fetching costs by date:', error);
    throw new Error('Failed to fetch costs by date');
  }

  return data as CostByDateResult[];
}

/**
 * Get cost breakdown by API endpoint and model
 *
 * @returns Cost breakdown by endpoint/model
 */
export async function getCostsByEndpoint(): Promise<CostByEndpointResult[]> {
  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .select('*')
    .not('api_cost_usd', 'is', null);

  if (error) {
    console.error('Error fetching costs by endpoint:', error);
    throw new Error('Failed to fetch costs by endpoint');
  }

  // Group by endpoint and model
  const grouped = data.reduce((acc: any, log: any) => {
    const key = `${log.api_endpoint}|${log.model_used}`;
    if (!acc[key]) {
      acc[key] = {
        api_endpoint: log.api_endpoint,
        model_used: log.model_used,
        calls: 0,
        total_tokens: 0,
        total_cost_usd: 0,
        total_cost_inr: 0,
      };
    }
    acc[key].calls += 1;
    acc[key].total_tokens += log.total_tokens;
    acc[key].total_cost_usd += Number(log.api_cost_usd);
    acc[key].total_cost_inr += Number(log.api_cost_inr);
    return acc;
  }, {});

  // Calculate averages and format results
  const results: CostByEndpointResult[] = Object.values(grouped).map(
    (item: any) => ({
      api_endpoint: item.api_endpoint,
      model_used: item.model_used,
      calls: item.calls,
      avg_tokens: Math.round(item.total_tokens / item.calls),
      avg_cost_usd: item.total_cost_usd / item.calls,
      avg_cost_inr: item.total_cost_inr / item.calls,
      total_cost_usd: item.total_cost_usd,
      total_cost_inr: item.total_cost_inr,
    })
  );

  // Sort by total cost descending
  return results.sort((a, b) => b.total_cost_usd - a.total_cost_usd);
}

/**
 * Get top spending users
 *
 * @param limit Number of users to return
 * @returns Top spending users
 */
export async function getTopSpendingUsers(
  limit: number = 20
): Promise<TopSpendingUserResult[]> {
  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .select('user_id, total_tokens, api_cost_usd, api_cost_inr')
    .not('api_cost_usd', 'is', null);

  if (error) {
    console.error('Error fetching top spending users:', error);
    throw new Error('Failed to fetch top spending users');
  }

  // Group by user
  const grouped = data.reduce((acc: any, log: any) => {
    if (!acc[log.user_id]) {
      acc[log.user_id] = {
        user_id: log.user_id,
        api_calls: 0,
        total_tokens: 0,
        total_spent_usd: 0,
        total_spent_inr: 0,
      };
    }
    acc[log.user_id].api_calls += 1;
    acc[log.user_id].total_tokens += log.total_tokens;
    acc[log.user_id].total_spent_usd += Number(log.api_cost_usd);
    acc[log.user_id].total_spent_inr += Number(log.api_cost_inr);
    return acc;
  }, {});

  const results: TopSpendingUserResult[] = Object.values(grouped);

  // Sort by total spent descending and limit
  return results
    .sort((a, b) => b.total_spent_usd - a.total_spent_usd)
    .slice(0, limit);
}

/**
 * Get token usage trends over time
 *
 * @param days Number of days to look back
 * @returns Daily token usage by endpoint
 */
export async function getTokenUsageTrends(
  days: number = 30
): Promise<TokenUsageTrendResult[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .select('created_at, api_endpoint, prompt_tokens, output_tokens, thinking_tokens, total_tokens')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching token usage trends:', error);
    throw new Error('Failed to fetch token usage trends');
  }

  // Group by day and endpoint
  const grouped = data.reduce((acc: any, log: any) => {
    const day = new Date(log.created_at).toISOString().split('T')[0];
    const key = `${day}|${log.api_endpoint}`;

    if (!acc[key]) {
      acc[key] = {
        day,
        api_endpoint: log.api_endpoint,
        input_tokens: 0,
        output_tokens: 0,
        thinking_tokens: 0,
        total_tokens: 0,
      };
    }
    acc[key].input_tokens += log.prompt_tokens;
    acc[key].output_tokens += log.output_tokens;
    acc[key].thinking_tokens += log.thinking_tokens;
    acc[key].total_tokens += log.total_tokens;
    return acc;
  }, {});

  const results: TokenUsageTrendResult[] = Object.values(grouped);

  // Sort by day descending
  return results.sort((a, b) => b.day.localeCompare(a.day));
}

/**
 * Get costs by generation type
 *
 * @returns Cost breakdown by generation type
 */
export async function getCostsByGenerationType(): Promise<
  CostByGenerationTypeResult[]
> {
  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .select(`
      generated_asset_id,
      total_tokens,
      api_cost_usd,
      api_cost_inr,
      generated_assets!inner(generation_type)
    `)
    .not('api_cost_usd', 'is', null)
    .not('generated_asset_id', 'is', null);

  if (error) {
    console.error('Error fetching costs by generation type:', error);
    throw new Error('Failed to fetch costs by generation type');
  }

  // Group by generation type
  const grouped = data.reduce((acc: any, log: any) => {
    const genType = (log as any).generated_assets?.generation_type || 'unknown';

    if (!acc[genType]) {
      acc[genType] = {
        generation_type: genType,
        generations: 0,
        total_tokens: 0,
        total_cost_usd: 0,
        total_cost_inr: 0,
      };
    }
    acc[genType].generations += 1;
    acc[genType].total_tokens += log.total_tokens;
    acc[genType].total_cost_usd += Number(log.api_cost_usd);
    acc[genType].total_cost_inr += Number(log.api_cost_inr);
    return acc;
  }, {});

  // Calculate averages
  const results: CostByGenerationTypeResult[] = Object.values(grouped).map(
    (item: any) => ({
      generation_type: item.generation_type,
      generations: item.generations,
      avg_tokens: Math.round(item.total_tokens / item.generations),
      avg_cost_usd: item.total_cost_usd / item.generations,
      avg_cost_inr: item.total_cost_inr / item.generations,
      total_cost_usd: item.total_cost_usd,
      total_cost_inr: item.total_cost_inr,
    })
  );

  // Sort by total cost descending
  return results.sort((a, b) => b.total_cost_usd - a.total_cost_usd);
}

/**
 * Get overall cost summary
 *
 * @returns Summary of all costs
 */
export async function getCostSummary() {
  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .select('total_tokens, api_cost_usd, api_cost_inr')
    .not('api_cost_usd', 'is', null);

  if (error) {
    console.error('Error fetching cost summary:', error);
    throw new Error('Failed to fetch cost summary');
  }

  const summary = data.reduce(
    (acc, log) => {
      acc.total_api_calls += 1;
      acc.total_tokens += log.total_tokens;
      acc.total_cost_usd += Number(log.api_cost_usd);
      acc.total_cost_inr += Number(log.api_cost_inr);
      return acc;
    },
    {
      total_api_calls: 0,
      total_tokens: 0,
      total_cost_usd: 0,
      total_cost_inr: 0,
    }
  );

  return {
    ...summary,
    avg_cost_per_call_usd: summary.total_cost_usd / summary.total_api_calls || 0,
    avg_cost_per_call_inr: summary.total_cost_inr / summary.total_api_calls || 0,
    avg_tokens_per_call: Math.round(summary.total_tokens / summary.total_api_calls) || 0,
  };
}

/**
 * Get detailed API usage logs with joined data
 *
 * Returns comprehensive log data including:
 * - Timestamp, endpoint, model, costs
 * - User information
 * - Product images
 * - Generated images
 *
 * @param limit Number of logs to return (default 100)
 * @returns Detailed API usage logs
 */
export async function getDetailedApiUsageLogs(
  limit: number = 100
): Promise<DetailedApiUsageLogResult[]> {
  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .select(`
      id,
      created_at,
      api_endpoint,
      model_used,
      api_cost_usd,
      api_cost_inr,
      user_id,
      product_id,
      generated_asset_id,
      users!inner(email),
      products(id, images),
      generated_assets(id, output_assets)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching detailed API usage logs:', error);
    throw new Error('Failed to fetch detailed API usage logs');
  }

  // Map the results to flatten the structure
  const results: DetailedApiUsageLogResult[] = data.map((log: any) => ({
    id: log.id,
    created_at: log.created_at,
    api_endpoint: log.api_endpoint,
    model_used: log.model_used,
    api_cost_usd: log.api_cost_usd,
    api_cost_inr: log.api_cost_inr,
    user_id: log.user_id,
    user_email: log.users?.email || null,
    product_id: log.product_id,
    product_images: log.products?.images || null,
    generation_id: log.generated_asset_id,
    output_assets: log.generated_assets?.output_assets || null,
  }));

  return results;
}
