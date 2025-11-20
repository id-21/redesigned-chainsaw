import type { Product, Photoshoot, PhotoshootFeature } from '@/types'

/**
 * Abstract base class for photoshoot generation features
 * This allows for easy extensibility - new features can be added by extending this class
 */
export abstract class PhotoshootFeatureGenerator {
  abstract featureType: string

  /**
   * Generate a specific feature for a photoshoot
   * @param photoshoot - The photoshoot to generate features for
   * @param product - The original product data
   * @param config - Feature-specific configuration
   */
  abstract generate(
    photoshoot: Photoshoot,
    product: Product,
    config?: Record<string, any>
  ): Promise<PhotoshootFeature>

  /**
   * Get the prompt for this feature type
   * @param product - The product data
   * @param config - Feature-specific configuration
   */
  abstract getPrompt(product: Product, config?: Record<string, any>): string

  /**
   * Validate the feature configuration
   * @param config - Feature configuration to validate
   */
  validate(config?: Record<string, any>): boolean {
    return true
  }
}

/**
 * Main PhotoshootGenerator class that orchestrates the generation process
 */
export class PhotoshootGenerator {
  private features: Map<string, PhotoshootFeatureGenerator> = new Map()

  /**
   * Register a new feature generator
   * @param generator - The feature generator to register
   */
  registerFeature(generator: PhotoshootFeatureGenerator): void {
    this.features.set(generator.featureType, generator)
  }

  /**
   * Get a registered feature generator
   * @param featureType - The type of feature to retrieve
   */
  getFeature(featureType: string): PhotoshootFeatureGenerator | undefined {
    return this.features.get(featureType)
  }

  /**
   * Get all registered feature types
   */
  getAvailableFeatures(): string[] {
    return Array.from(this.features.keys())
  }

  /**
   * Generate a photoshoot with optional features
   * @param product - The product to generate a photoshoot for
   * @param featureTypes - Array of feature types to generate
   * @param config - Configuration for each feature
   */
  async generateWithFeatures(
    product: Product,
    photoshoot: Photoshoot,
    featureTypes: string[] = [],
    config?: Record<string, Record<string, any>>
  ): Promise<PhotoshootFeature[]> {
    const features: PhotoshootFeature[] = []

    for (const featureType of featureTypes) {
      const generator = this.getFeature(featureType)
      if (!generator) {
        console.warn(`Feature generator not found for type: ${featureType}`)
        continue
      }

      const featureConfig = config?.[featureType]
      if (!generator.validate(featureConfig)) {
        console.warn(`Invalid configuration for feature: ${featureType}`)
        continue
      }

      try {
        const feature = await generator.generate(photoshoot, product, featureConfig)
        features.push(feature)
      } catch (error) {
        console.error(`Error generating feature ${featureType}:`, error)
      }
    }

    return features
  }
}

/**
 * Singleton instance of PhotoshootGenerator
 */
export const photoshootGenerator = new PhotoshootGenerator()
