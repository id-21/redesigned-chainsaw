'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import FeatureSelector from '@/components/FeatureSelector'
import PhotoshootPreview from '@/components/PhotoshootPreview'

export default function GeneratorPage() {
  const [productImage, setProductImage] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [generatedImages, setGeneratedImages] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleImageUpload = (imageUrl: string) => {
    setProductImage(imageUrl)
  }

  const handleGenerate = async () => {
    if (!productImage || !productName) {
      alert('Please upload an image and provide a product name')
      return
    }

    setIsGenerating(true)
    try {
      // Call API to generate photoshoot
      const response = await fetch('/api/generate-photoshoot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          productImage,
          features: selectedFeatures,
        }),
      })

      const data = await response.json()
      setGeneratedImages(data.images)
    } catch (error) {
      console.error('Error generating photoshoot:', error)
      alert('Failed to generate photoshoot')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Generate Product Photoshoot
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Product Details</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Summer Cotton T-Shirt"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Upload Product Image
              </label>
              <ImageUpload onUpload={handleImageUpload} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Select Photoshoot Features
              </label>
              <FeatureSelector
                selectedFeatures={selectedFeatures}
                onFeatureChange={setSelectedFeatures}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !productImage || !productName}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Photoshoot'}
            </button>
          </div>

          {/* Right Column - Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Preview</h2>
            <PhotoshootPreview
              originalImage={productImage}
              generatedImages={generatedImages}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
