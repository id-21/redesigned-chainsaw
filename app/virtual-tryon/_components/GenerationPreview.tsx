'use client';

import Image from 'next/image';
import type { Product } from '@/lib/features/virtual-tryon/types';
import { getImageThumbnail, downloadImage } from '@/lib/features/virtual-tryon/utils';

interface GenerationPreviewProps {
  selectedProduct: Product | null;
  generatedImageData: string | null;
  isGenerating: boolean;
}

export default function GenerationPreview({
  selectedProduct,
  generatedImageData,
  isGenerating,
}: GenerationPreviewProps) {
  const productImage = selectedProduct
    ? getImageThumbnail(selectedProduct.images)
    : null;

  const handleDownload = () => {
    if (generatedImageData && selectedProduct) {
      downloadImage(
        generatedImageData,
        `${selectedProduct.name}-virtual-tryon.png`
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Original Product */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Original Product
          </h3>
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {productImage ? (
              <Image
                src={productImage}
                alt={selectedProduct?.name || 'Product'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-300 mb-2"
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
                <p className="text-sm text-gray-500">No product selected</p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Result */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Generated Result
          </h3>
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {isGenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-sm text-gray-600 font-medium">
                  Generating your image...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This may take a few moments
                </p>
              </div>
            ) : generatedImageData ? (
              <Image
                src={generatedImageData}
                alt="Generated result"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-300 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  Generated image will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Button */}
      {generatedImageData && !isGenerating && (
        <div className="mt-6">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Generated Image
          </button>
        </div>
      )}

      {/* Product Info */}
      {selectedProduct && !isGenerating && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Selected Product
          </h4>
          <p className="text-sm text-gray-700">{selectedProduct.name}</p>
          {selectedProduct.description && (
            <p className="text-xs text-gray-600 mt-1">
              {selectedProduct.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
