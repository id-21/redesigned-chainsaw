'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  // Mock data - in production, this would come from Supabase
  const [photoshoots] = useState([
    {
      id: '1',
      productName: 'Summer Cotton T-Shirt',
      status: 'completed',
      createdAt: '2024-01-15',
      imageCount: 3,
    },
    {
      id: '2',
      productName: 'Denim Jacket',
      status: 'processing',
      createdAt: '2024-01-16',
      imageCount: 0,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Link
            href="/generator"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            New Photoshoot
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Your Photoshoots</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {photoshoots.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No photoshoots yet. Create your first one!
              </div>
            ) : (
              photoshoots.map((photoshoot) => (
                <div
                  key={photoshoot.id}
                  className="px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {photoshoot.productName}
                      </h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span>Created: {photoshoot.createdAt}</span>
                        <span>{photoshoot.imageCount} images</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          photoshoot.status
                        )}`}
                      >
                        {photoshoot.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Photoshoots</h3>
            <p className="text-3xl font-bold text-blue-600">
              {photoshoots.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Images Generated</h3>
            <p className="text-3xl font-bold text-green-600">
              {photoshoots.reduce((sum, p) => sum + p.imageCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {photoshoots.filter((p) => p.status === 'processing').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
