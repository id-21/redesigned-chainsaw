import { PhotoshootFeatureGenerator } from '../PhotoshootGenerator'
import type { Product, Photoshoot, PhotoshootFeature } from '@/types'
import { createGeminiClient } from '@/lib/gemini/client'

/**
 * Feature generator for lifestyle photoshoots
 * Shows the product in real-world contexts (e.g., being worn, in use)
 */
export class LifestylePhotoshootGenerator extends PhotoshootFeatureGenerator {
  featureType = 'lifestyle'

  async generate(
    photoshoot: Photoshoot,
    product: Product,
    config?: Record<string, any>
  ): Promise<PhotoshootFeature> {
    const scene = config?.scene || 'casual outdoor setting'
    const model = config?.model || 'professional model'

    const geminiClient = createGeminiClient()
    const prompt = this.getPrompt(product, config)
    const imageUrl = await geminiClient.generateProductPhotoshoot(
      product.originalImageUrl,
      prompt,
      'lifestyle'
    )

    return {
      id: crypto.randomUUID(),
      photoshootId: photoshoot.id,
      featureType: this.featureType,
      featureData: {
        scene,
        model,
        prompt,
      },
      generatedImageUrl: imageUrl,
      createdAt: new Date(),
    }
  }

  getPrompt(product: Product, config?: Record<string, any>): string {
    const scene = config?.scene || 'casual outdoor setting'
    const model = config?.model || 'professional model'

    return `
Lifestyle photoshoot of ${product.name}:
- Scene: ${scene}
- Model: ${model}
- Natural, authentic atmosphere
- Product shown in realistic use
- Engaging composition
- Soft natural lighting
${config?.additionalDetails ? `- ${config.additionalDetails}` : ''}
`
  }

  validate(config?: Record<string, any>): boolean {
    if (config?.scene && typeof config.scene !== 'string') {
      return false
    }
    return true
  }
}
