'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface DetailedApiUsageLog {
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

interface ApiUsageTableProps {
  logs: DetailedApiUsageLog[];
}

function convertUTCtoIST(utcTimestamp: string): string {
  const date = new Date(utcTimestamp);

  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istDate = new Date(date.getTime() + istOffset);

  // Format as DD/MM HH:mm
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const hours = String(istDate.getUTCHours()).padStart(2, '0');
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');

  return `${day}/${month} ${hours}:${minutes}`;
}

function getPrimaryImageUrl(images: Array<{ url: string; is_primary?: boolean }> | null): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find(img => img.is_primary);
  return primary ? primary.url : images[0].url;
}

function getFirstOutputImageUrl(assets: Array<{ url: string; type: string }> | null): string | null {
  if (!assets || assets.length === 0) return null;
  const imageAsset = assets.find(asset => asset.type === 'image');
  return imageAsset ? imageAsset.url : assets[0].url;
}

export default function ApiUsageTable({ logs }: ApiUsageTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  // Calculate pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  if (logs.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
        <p className="mt-1 text-sm text-gray-500">
          API usage logs will appear here once you start generating images.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp (IST)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endpoint
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost (USD)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost (INR)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLogs.map((log) => {
              const productImageUrl = getPrimaryImageUrl(log.product_images);
              const generatedImageUrl = getFirstOutputImageUrl(log.output_assets);

              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  {/* Timestamp */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {convertUTCtoIST(log.created_at)}
                  </td>

                  {/* Product Image */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {productImageUrl && log.product_id ? (
                      <Link
                        href={`/admin/products/${log.product_id}`}
                        className="group flex items-center"
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200 group-hover:border-blue-500 transition-colors">
                          <Image
                            src={productImageUrl}
                            alt="Product"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">N/A</span>
                      </div>
                    )}
                  </td>

                  {/* Generated Image */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {generatedImageUrl && log.generation_id ? (
                      <Link
                        href={`/admin/generations/${log.generation_id}`}
                        className="group flex items-center"
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200 group-hover:border-blue-500 transition-colors">
                          <Image
                            src={generatedImageUrl}
                            alt="Generated"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">N/A</span>
                      </div>
                    )}
                  </td>

                  {/* User */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/users/${log.user_id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {log.user_email || log.user_id.slice(0, 8)}
                    </Link>
                  </td>

                  {/* Endpoint */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {log.api_endpoint.split('/').pop()}
                    </code>
                  </td>

                  {/* Cost USD */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.api_cost_usd !== null
                      ? `$${log.api_cost_usd.toFixed(6)}`
                      : '-'}
                  </td>

                  {/* Cost INR */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.api_cost_inr !== null
                      ? `₹${log.api_cost_inr.toFixed(2)}`
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, logs.length)} of{' '}
            {logs.length} logs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
