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
