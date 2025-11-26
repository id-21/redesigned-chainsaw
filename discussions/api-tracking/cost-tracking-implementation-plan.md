# API Cost Tracking Implementation Plan

## Overview

This document outlines the plan for implementing comprehensive API usage and cost tracking for all Gemini API calls in the Virtual Try-On application.

## Goals

1. **Track all API usage** with complete audit trail
2. **Store raw response metadata** for future analysis
3. **Parse and store token counts** separately for analytics
4. **Calculate costs asynchronously** without impacting user experience
5. **Enable admin dashboard** with cost analytics

---

## Database Architecture

### New Table: `api_usage_logs`

```sql
CREATE TABLE api_usage_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

  -- Relationships
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_asset_id TEXT REFERENCES generated_assets(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,

  -- API Call Metadata
  api_endpoint VARCHAR(255) NOT NULL,  -- e.g., '/api/virtual-tryon/generate'
  model_used VARCHAR(100) NOT NULL,    -- e.g., 'gemini-2.5-flash-image'

  -- Raw Response Data
  raw_response_metadata JSONB,         -- Store complete usageMetadata JSON

  -- Parsed Token Counts
  prompt_tokens INTEGER NOT NULL,      -- Text input tokens
  prompt_image_tokens INTEGER DEFAULT 0, -- Image input tokens (calculated)
  output_tokens INTEGER NOT NULL,      -- Response tokens (candidatesTokenCount)
  thinking_tokens INTEGER DEFAULT 0,   -- Thinking tokens (2.5 models only)
  total_tokens INTEGER NOT NULL,       -- Total from API

  -- Cost (calculated asynchronously)
  api_cost_usd DECIMAL(10, 6),         -- Calculated cost in USD
  api_cost_inr DECIMAL(10, 2),         -- Cost converted to INR
  usd_to_inr_rate DECIMAL(10, 4),      -- Exchange rate used for conversion
  cost_calculated_at TIMESTAMP WITH TIME ZONE,      -- When cost was calculated

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_api_endpoint (api_endpoint),
  INDEX idx_cost_null (api_cost_usd) WHERE api_cost_usd IS NULL  -- For background worker
);
```

#### Table Schema Reference

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | TEXT | No | Primary key, auto-generated UUID as text |
| **user_id** | TEXT | No | User who made the API call (references users.id) |
| **generated_asset_id** | TEXT | Yes | Links to generated_assets table (if applicable, ON DELETE SET NULL) |
| **product_id** | TEXT | Yes | Links to products table (if applicable, ON DELETE SET NULL) |
| **api_endpoint** | VARCHAR(255) | No | Which API route was called (e.g., '/api/virtual-tryon/generate') |
| **model_used** | VARCHAR(100) | No | Which Gemini model was used (e.g., 'gemini-2.5-flash-image') |
| **raw_response_metadata** | JSONB | Yes | Complete usageMetadata JSON from Gemini API response |
| **prompt_tokens** | INTEGER | No | Number of text input tokens |
| **prompt_image_tokens** | INTEGER | No | Number of image input tokens (calculated, defaults to 0) |
| **output_tokens** | INTEGER | No | Number of response tokens (candidatesTokenCount) |
| **thinking_tokens** | INTEGER | No | Number of thinking tokens (2.5 models only, defaults to 0) |
| **total_tokens** | INTEGER | No | Total token count from API |
| **api_cost_usd** | DECIMAL(10, 6) | Yes | Calculated cost in USD (null until calculated) |
| **api_cost_inr** | DECIMAL(10, 2) | Yes | Cost converted to INR (null until calculated) |
| **usd_to_inr_rate** | DECIMAL(10, 4) | Yes | Exchange rate used for USD to INR conversion |
| **cost_calculated_at** | TIMESTAMP WITH TIME ZONE | Yes | Timestamp when cost was calculated |
| **created_at** | TIMESTAMP WITH TIME ZONE | No | When the log entry was created (defaults to NOW()) |

#### Indexes

- `idx_user_id` - Fast lookups by user
- `idx_created_at` - Fast date range queries
- `idx_api_endpoint` - Fast filtering by endpoint
- `idx_cost_null` - Efficient background worker queries for unpriced logs

### Why This Design?

- **`raw_response_metadata JSONB`**: Complete audit trail, can extract new fields later
- **Separate token columns**: Fast queries without JSON parsing
- **`prompt_image_tokens`**: Calculated separately since Gemini doesn't break it down
- **`api_cost_usd` nullable**: Allows async calculation without blocking responses
- **`api_cost_inr` + `usd_to_inr_rate`**: Track INR pricing for user-facing costs and profit/loss analysis with Stripe integration
- **Foreign keys**: Link to specific generations and products for analytics
- **TEXT IDs**: Matches existing schema using `gen_random_uuid()::TEXT` for Clerk compatibility

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own API usage logs
CREATE POLICY "Users can view own api usage logs" ON api_usage_logs
    FOR SELECT USING (auth.uid()::TEXT = user_id);

-- Admins can view all API usage logs
CREATE POLICY "Admins can view all api usage logs" ON api_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::TEXT
            AND users.role = 'admin'
        )
    );

-- Service role can insert logs (for API routes)
-- Note: Inserts should be done using service role key, not user context
```

---

## Implementation Steps

### 1. TypeScript Types

**File**: `lib/features/virtual-tryon/types.ts`

```typescript
export interface ApiUsageLog {
  id: string;
  user_id: string;
  generated_asset_id: string | null;
  product_id: string | null;
  api_endpoint: string;
  model_used: string;
  raw_response_metadata: any;  // usageMetadata from Gemini
  prompt_tokens: number;
  prompt_image_tokens: number;
  output_tokens: number;
  thinking_tokens: number;
  total_tokens: number;
  api_cost_usd: number | null;
  api_cost_inr: number | null;
  usd_to_inr_rate: number | null;
  cost_calculated_at: string | null;
  created_at: string;
}

export interface CreateApiUsageLogInput {
  user_id: string;
  generated_asset_id?: string;
  product_id?: string;
  api_endpoint: string;
  model_used: string;
  raw_response_metadata: any;
  prompt_tokens: number;
  prompt_image_tokens?: number;
  output_tokens: number;
  thinking_tokens?: number;
  total_tokens: number;
}
```

### 2. Database Queries

**File**: `lib/features/virtual-tryon/queries.ts`

```typescript
// Create new usage log entry
export async function createApiUsageLog(
  input: CreateApiUsageLogInput
): Promise<ApiUsageLog> {
  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .insert({
      user_id: input.user_id,
      generated_asset_id: input.generated_asset_id || null,
      product_id: input.product_id || null,
      api_endpoint: input.api_endpoint,
      model_used: input.model_used,
      raw_response_metadata: input.raw_response_metadata,
      prompt_tokens: input.prompt_tokens,
      prompt_image_tokens: input.prompt_image_tokens || 0,
      output_tokens: input.output_tokens,
      thinking_tokens: input.thinking_tokens || 0,
      total_tokens: input.total_tokens,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating API usage log:', error);
    throw new Error('Failed to create API usage log');
  }

  return data as ApiUsageLog;
}

// Get usage logs with filters
export async function getApiUsageLogs(
  userId?: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): Promise<ApiUsageLog[]> {
  let query = supabaseAdmin
    .from('api_usage_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    console.error('Error fetching API usage logs:', error);
    throw new Error('Failed to fetch API usage logs');
  }

  return data as ApiUsageLog[];
}

// Update cost for a usage log
export async function updateApiUsageLogCost(
  logId: string,
  costUsd: number,
  usdToInrRate: number
): Promise<void> {
  const costInr = costUsd * usdToInrRate;
  
  const { error } = await supabaseAdmin
    .from('api_usage_logs')
    .update({
      api_cost_usd: costUsd,
      api_cost_inr: costInr,
      usd_to_inr_rate: usdToInrRate,
      cost_calculated_at: new Date().toISOString(),
    })
    .eq('id', logId);

  if (error) {
    console.error('Error updating API usage log cost:', error);
    throw new Error('Failed to update API usage log cost');
  }
}

// Get logs where cost hasn't been calculated yet
export async function getUnpricedApiUsageLogs(
  limit: number = 1000
): Promise<ApiUsageLog[]> {
  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .select('*')
    .is('api_cost_usd', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching unpriced logs:', error);
    throw new Error('Failed to fetch unpriced logs');
  }

  return data as ApiUsageLog[];
}
```

### 3. Cost Calculator Utility

**File**: `lib/features/virtual-tryon/utils/cost-calculator.ts`

```typescript
// Gemini API Pricing Configuration
// UPDATE THESE WITH YOUR ACTUAL PRICING
interface GeminiPricing {
  [model: string]: {
    inputPerMillion: number;   // Cost per 1M input tokens
    outputPerMillion: number;  // Cost per 1M output tokens
  };
}

// USD to INR Exchange Rate
// UPDATE THIS WITH YOUR PREFERRED RATE
const USD_TO_INR_RATE = 85.0;  // Example: 1 USD = 85 INR

const GEMINI_PRICING: GeminiPricing = {
  'gemini-2.5-flash-image': {
    inputPerMillion: 0.00,  // TODO: Add actual pricing
    outputPerMillion: 0.00, // TODO: Add actual pricing
  },
  'gemini-2.0-flash-exp': {
    inputPerMillion: 0.00,  // TODO: Add actual pricing
    outputPerMillion: 0.00, // TODO: Add actual pricing
  },
  'gemini-2.5-flash': {
    inputPerMillion: 0.00,  // TODO: Add actual pricing
    outputPerMillion: 0.00, // TODO: Add actual pricing
  },
};

/**
 * Calculate image input tokens based on dimensions
 * Gemini 2.5/2.0 Flash: 258 tokens for images ≤384px,
 * or 258 tokens per 768x768 tile for larger images
 */
export function calculateImageTokens(width: number, height: number): number {
  // Small images
  if (width <= 384 && height <= 384) {
    return 258;
  }

  // Calculate tiles for larger images
  const cropUnitSize = Math.floor(Math.min(width, height) / 1.5);
  const tilesX = Math.ceil(width / cropUnitSize);
  const tilesY = Math.ceil(height / cropUnitSize);
  const totalTiles = tilesX * tilesY;

  return totalTiles * 258;
}

/**
 * Calculate API cost from usage log
 */
export function calculateApiCost(usageLog: ApiUsageLog): number {
  const pricing = GEMINI_PRICING[usageLog.model_used];

  if (!pricing) {
    console.warn(`No pricing found for model: ${usageLog.model_used}`);
    return 0;
  }

  // Calculate input cost (text + images + thinking)
  const totalInputTokens =
    usageLog.prompt_tokens +
    usageLog.prompt_image_tokens +
    usageLog.thinking_tokens;

  const inputCost = (totalInputTokens / 1_000_000) * pricing.inputPerMillion;

  // Calculate output cost
  const outputCost = (usageLog.output_tokens / 1_000_000) * pricing.outputPerMillion;

  // Total cost
  return inputCost + outputCost;
}

/**
 * Get image dimensions from base64 or URL
 * Used to calculate image token count
 */
export async function getImageDimensions(
  imageSource: string | Buffer
): Promise<{ width: number; height: number }> {
  // Implementation depends on your environment
  // For Node.js, use sharp or image-size library
  // For now, return a placeholder
  return { width: 1024, height: 1024 };
}

/**
 * Get current USD to INR exchange rate
 * Returns the configured rate
 */
export function getUsdToInrRate(): number {
  return USD_TO_INR_RATE;
}
```

### 4. Update API Routes

All three API routes need to log usage. Here's the pattern:

**Example for** `app/api/virtual-tryon/generate/route.ts`:

```typescript
// After Gemini API call
const response = await ai.models.generateContent({...});

// Extract usage metadata
const usage = response.usageMetadata;

// Calculate image tokens (if image was in input)
const imageTokens = calculateImageTokens(imageWidth, imageHeight);

// Log usage immediately (don't await - fire and forget for speed)
createApiUsageLog({
  user_id: userId,
  generated_asset_id: generatedAsset.id,
  product_id: product_id,
  api_endpoint: '/api/virtual-tryon/generate',
  model_used: model,
  raw_response_metadata: usage,
  prompt_tokens: usage.promptTokenCount,
  prompt_image_tokens: imageTokens,
  output_tokens: usage.candidatesTokenCount,
  thinking_tokens: usage.thoughtsTokenCount || 0,
  total_tokens: usage.totalTokenCount,
}).catch(err => {
  console.error('Failed to log API usage:', err);
  // Don't throw - we don't want to fail the request if logging fails
});

// Continue with normal response to user
return NextResponse.json({...});
```

Apply similar pattern to:
- `app/api/virtual-tryon/analyze-product/route.ts`
- `app/api/generate-image/route.ts`

### 5. Background Cost Calculator Worker (Optional)

**File**: `lib/features/virtual-tryon/workers/cost-calculator-worker.ts`

```typescript
/**
 * Background worker to calculate costs for usage logs
 * Can be triggered by:
 * - Cron job (every hour)
 * - Vercel serverless function
 * - Edge function
 * - Manual admin trigger
 */
export async function processCostCalculations(batchSize: number = 1000) {
  const unpricedLogs = await getUnpricedApiUsageLogs(batchSize);
  const usdToInrRate = getUsdToInrRate();

  console.log(`Processing ${unpricedLogs.length} unpriced logs with USD/INR rate: ${usdToInrRate}`);

  for (const log of unpricedLogs) {
    try {
      const costUsd = calculateApiCost(log);
      await updateApiUsageLogCost(log.id, costUsd, usdToInrRate);
    } catch (error) {
      console.error(`Failed to calculate cost for log ${log.id}:`, error);
    }
  }

  console.log('Cost calculation complete');
}
```

**Optional Cron Setup** (Vercel Cron or similar):

```typescript
// app/api/cron/calculate-costs/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await processCostCalculations();

  return Response.json({ success: true });
}
```

---

## Admin Dashboard Analytics Queries

Once implemented, you can query for powerful insights:

### Total API Costs by Date Range
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as api_calls,
  SUM(total_tokens) as total_tokens,
  SUM(api_cost_usd) as total_cost_usd,
  SUM(api_cost_inr) as total_cost_inr
FROM api_usage_logs
WHERE created_at >= '2025-01-01'
  AND api_cost_usd IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Cost Breakdown by Endpoint
```sql
SELECT
  api_endpoint,
  model_used,
  COUNT(*) as calls,
  AVG(total_tokens) as avg_tokens,
  AVG(api_cost_usd) as avg_cost_usd,
  AVG(api_cost_inr) as avg_cost_inr,
  SUM(api_cost_usd) as total_cost_usd,
  SUM(api_cost_inr) as total_cost_inr
FROM api_usage_logs
WHERE api_cost_usd IS NOT NULL
GROUP BY api_endpoint, model_used
ORDER BY total_cost_usd DESC;
```

### Top Spending Users
```sql
SELECT
  user_id,
  COUNT(*) as api_calls,
  SUM(total_tokens) as total_tokens,
  SUM(api_cost_usd) as total_spent_usd,
  SUM(api_cost_inr) as total_spent_inr
FROM api_usage_logs
WHERE api_cost_usd IS NOT NULL
GROUP BY user_id
ORDER BY total_spent_usd DESC
LIMIT 20;
```

### Generation Type Costs
```sql
SELECT
  ga.generation_type,
  COUNT(*) as generations,
  AVG(aul.total_tokens) as avg_tokens,
  AVG(aul.api_cost_usd) as avg_cost_usd,
  AVG(aul.api_cost_inr) as avg_cost_inr,
  SUM(aul.api_cost_usd) as total_cost_usd,
  SUM(aul.api_cost_inr) as total_cost_inr
FROM api_usage_logs aul
JOIN generated_assets ga ON aul.generated_asset_id = ga.id
WHERE aul.api_cost_usd IS NOT NULL
GROUP BY ga.generation_type
ORDER BY total_cost_usd DESC;
```

### Token Usage Trends Over Time
```sql
SELECT
  DATE_TRUNC('day', created_at) as day,
  api_endpoint,
  SUM(prompt_tokens) as input_tokens,
  SUM(output_tokens) as output_tokens,
  SUM(thinking_tokens) as thinking_tokens,
  SUM(total_tokens) as total_tokens
FROM api_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day, api_endpoint
ORDER BY day DESC, api_endpoint;
```

---

## Implementation Checklist

- [ ] Create `api_usage_logs` table directly in Supabase dashboard (dev mode)
- [ ] Configure USD to INR exchange rate in cost calculator
- [ ] Add TypeScript interfaces to `types.ts`
- [ ] Implement CRUD queries in `queries.ts`
- [ ] Create cost calculator utility with pricing config
- [ ] Update `/api/virtual-tryon/generate` route to log usage
- [ ] Update `/api/virtual-tryon/analyze-product` route to log usage
- [ ] Update `/api/generate-image` route to log usage
- [ ] (Optional) Create background cost calculator worker
- [ ] (Optional) Set up cron job for cost calculation
- [ ] Create admin dashboard views for cost analytics (USD & INR)
- [ ] Test with real API calls
- [ ] Monitor and adjust pricing calculations

---

## Benefits Summary

✅ **Non-blocking**: Usage logged immediately, cost calculated async  
✅ **Complete audit trail**: Raw JSON + parsed fields for flexibility  
✅ **Future-proof**: Can recalculate costs if pricing changes  
✅ **Analytics-ready**: Indexed for fast complex queries  
✅ **No user impact**: Response speed unchanged  
✅ **Comprehensive**: Tracks all API endpoints separately  
✅ **Scalable**: Background worker prevents backlog  
✅ **INR Support**: Track costs in INR for user pricing and Stripe profit/loss analysis

---

## Next Steps

1. **Review and edit this plan** as needed
2. **Set USD to INR exchange rate** in cost calculator (currently set to 85.0)
3. **Share Gemini API pricing** to populate `GEMINI_PRICING` config
4. **Create table in Supabase** dashboard (no migration needed in dev)
5. **Test in development** environment first
6. **Deploy to production** with monitoring

---

## Questions to Consider

1. **Cost calculation frequency**: Hourly cron? Real-time? Daily batch?
2. **Data retention**: Keep all logs forever or archive old data?
3. **Alerting**: Set up alerts for unusual spending patterns?
4. **User visibility**: Show users their API costs in dashboard (in INR)?
5. **Rate limiting**: Implement based on cost thresholds?
6. **INR rate updates**: How often to update USD to INR exchange rate?
7. **Stripe integration**: What markup to apply on INR costs for profit margin?