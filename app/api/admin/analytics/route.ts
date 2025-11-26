import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getCostSummary,
  getCostsByEndpoint,
  getTopSpendingUsers,
  getTokenUsageTrends,
  getCostsByGenerationType,
  getDetailedApiUsageLogs,
} from '@/lib/features/virtual-tryon/analytics';
import { getUnpricedLogsCount } from '@/lib/features/virtual-tryon/queries';
import { processCostCalculations } from '@/lib/features/virtual-tryon/workers/cost-calculator-worker';

/**
 * GET /api/admin/analytics - Get comprehensive cost analytics
 *
 * Query parameters:
 * - type: 'summary' | 'endpoints' | 'users' | 'trends' | 'generation-types' | 'all'
 * - days: number (for trends, default 30)
 * - limit: number (for top users, default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check for unpriced logs and trigger background calculation if needed
    const unpricedCount = await getUnpricedLogsCount();
    let calculationTriggered = false;

    if (unpricedCount > 0) {
      // Fire-and-forget: trigger cost calculation in background
      calculationTriggered = true;
      processCostCalculations().catch((err) => {
        console.error('Background cost calculation failed:', err);
        // Don't throw - we don't want to block the API response
      });
    }

    let result: any = {
      unpricedCount,
      calculationTriggered,
    };

    // Fetch requested analytics
    switch (type) {
      case 'summary':
        result.summary = await getCostSummary();
        break;

      case 'endpoints':
        result.endpoints = await getCostsByEndpoint();
        break;

      case 'users':
        result.topUsers = await getTopSpendingUsers(limit);
        break;

      case 'trends':
        result.trends = await getTokenUsageTrends(days);
        break;

      case 'generation-types':
        result.generationTypes = await getCostsByGenerationType();
        break;

      case 'all':
      default:
        // Fetch all analytics in parallel
        const [summary, endpoints, topUsers, trends, generationTypes, detailedLogs] =
          await Promise.all([
            getCostSummary(),
            getCostsByEndpoint(),
            getTopSpendingUsers(limit),
            getTokenUsageTrends(days),
            getCostsByGenerationType(),
            getDetailedApiUsageLogs(100),
          ]);

        result = {
          ...result,
          summary,
          endpoints,
          topUsers,
          trends,
          generationTypes,
          detailedLogs,
        };
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/analytics:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}
