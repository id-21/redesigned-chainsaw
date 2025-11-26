import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { processCostCalculations } from '@/lib/features/virtual-tryon/workers/cost-calculator-worker';

/**
 * POST /api/admin/cost-calculator - Manually trigger cost calculation worker
 *
 * This endpoint can be:
 * - Called manually by admins
 * - Triggered by a cron job (Vercel Cron, GitHub Actions, etc.)
 * - Used for backfilling historical data
 */
export async function POST(request: NextRequest) {
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

    // Get optional batch size from request
    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize || 1000;

    // Run cost calculation worker
    const result = await processCostCalculations(batchSize);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/admin/cost-calculator:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process cost calculations',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cost-calculator - Check worker status
 *
 * Returns count of unpriced logs
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

    // Count unpriced logs
    const { count, error } = await supabaseAdmin
      .from('api_usage_logs')
      .select('*', { count: 'exact', head: true })
      .is('api_cost_usd', null);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      unpricedLogs: count || 0,
      message:
        count === 0
          ? 'All logs have been priced'
          : `${count} logs pending cost calculation`,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/cost-calculator:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check worker status',
      },
      { status: 500 }
    );
  }
}
