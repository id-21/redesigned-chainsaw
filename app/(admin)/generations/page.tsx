import { getAllGeneratedAssets } from "@/lib/supabase-admin";

export default async function AdminGenerationsPage() {
  const generations = await getAllGeneratedAssets();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Generations</h1>
        <p className="text-gray-600 mt-2">
          View all AI generation history and analytics
        </p>
      </div>

      {/* Generation Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">
            Total Generations
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {generations.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {generations.filter((g) => g.status === "completed").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {generations.filter((g) => g.status === "failed").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Processing</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {
              generations.filter(
                (g) => g.status === "processing" || g.status === "pending"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Generations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {generations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No generations found
                  </td>
                </tr>
              ) : (
                generations.map((generation) => (
                  <tr key={generation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {generation.products?.name || "Unknown Product"}
                      </div>
                      {generation.prompt && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {generation.prompt}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {generation.users?.full_name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {generation.users?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {generation.generation_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          generation.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : generation.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : generation.status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {generation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {generation.credits_used}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${generation.api_cost?.toFixed(4) || "0.0000"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(generation.created_at).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(generation.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generation Types Summary */}
      {generations.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Generation Types
          </h2>
          <div className="flex flex-wrap gap-3">
            {Array.from(
              new Set(generations.map((g) => g.generation_type))
            ).map((type) => {
              const count = generations.filter(
                (g) => g.generation_type === type
              ).length;
              return (
                <div
                  key={type}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {type}
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
