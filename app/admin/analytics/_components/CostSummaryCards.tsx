interface CostSummary {
  total_api_calls: number;
  total_tokens: number;
  total_cost_usd: number;
  total_cost_inr: number;
  avg_cost_per_call_usd: number;
  avg_cost_per_call_inr: number;
  avg_tokens_per_call: number;
}

interface CostSummaryCardsProps {
  summary: CostSummary;
}

export default function CostSummaryCards({ summary }: CostSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total API Calls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total API Calls</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.total_api_calls.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Total Cost USD */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Cost (USD)</p>
            <p className="text-2xl font-bold text-gray-900">
              ${summary.total_cost_usd.toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Avg: ${summary.avg_cost_per_call_usd.toFixed(6)}/call
            </p>
          </div>
        </div>
      </div>

      {/* Total Cost INR */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Cost (INR)</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{summary.total_cost_inr.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Avg: ₹{summary.avg_cost_per_call_inr.toFixed(2)}/call
            </p>
          </div>
        </div>
      </div>

      {/* Average Tokens */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Avg Tokens/Call</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.avg_tokens_per_call.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total: {summary.total_tokens.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
