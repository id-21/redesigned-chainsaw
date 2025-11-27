'use client';

import Link from 'next/link';
import { formatCredits, getCreditWarningLevel } from '@/lib/features/virtual-tryon/utils';
import type { GeneratedAssetWithProduct, UserCredits, Product } from '@/lib/features/virtual-tryon/types';
import GenerationsGallery from './GenerationsGallery';
import ProductsGallery from './ProductsGallery';

interface VirtualTryonHomePageProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  credits: UserCredits;
  products: Product[];
  recentGenerations: GeneratedAssetWithProduct[];
}

export default function VirtualTryonHomePage({
  user,
  credits,
  products,
  recentGenerations,
}: VirtualTryonHomePageProps) {
  const creditWarning = getCreditWarningLevel(credits.credits_remaining);

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-neutral-light">
            Create stunning virtual try-on images for your products
          </p>
        </div>

        {/* Credits and CTA Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCredits(credits.credits_remaining)}
                </span>
                <span className="text-sm text-gray-600">credits remaining</span>
              </div>
              {creditWarning === 'critical' && (
                <p className="text-sm text-red-600">
                  You&apos;re out of credits! Purchase more to continue generating.
                </p>
              )}
              {creditWarning === 'low' && (
                <p className="text-sm text-yellow-600">
                  Your credits are running low. Consider purchasing more.
                </p>
              )}
              {creditWarning === 'none' && (
                <p className="text-sm text-gray-500">
                  Total purchased: {formatCredits(credits.total_credits_purchased)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href="/virtual-tryon/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-secondary font-semibold rounded-lg transition-colors shadow-sm"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Generation
              </Link>
            </div>
          </div>
        </div>

        {/* My Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Products</h2>
            <Link
              href="/virtual-tryon/register"
              className="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              + Add Product
            </Link>
          </div>
          <ProductsGallery products={products} />
        </div>

        {/* Generations Gallery */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Recent Generations
            </h2>
            {recentGenerations.length > 0 && (
              <Link
                href="/virtual-tryon/gallery"
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                View All
              </Link>
            )}
          </div>

          {recentGenerations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="max-w-md mx-auto">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No generations yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first virtual try-on image!
                </p>
                <Link
                  href="/virtual-tryon/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-secondary font-semibold rounded-lg transition-colors"
                >
                  Create Your First Generation
                </Link>
              </div>
            </div>
          ) : (
            <GenerationsGallery generations={recentGenerations} />
          )}
        </div>

        {/* Quick Stats */}
        {recentGenerations.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Generations
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {recentGenerations.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Successful
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {
                  recentGenerations.filter((gen) => gen.status === 'completed')
                    .length
                }
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                In Progress
              </h3>
              <p className="text-3xl font-bold text-primary">
                {
                  recentGenerations.filter(
                    (gen) =>
                      gen.status === 'pending' || gen.status === 'processing'
                  ).length
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
