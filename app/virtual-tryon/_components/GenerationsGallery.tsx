'use client';

import { useState } from 'react';
import type { GeneratedAssetWithProduct } from '@/lib/features/virtual-tryon/types';
import GalleryCard from './GalleryCard';
import GalleryModal from './GalleryModal';

interface GenerationsGalleryProps {
  generations: GeneratedAssetWithProduct[];
}

export default function GenerationsGallery({
  generations,
}: GenerationsGalleryProps) {
  const [selectedAsset, setSelectedAsset] =
    useState<GeneratedAssetWithProduct | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {generations.map((generation) => (
          <GalleryCard
            key={generation.id}
            generation={generation}
            onClick={() => setSelectedAsset(generation)}
          />
        ))}
      </div>

      {selectedAsset && (
        <GalleryModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </>
  );
}
