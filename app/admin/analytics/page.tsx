import { redirect } from 'next/navigation';
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
import CostSummaryCards from './_components/CostSummaryCards';
import StatusBadge from './_components/StatusBadge';
import ApiUsageTable from './_components/ApiUsageTable';

async function getAnalyticsData() {
  const unpricedCount = await getUnpricedLogsCount();

  const [summary, endpoints, topUsers, trends, generationTypes, detailedLogs] =
    await Promise.all([
      getCostSummary(),
      getCostsByEndpoint(),
      getTopSpendingUsers(20),
      getTokenUsageTrends(30),
      getCostsByGenerationType(),
      getDetailedApiUsageLogs(100),
    ]);

  return {
    unpricedCount,
    summary,
    endpoints,
    topUsers,
    trends,
    generationTypes,
    detailedLogs,
  };
}

export default async function AnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const analyticsData = await getAnalyticsData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                API Cost Analytics
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor API usage, costs, and performance metrics
              </p>
            </div>
            <StatusBadge unpricedCount={analyticsData.unpricedCount} />
          </div>
        </div>

        {/* Summary Cards */}
        <CostSummaryCards summary={analyticsData.summary} />

        {/* Detailed Usage Table */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Detailed API Usage Logs
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Recent API calls with cost breakdown and generation details
              </p>
            </div>
            <ApiUsageTable logs={analyticsData.detailedLogs || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
