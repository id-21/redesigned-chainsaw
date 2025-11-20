import { PhotoshootFeatureGenerator } from '../PhotoshootGenerator'
import type { Product, Photoshoot, PhotoshootFeature } from '@/types'
import { createGeminiClient } from '@/lib/gemini/client'

/**
 * Feature generator for professional studio photoshoots
 * Clean, commercial-ready product photography with professional lighting
 */
export class StudioPhotoshootGenerator extends PhotoshootFeatureGenerator {
  featureType = 'studio'

  async generate(
    photoshoot: Photoshoot,
    product: Product,
    config?: Record<string, any>
  ): Promise<PhotoshootFeature> {
    const background = config?.background || 'white'
    const lighting = config?.lighting || 'professional studio lighting'

    const geminiClient = createGeminiClient()
    const prompt = this.getPrompt(product, config)
    const imageUrl = await geminiClient.generateProductPhotoshoot(
      product.originalImageUrl,
      prompt,
      'professional'
    )

    return {
      id: crypto.randomUUID(),
      photoshootId: photoshoot.id,
      featureType: this.featureType,
      featureData: {
        background,
        lighting,
        prompt,
      },
      generatedImageUrl: imageUrl,
      createdAt: new Date(),
    }
  }

  getPrompt(product: Product, config?: Record<string, any>): string {
    const background = config?.background || 'white'
    const lighting = config?.lighting || 'professional studio lighting'
    const angle = config?.angle || 'front view'

    return `
Professional studio product photography of ${product.name}:
- Background: ${background}
- Lighting: ${lighting}
- Angle: ${angle}
- High resolution, sharp focus
- Commercial quality
- Clean, minimal aesthetic
- Perfect for eCommerce
${config?.additionalDetails ? `- ${config.additionalDetails}` : ''}
`
  }

  validate(config?: Record<string, any>): boolean {
    const validBackgrounds = ['white', 'black', 'gray', 'gradient', 'custom']
    if (config?.background && !validBackgrounds.includes(config.background) && config.background !== config.customBackground) {
      return false
    }
    return true
  }
}
