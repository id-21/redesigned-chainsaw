'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import type { GeneratedAssetWithProduct } from '@/lib/features/virtual-tryon/types';
import {
  formatDate,
  getStatusText,
  getGenerationTypeLabel,
  downloadImage,
  getImageThumbnail,
} from '@/lib/features/virtual-tryon/utils';

interface GalleryModalProps {
  asset: GeneratedAssetWithProduct;
  onClose: () => void;
}

export default function GalleryModal({ asset, onClose }: GalleryModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const outputImage = getImageThumbnail(asset.output_assets);
  const productImage = getImageThumbnail(asset.product.images);

  const handleDownload = () => {
    if (outputImage) {
      downloadImage(outputImage, `${asset.product.name}-${asset.id}.png`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {asset.product.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getGenerationTypeLabel(asset.generation_type)} •{' '}
              {formatDate(asset.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Original Product Image */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Original Product
              </h3>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt="Original product"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Image */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Generated Result
              </h3>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {asset.status === 'completed' && outputImage ? (
                  <Image
                    src={outputImage}
                    alt="Generated result"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : asset.status === 'failed' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <svg
                      className="w-16 h-16 text-red-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-600">Generation failed</p>
                    {asset.error_message && (
                      <p className="text-sm text-gray-500 mt-2">
                        {asset.error_message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600">{getStatusText(asset.status)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-gray-900">
                {getStatusText(asset.status)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Credits Used:</span>
              <span className="font-medium text-gray-900">
                {asset.credits_used}
              </span>
            </div>
            {asset.generation_duration_ms && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Generation Time:</span>
                <span className="font-medium text-gray-900">
                  {(asset.generation_duration_ms / 1000).toFixed(2)}s
                </span>
              </div>
            )}
            {asset.prompt && (
              <div className="text-sm">
                <span className="text-gray-600">Prompt:</span>
                <p className="font-medium text-gray-900 mt-1">{asset.prompt}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {asset.status === 'completed' && outputImage && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
