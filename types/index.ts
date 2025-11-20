// Core entity types - these will be refined after schema discussion

export interface Vendor {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  vendorId: string
  name: string
  description?: string
  category: string
  originalImageUrl: string
  createdAt: Date
  updatedAt: Date
}

export interface Photoshoot {
  id: string
  productId: string
  vendorId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  generatedImageUrl?: string
  prompt?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface PhotoshootFeature {
  id: string
  photoshootId: string
  featureType: string
  featureData: Record<string, any>
  generatedImageUrl?: string
  createdAt: Date
}

// Request/Response types for API

export interface GeneratePhotoshootRequest {
  productId: string
  prompt?: string
  style?: string
  background?: string
  additionalFeatures?: string[]
}

export interface GeneratePhotoshootResponse {
  photoshootId: string
  status: string
  imageUrl?: string
  message?: string
}

export interface FeatureGenerationRequest {
  photoshootId: string
  featureType: string
  customPrompt?: string
  featureConfig?: Record<string, any>
}

// Configuration types

export interface GeminiConfig {
  apiKey: string
  model?: string
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
  }
}

export interface SupabaseConfig {
  url: string
  anonKey: string
}
