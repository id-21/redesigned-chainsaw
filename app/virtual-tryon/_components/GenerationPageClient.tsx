'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product, UserCredits } from '@/lib/features/virtual-tryon/types';
import ProductSelector from './ProductSelector';
import ProductUploader from './ProductUploader';
import GenerationForm from './GenerationForm';
import GenerationPreview from './GenerationPreview';
import { formatCredits } from '@/lib/features/virtual-tryon/utils';

interface GenerationPageClientProps {
  products: Product[];
  credits: UserCredits;
}

export default function GenerationPageClient({
  products: initialProducts,
  credits: initialCredits,
}: GenerationPageClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [credits, setCredits] = useState(initialCredits);
  const [generatedImageData, setGeneratedImageData] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleProductCreated = (product: Product) => {
    setProducts([product, ...products]);
    setSelectedProduct(product);
  };

  const handleGenerationComplete = (imageData: string, creditsUsed: number) => {
    setGeneratedImageData(imageData);
    setCredits({
      ...credits,
      credits_remaining: credits.credits_remaining - creditsUsed,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/virtual-tryon"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Virtual Try-On
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCredits(credits.credits_remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Product Selection & Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Uploader */}
            <ProductUploader onProductCreated={handleProductCreated} />

            {/* Product Selector */}
            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              onSelect={setSelectedProduct}
            />
          </div>

          {/* Right Column - Generation Form & Preview */}
          <div className="lg:col-span-3 space-y-6">
            {/* Generation Form */}
            <GenerationForm
              selectedProduct={selectedProduct}
              credits={credits.credits_remaining}
              onGenerationStart={() => {
                setIsGenerating(true);
                setGeneratedImageData(null);
              }}
              onGenerationComplete={(imageData, creditsUsed) => {
                setIsGenerating(false);
                handleGenerationComplete(imageData, creditsUsed);
              }}
              onGenerationError={() => setIsGenerating(false)}
            />

            {/* Preview */}
            <GenerationPreview
              selectedProduct={selectedProduct}
              generatedImageData={generatedImageData}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
