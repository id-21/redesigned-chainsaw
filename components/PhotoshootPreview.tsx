'use client'

interface PhotoshootPreviewProps {
  originalImage: string | null
  generatedImages: any[]
  isGenerating: boolean
}

export default function PhotoshootPreview({
  originalImage,
  generatedImages,
  isGenerating,
}: PhotoshootPreviewProps) {
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your photoshoot...</p>
        </div>
      </div>
    )
  }

  if (!originalImage && generatedImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">Upload an image to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {originalImage && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Original Image
          </h3>
          <img
            src={originalImage}
            alt="Original"
            className="w-full rounded-lg border border-gray-200"
          />
        </div>
      )}

      {generatedImages.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Generated Photoshoots ({generatedImages.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {generatedImages.map((image, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <img
                  src={image.url}
                  alt={`Generated ${index + 1}`}
                  className="w-full rounded-lg mb-2"
                />
                <p className="text-xs text-gray-600">{image.featureType}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
