// Type definitions for Virtual Try-On feature

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  images: ProductImage[];
  custom_fields: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProductImage {
  url: string;
  filename: string;
  uploaded_at: string;
  is_primary: boolean;
}

export interface GeneratedAsset {
  id: string;
  product_id: string;
  user_id: string;
  generation_type: string;
  prompt: string | null;
  generation_params: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  is_successful: boolean | null;
  error_message: string | null;
  output_assets: OutputAsset[];
  generation_duration_ms: number | null;
  api_cost: number | null;
  credits_used: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  is_favorited: boolean;
  user_rating: number | null;
  user_notes: string | null;
}

export interface OutputAsset {
  url: string;
  filename: string;
  type: 'image' | 'video';
  is_selected: boolean;
}

export interface GeneratedAssetWithProduct extends GeneratedAsset {
  product: Pick<Product, 'id' | 'name' | 'images'>;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  sku?: string;
  images: ProductImage[];
  custom_fields?: Record<string, any>;
  tags?: string[];
}

export interface CreateGenerationInput {
  product_id: string;
  generation_type: string;
  prompt?: string;
  generation_params?: Record<string, any>;
}

export interface UploadResult {
  url: string;
  filename: string;
}

export interface UserCredits {
  credits_remaining: number;
  total_credits_purchased: number;
}

// =====================================================
// API USAGE LOGGING TYPES
// =====================================================

export interface ApiUsageLog {
  id: string;
  user_id: string;
  generated_asset_id: string | null;
  product_id: string | null;
  api_endpoint: string;
  model_used: string;
  raw_response_metadata: any;
  prompt_tokens: number;
  prompt_image_tokens: number;
  output_tokens: number;
  output_image_count: number; // Number of images generated (for image generation models)
  thinking_tokens: number;
  total_tokens: number;
  api_cost_usd: number | null;
  api_cost_inr: number | null;
  usd_to_inr_rate: number | null;
  cost_calculated_at: string | null;
  created_at: string;
}

export interface CreateApiUsageLogInput {
  user_id: string;
  generated_asset_id?: string;
  product_id?: string;
  api_endpoint: string;
  model_used: string;
  raw_response_metadata: any;
  prompt_tokens: number;
  prompt_image_tokens?: number;
  output_tokens: number;
  output_image_count?: number; // Number of images generated (for image generation models)
  thinking_tokens?: number;
  total_tokens: number;
}
