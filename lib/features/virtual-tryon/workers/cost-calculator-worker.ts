// Background worker to calculate costs for API usage logs
// Can be triggered by:
// - Cron job (every hour)
// - Vercel serverless function
// - Edge function
// - Manual admin trigger

import {
  getUnpricedApiUsageLogs,
  updateApiUsageLogCost,
} from '../queries';
import {
  calculateApiCost,
  getUsdToInrRate,
} from '../cost-utils/cost-calculator';

/**
 * Process cost calculations for unpriced API usage logs
 *
 * This function:
 * 1. Fetches all logs where api_cost_usd is NULL
 * 2. Calculates cost in USD using configured pricing
 * 3. Converts to INR using current exchange rate
 * 4. Updates the log with costs and exchange rate
 *
 * @param batchSize Maximum number of logs to process in one run
 * @returns Object with processing stats
 */
export async function processCostCalculations(batchSize: number = 1000) {
  const startTime = Date.now();

  try {
    // Fetch unpriced logs
    const unpricedLogs = await getUnpricedApiUsageLogs(batchSize);
    const usdToInrRate = getUsdToInrRate();

    console.log(
      `[Cost Calculator Worker] Processing ${unpricedLogs.length} unpriced logs with USD/INR rate: ${usdToInrRate}`
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ logId: string; error: string }> = [];

    // Process each log
    for (const log of unpricedLogs) {
      try {
        // Calculate cost in USD
        const costUsd = calculateApiCost(log);

        // Update log with cost
        await updateApiUsageLogCost(log.id, costUsd, usdToInrRate);

        successCount++;

        // Log progress every 100 records
        if (successCount % 100 === 0) {
          console.log(
            `[Cost Calculator Worker] Processed ${successCount}/${unpricedLogs.length} logs`
          );
        }
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({ logId: log.id, error: errorMessage });
        console.error(
          `[Cost Calculator Worker] Failed to calculate cost for log ${log.id}:`,
          errorMessage
        );
      }
    }

    const duration = Date.now() - startTime;

    const result = {
      success: true,
      processed: successCount,
      errors: errorCount,
      total: unpricedLogs.length,
      durationMs: duration,
      usdToInrRate,
      errorDetails: errors.length > 0 ? errors : undefined,
    };

    console.log(
      `[Cost Calculator Worker] Completed in ${duration}ms. Success: ${successCount}, Errors: ${errorCount}`
    );

    return result;
  } catch (error) {
    console.error('[Cost Calculator Worker] Fatal error:', error);
    return {
      success: false,
      processed: 0,
      errors: 0,
      total: 0,
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run cost calculation for a specific date range
 *
 * Useful for backfilling costs for historical data
 *
 * @param startDate Start date for filtering logs
 * @param endDate End date for filtering logs
 */
export async function processCostCalculationsForDateRange(
  startDate: Date,
  endDate: Date
) {
  console.log(
    `[Cost Calculator Worker] Processing date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  // This is a simplified version - in production you'd need to modify
  // getUnpricedApiUsageLogs to accept date range parameters
  return await processCostCalculations();
}
