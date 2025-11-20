import { photoshootGenerator } from './classes/PhotoshootGenerator'
import {
  FeatureHighlightGenerator,
  LifestylePhotoshootGenerator,
  StudioPhotoshootGenerator,
} from './classes/features'

/**
 * Initialize and register all available feature generators
 * This should be called once when the application starts
 */
export function initializeFeatureGenerators() {
  // Register all feature generators
  photoshootGenerator.registerFeature(new FeatureHighlightGenerator())
  photoshootGenerator.registerFeature(new LifestylePhotoshootGenerator())
  photoshootGenerator.registerFeature(new StudioPhotoshootGenerator())

  // Add more feature generators here as they are developed
  // photoshootGenerator.registerFeature(new CustomFeatureGenerator())

  console.log(
    'Registered feature generators:',
    photoshootGenerator.getAvailableFeatures()
  )
}
