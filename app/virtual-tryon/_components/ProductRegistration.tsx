'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { UserCredits } from '@/lib/features/virtual-tryon/types';
import { formatCredits, validateImageFile } from '@/lib/features/virtual-tryon/utils';
import ProductAnalysisForm from './ProductAnalysisForm';

interface ProductRegistrationProps {
  credits: UserCredits;
}

interface AnalysisResult {
  name: string;
  description: string;
  target_demographic: string;
  material: string;
  color: string;
  tags: string[];
}

export default function ProductRegistration({
  credits,
}: ProductRegistrationProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setAnalysisResult(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Automatically start analysis
    await analyzeProduct(file);
  };

  const analyzeProduct = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/virtual-tryon/analyze-product', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze product');
      }

      const { analysis } = await response.json();
      setAnalysisResult(analysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to analyze product'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveSuccess = (productId: string) => {
    // Redirect to generation page with the new product
    router.push(`/virtual-tryon/generate/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Register New Product
              </h1>
              <p className="text-gray-600 mt-1">
                Upload a product image and let AI analyze it
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCredits(credits.credits_remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  !analysisResult ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}
              >
                {!analysisResult ? '1' : '✓'}
              </div>
              <span className="ml-3 font-medium text-gray-900">
                Upload Image
              </span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div
                className={`h-full bg-blue-600 transition-all duration-500 ${
                  analysisResult ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  analysisResult
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <span
                className={`ml-3 font-medium ${
                  analysisResult ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Review & Save
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!analysisResult ? (
          /* Step 1: Upload */
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Step 1: Upload Product Image
            </h2>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {previewUrl && !isAnalyzing ? (
                <div className="space-y-4">
                  <div className="relative w-full max-w-md aspect-square mx-auto bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                      sizes="448px"
                    />
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Image
                  </button>
                </div>
              ) : isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-6"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AI is analyzing your product...
                  </h3>
                  <p className="text-sm text-gray-600">
                    This will only take a moment
                  </p>
                </div>
              ) : (
                <>
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-lg text-gray-700 mb-3">
                    Drag and drop your product image here
                  </p>
                  <p className="text-gray-600 mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Review & Save */
          <ProductAnalysisForm
            imageUrl={previewUrl!}
            analysisResult={analysisResult}
            imageFile={selectedFile!}
            onSuccess={handleSaveSuccess}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
