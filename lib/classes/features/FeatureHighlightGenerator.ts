import { PhotoshootFeatureGenerator } from '../PhotoshootGenerator'
import type { Product, Photoshoot, PhotoshootFeature } from '@/types'
import { createGeminiClient } from '@/lib/gemini/client'

/**
 * Feature generator for highlighting specific product features
 * Example: close-ups of fabric texture, stitching details, zippers, etc.
 */
export class FeatureHighlightGenerator extends PhotoshootFeatureGenerator {
  featureType = 'feature_highlight'

  async generate(
    photoshoot: Photoshoot,
    product: Product,
    config?: Record<string, any>
  ): Promise<PhotoshootFeature> {
    const features = config?.features || [
      'fabric texture',
      'stitching quality',
      'material details',
    ]

    const geminiClient = createGeminiClient()
    const imageUrl = await geminiClient.generateFeatureHighlight(
      product.originalImageUrl,
      features
    )

    return {
      id: crypto.randomUUID(),
      photoshootId: photoshoot.id,
      featureType: this.featureType,
      featureData: {
        highlightedFeatures: features,
        prompt: this.getPrompt(product, config),
      },
      generatedImageUrl: imageUrl,
      createdAt: new Date(),
    }
  }

  getPrompt(product: Product, config?: Record<string, any>): string {
    const features = config?.features || ['product features']
    return `Professional close-up shots highlighting: ${features.join(', ')} for ${product.name}`
  }

  validate(config?: Record<string, any>): boolean {
    if (config?.features && !Array.isArray(config.features)) {
      return false
    }
    return true
  }
}
