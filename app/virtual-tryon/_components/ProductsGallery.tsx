'use client';

import Link from 'next/link';
import type { Product } from '@/lib/features/virtual-tryon/types';
import ProductCard from './ProductCard';

interface ProductsGalleryProps {
  products: Product[];
}

export default function ProductsGallery({ products }: ProductsGalleryProps) {
  if (products.length === 0) {
    return (
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products registered yet
          </h3>
          <p className="text-gray-600 mb-6">
            Register your first product to start creating virtual try-on images!
          </p>
          <Link
            href="/virtual-tryon/register"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Register Your First Product
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
