'use client';

import Image from 'next/image';
import type { Product } from '@/lib/features/virtual-tryon/types';
import { getImageThumbnail } from '@/lib/features/virtual-tryon/utils';

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
}

export default function ProductSelector({
  products,
  selectedProduct,
  onSelect,
}: ProductSelectorProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <svg
          className="w-12 h-12 mx-auto text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          No Products Yet
        </h3>
        <p className="text-sm text-gray-600">
          Upload your first product image above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Your Products ({products.length})
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Select a product to generate images
        </p>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <div className="p-4 space-y-3">
          {products.map((product) => {
            const thumbnail = getImageThumbnail(product.images);
            const isSelected = selectedProduct?.id === product.id;

            return (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-300"
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
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <h3
                    className={`font-medium truncate ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 truncate">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
