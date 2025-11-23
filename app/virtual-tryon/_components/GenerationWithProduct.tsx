'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Product, UserCredits } from '@/lib/features/virtual-tryon/types';
import {
  formatCredits,
  getImageThumbnail,
  GENERATION_TYPES,
  downloadImage,
} from '@/lib/features/virtual-tryon/utils';

interface GenerationWithProductProps {
  product: Product;
  credits: UserCredits;
}

export default function GenerationWithProduct({
  product,
  credits: initialCredits,
}: GenerationWithProductProps) {
  const router = useRouter();

  const [credits, setCredits] = useState(initialCredits.credits_remaining);
  const [generationType, setGenerationType] = useState(GENERATION_TYPES[0].value);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageData, setGeneratedImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedType = GENERATION_TYPES.find((t) => t.value === generationType);
  const creditsNeeded = selectedType?.credits || 1;
  const hasEnoughCredits = credits >= creditsNeeded;

  const productImage = getImageThumbnail(product.images);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasEnoughCredits) {
      setError('Insufficient credits');
      return;
    }

    setIsGenerating(true);
    setGeneratedImageData(null);

    try {
      const response = await fetch('/api/virtual-tryon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          generation_type: generationType,
          prompt: prompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const { asset, credits_remaining } = await response.json();

      // Extract image data from output_assets
      if (asset.output_assets && asset.output_assets.length > 0) {
        const imageUrl = asset.output_assets[0].url;
        setGeneratedImageData(imageUrl);
        setCredits(credits_remaining);
      } else {
        throw new Error('No image generated');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImageData) {
      downloadImage(generatedImageData, `${product.name}-virtual-tryon.png`);
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedImageData(null);
    setPrompt('');
    setError(null);
  };

  const handleBackToHome = () => {
    router.push('/virtual-tryon');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/virtual-tryon"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Generate Virtual Try-On
              </h1>
              <p className="text-gray-600 mt-1">
                Creating images for: <span className="font-medium">{product.name}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCredits(credits)}
              </p>
            </div>
          </div>
        </div>

        {/* Product Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Product
          </h2>
          <div className="flex items-start gap-4">
            {/* Product Image */}
            <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
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

            {/* Product Details */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
              )}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Generation Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Generation Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Generation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generation Type
                </label>
                <div className="space-y-2">
                  {GENERATION_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="generation_type"
                          value={type.value}
                          checked={generationType === type.value}
                          onChange={(e) => setGenerationType(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {type.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {type.credits} {type.credits === 1 ? 'credit' : 'credits'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Prompt (Optional)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe specific details you want in the generated image..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Credits Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCredits(credits)} credits
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Cost for this generation:</span>
                  <span className="font-semibold text-gray-900">
                    {creditsNeeded} {creditsNeeded === 1 ? 'credit' : 'credits'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining after:</span>
                    <span
                      className={`font-bold ${
                        hasEnoughCredits ? 'text-gray-900' : 'text-red-600'
                      }`}
                    >
                      {Math.max(0, credits - creditsNeeded)} credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Insufficient Credits Warning */}
              {!hasEnoughCredits && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Insufficient credits. You need {creditsNeeded}{' '}
                    {creditsNeeded === 1 ? 'credit' : 'credits'} but have {credits}.
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                disabled={!hasEnoughCredits || isGenerating}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Virtual Try-On'
                )}
              </button>
            </form>
          </div>

          {/* Right: Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Generated Result
            </h2>

            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-6">
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
                  sizes="(max-width: 1024px) 100vw, 50vw"
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

            {/* Actions after generation */}
            {generatedImageData && !isGenerating && (
              <div className="space-y-3">
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
                  Download Image
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGenerateAnother}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Generate Another
                  </button>
                  <button
                    onClick={handleBackToHome}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
