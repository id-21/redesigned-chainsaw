'use client';

import { useState, FormEvent } from 'react';
import type { Product } from '@/lib/features/virtual-tryon/types';
import { GENERATION_TYPES, formatCredits } from '@/lib/features/virtual-tryon/utils';

interface GenerationFormProps {
  selectedProduct: Product | null;
  credits: number;
  onGenerationStart: () => void;
  onGenerationComplete: (imageData: string, creditsUsed: number) => void;
  onGenerationError: (error: string) => void;
}

export default function GenerationForm({
  selectedProduct,
  credits,
  onGenerationStart,
  onGenerationComplete,
  onGenerationError,
}: GenerationFormProps) {
  const [generationType, setGenerationType] = useState(GENERATION_TYPES[0].value);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedType = GENERATION_TYPES.find((t) => t.value === generationType);
  const creditsNeeded = selectedType?.credits || 1;
  const hasEnoughCredits = credits >= creditsNeeded;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      onGenerationError('Please select a product first');
      return;
    }

    if (!hasEnoughCredits) {
      onGenerationError('Insufficient credits');
      return;
    }

    setIsGenerating(true);
    onGenerationStart();

    try {
      const response = await fetch('/api/virtual-tryon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          generation_type: generationType,
          prompt: prompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const { asset } = await response.json();

      // Extract image data from output_assets
      if (asset.output_assets && asset.output_assets.length > 0) {
        const imageUrl = asset.output_assets[0].url;
        onGenerationComplete(imageUrl, creditsNeeded);
      } else {
        throw new Error('No image generated');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate image';
      onGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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

        {/* Prompt (Optional) */}
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
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use default prompt for selected generation type
          </p>
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

        {/* Warning Messages */}
        {!selectedProduct && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Please select or upload a product to continue
            </p>
          </div>
        )}

        {!hasEnoughCredits && selectedProduct && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              Insufficient credits. You need {creditsNeeded}{' '}
              {creditsNeeded === 1 ? 'credit' : 'credits'} but have {credits}.
            </p>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          disabled={!selectedProduct || !hasEnoughCredits || isGenerating}
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
  );
}
