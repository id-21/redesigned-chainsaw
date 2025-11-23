'use client';

import Image from 'next/image';
import type { GeneratedAssetWithProduct } from '@/lib/features/virtual-tryon/types';
import {
  formatDate,
  getStatusColor,
  getStatusText,
  getGenerationTypeLabel,
  getImageThumbnail,
} from '@/lib/features/virtual-tryon/utils';

interface GalleryCardProps {
  generation: GeneratedAssetWithProduct;
  onClick: () => void;
}

export default function GalleryCard({ generation, onClick }: GalleryCardProps) {
  // Get thumbnail - either from output_assets or product images
  const outputThumbnail = getImageThumbnail(generation.output_assets);
  const productThumbnail = getImageThumbnail(generation.product.images);
  const thumbnail = outputThumbnail || productThumbnail;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={generation.product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-300"
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

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(generation.status)}`}
          >
            {getStatusText(generation.status)}
          </span>
        </div>

        {/* Processing Overlay */}
        {(generation.status === 'pending' ||
          generation.status === 'processing') && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {generation.product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {getGenerationTypeLabel(generation.generation_type)}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(generation.created_at)}</span>
          <span>{generation.credits_used} credit{generation.credits_used !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
