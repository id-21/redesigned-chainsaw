// Cost calculation utilities for Gemini API usage tracking

import type { ApiUsageLog } from '../types';

// =====================================================
// PRICING CONFIGURATION
// =====================================================

/**
 * Gemini API Pricing (USD per 1 million tokens or per image)
 * Source: https://ai.google.dev/pricing
 *
 * UPDATE THESE WITH ACTUAL PRICING FROM GOOGLE
 */
interface GeminiPricing {
  [model: string]: {
    inputPerMillion: number; // Cost per 1M input tokens (text + image + thinking)
    outputPerMillion?: number; // Cost per 1M output tokens (for text output models)
    outputPerImage?: number; // Cost per generated image (for image generation models)
  };
}

const GEMINI_PRICING: GeminiPricing = {
  'gemini-2.5-flash-image': {
    inputPerMillion: 0.3, // $0.30 per 1M input tokens
    outputPerImage: 0.039, // $0.039 per generated image
  },
  'gemini-2.0-flash-exp': {
    inputPerMillion: 0.0, // Free during experimental phase
    outputPerMillion: 0.0,
  },
  'gemini-2.5-flash-lite': {
    inputPerMillion: 0.1, // $0.10 per 1M input tokens
    outputPerMillion: 0.4, // $0.40 per 1M output tokens
  },
};

/**
 * USD to INR Exchange Rate
 * UPDATE THIS WITH YOUR PREFERRED RATE OR FETCH FROM API
 */
const USD_TO_INR_RATE = 95.0; // Example: 1 USD = 85 INR

// =====================================================
// IMAGE TOKEN CALCULATION
// =====================================================

/**
 * Calculate image input tokens based on dimensions
 *
 * Gemini 2.5/2.0 Flash image token calculation:
 * - Images ≤384px (width AND height): 258 tokens
 * - Larger images: 258 tokens per 768x768 tile
 *
 * Formula for larger images:
 * 1. Calculate crop unit size: min(width, height) / 1.5
 * 2. Calculate tiles: ceil(width/cropUnit) * ceil(height/cropUnit)
 * 3. Total tokens: tiles * 258
 *
 * @param width Image width in pixels
 * @param height Image height in pixels
 * @returns Number of tokens consumed by the image
 */
export function calculateImageTokens(width: number, height: number): number {
  // Small images (both dimensions ≤384px)
  if (width <= 384 && height <= 384) {
    return 258;
  }

  // Larger images - calculate tiles
  const cropUnitSize = Math.floor(Math.min(width, height) / 1.5);
  const tilesX = Math.ceil(width / cropUnitSize);
  const tilesY = Math.ceil(height / cropUnitSize);
  const totalTiles = tilesX * tilesY;

  return totalTiles * 258;
}

/**
 * Get image dimensions from various sources
 *
 * This is a placeholder - in production you would:
 * - For Node.js: Use `sharp` or `image-size` library
 * - For browser: Use Image API or canvas
 * - For URLs: Fetch and analyze
 *
 * @param imageSource Image URL, Buffer, or base64 string
 * @returns Promise with width and height
 */
export async function getImageDimensions(
  imageSource: string | Buffer
): Promise<{ width: number; height: number }> {
  // PLACEHOLDER IMPLEMENTATION
  // In production, implement actual image dimension detection
  // For now, return a conservative estimate (1024x1024)
  return { width: 1024, height: 1024 };
}

// =====================================================
// COST CALCULATION
// =====================================================

/**
 * Calculate API cost from usage log
 *
 * Supports two pricing models:
 * 1. Token-based: Cost per million input/output tokens (for text models)
 * 2. Image-based: Cost per generated image (for image generation models)
 *
 * @param usageLog The API usage log entry
 * @returns Cost in USD
 */
export function calculateApiCost(usageLog: ApiUsageLog): number {
  const pricing = GEMINI_PRICING[usageLog.model_used];

  if (!pricing) {
    console.warn(
      `No pricing found for model: ${usageLog.model_used}. Returning $0.`
    );
    return 0;
  }

  // Calculate total input tokens (text + images + thinking)
  const totalInputTokens =
    usageLog.prompt_tokens +
    usageLog.prompt_image_tokens +
    usageLog.thinking_tokens;

  // Calculate input cost (always token-based)
  const inputCost = (totalInputTokens / 1_000_000) * pricing.inputPerMillion;

  // Calculate output cost based on pricing model
  let outputCost = 0;

  if (pricing.outputPerImage !== undefined) {
    // Image generation model: Cost per image
    outputCost = usageLog.output_image_count * pricing.outputPerImage;
  } else if (pricing.outputPerMillion !== undefined) {
    // Text model: Cost per million output tokens
    outputCost = (usageLog.output_tokens / 1_000_000) * pricing.outputPerMillion;
  }

  // Total cost in USD
  return inputCost + outputCost;
}

/**
 * Get current USD to INR exchange rate
 *
 * In production, you might:
 * - Fetch from a currency API (e.g., exchangerate-api.com)
 * - Store in environment variables
 * - Cache and update daily
 *
 * @returns Exchange rate (USD to INR)
 */
export function getUsdToInrRate(): number {
  return USD_TO_INR_RATE;
}

/**
 * Convert USD to INR
 *
 * @param usd Amount in USD
 * @returns Amount in INR
 */
export function convertUsdToInr(usd: number): number {
  return usd * USD_TO_INR_RATE;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Format cost for display
 *
 * @param cost Cost amount
 * @param currency Currency code ('USD' or 'INR')
 * @returns Formatted cost string
 */
export function formatCost(cost: number, currency: 'USD' | 'INR'): string {
  if (currency === 'USD') {
    return `$${cost.toFixed(6)}`; // USD shows 6 decimals for micro-costs
  } else {
    return `₹${cost.toFixed(2)}`; // INR shows 2 decimals
  }
}

/**
 * Calculate cost per 1000 tokens
 *
 * Useful for comparing efficiency across different operations
 *
 * @param totalCost Total cost
 * @param totalTokens Total tokens used
 * @returns Cost per 1000 tokens
 */
export function calculateCostPerThousandTokens(
  totalCost: number,
  totalTokens: number
): number {
  if (totalTokens === 0) return 0;
  return (totalCost / totalTokens) * 1000;
}
