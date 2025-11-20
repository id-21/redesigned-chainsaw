'use client'

interface FeatureSelectorProps {
  selectedFeatures: string[]
  onFeatureChange: (features: string[]) => void
}

const availableFeatures = [
  {
    id: 'studio',
    name: 'Studio Photoshoot',
    description: 'Professional studio photography with clean background',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Photoshoot',
    description: 'Product shown in real-world context and use',
  },
  {
    id: 'feature_highlight',
    name: 'Feature Highlights',
    description: 'Close-up shots highlighting product details',
  },
]

export default function FeatureSelector({
  selectedFeatures,
  onFeatureChange,
}: FeatureSelectorProps) {
  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      onFeatureChange(selectedFeatures.filter((f) => f !== featureId))
    } else {
      onFeatureChange([...selectedFeatures, featureId])
    }
  }

  return (
    <div className="space-y-3">
      {availableFeatures.map((feature) => (
        <label
          key={feature.id}
          className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
        >
          <input
            type="checkbox"
            checked={selectedFeatures.includes(feature.id)}
            onChange={() => toggleFeature(feature.id)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">{feature.name}</div>
            <div className="text-sm text-gray-500">{feature.description}</div>
          </div>
        </label>
      ))}
    </div>
  )
}
