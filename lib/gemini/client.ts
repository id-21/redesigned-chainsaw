import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GeminiConfig } from '@/types'

/**
 * Gemini API Client for image generation
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(config: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey)
    // Using Gemini 2.0 Flash for image generation
    this.model = this.genAI.getGenerativeModel({
      model: config.model || 'gemini-2.0-flash-exp',
    })
  }

  /**
   * Generate an image based on a text prompt
   * @param prompt - The text description of the image to generate
   * @param config - Additional generation configuration
   */
  async generateImage(
    prompt: string,
    config?: {
      negativePrompt?: string
      aspectRatio?: string
      numberOfImages?: number
    }
  ): Promise<string> {
    try {
      // Construct the full prompt with additional parameters
      const fullPrompt = this.constructPrompt(prompt, config)

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
      })

      const response = await result.response
      // Note: Actual image generation would return image data
      // This is a placeholder - the actual implementation depends on Gemini's image generation API
      return response.text()
    } catch (error) {
      console.error('Error generating image with Gemini:', error)
      throw new Error('Failed to generate image')
    }
  }

  /**
   * Generate a product photoshoot image from an existing product image
   * @param productImageUrl - URL of the original product image
   * @param prompt - Description of the desired photoshoot scene
   * @param style - Style of the photoshoot (e.g., 'professional', 'lifestyle', 'editorial')
   */
  async generateProductPhotoshoot(
    productImageUrl: string,
    prompt: string,
    style: string = 'professional'
  ): Promise<string> {
    const photoshootPrompt = `
Create a ${style} product photoshoot image.
Product reference: ${productImageUrl}
Scene description: ${prompt}
Requirements:
- High-quality, professional photography
- Proper lighting and shadows
- Clean, commercial-ready composition
- Focus on product details and appeal
`

    return this.generateImage(photoshootPrompt)
  }

  /**
   * Generate an image highlighting specific product features
   * @param productImageUrl - URL of the original product image
   * @param features - Array of features to highlight
   */
  async generateFeatureHighlight(
    productImageUrl: string,
    features: string[]
  ): Promise<string> {
    const featurePrompt = `
Create a product image highlighting these specific features:
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Product reference: ${productImageUrl}
Requirements:
- Clear close-up shots showing details
- Professional product photography style
- Annotate or highlight key features
- Clean white or neutral background
`

    return this.generateImage(featurePrompt)
  }

  /**
   * Construct a full prompt with additional parameters
   */
  private constructPrompt(
    basePrompt: string,
    config?: {
      negativePrompt?: string
      aspectRatio?: string
      numberOfImages?: number
    }
  ): string {
    let prompt = basePrompt

    if (config?.aspectRatio) {
      prompt += `\nAspect ratio: ${config.aspectRatio}`
    }

    if (config?.negativePrompt) {
      prompt += `\nAvoid: ${config.negativePrompt}`
    }

    return prompt
  }
}

/**
 * Create a Gemini client instance
 */
export function createGeminiClient(): GeminiClient {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  return new GeminiClient({ apiKey })
}
