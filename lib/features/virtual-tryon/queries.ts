// Database queries for Virtual Try-On feature
// Uses Supabase client with Row Level Security (RLS)

import { supabaseAdmin } from '@/lib/supabase-admin';
import type {
  Product,
  GeneratedAsset,
  GeneratedAssetWithProduct,
  CreateProductInput,
  CreateGenerationInput,
  UserCredits,
} from './types';

// =====================================================
// PRODUCT QUERIES
// =====================================================

export async function getUserProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user products:', error);
    throw new Error('Failed to fetch products');
  }

  return data as Product[];
}

export async function getProductById(
  productId: string,
  userId: string
): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }

  return data as Product;
}

export async function createProduct(
  userId: string,
  input: CreateProductInput
): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
      sku: input.sku || null,
      images: input.images,
      custom_fields: input.custom_fields || {},
      tags: input.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }

  return data as Product;
}

export async function updateProduct(
  productId: string,
  userId: string,
  updates: Partial<CreateProductInput>
): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', productId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }

  return data as Product;
}

export async function deleteProduct(
  productId: string,
  userId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: false })
    .eq('id', productId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

// =====================================================
// GENERATED ASSET QUERIES
// =====================================================

export async function getUserGeneratedAssets(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<GeneratedAssetWithProduct[]> {
  const { data, error } = await supabaseAdmin
    .from('generated_assets')
    .select(`
      *,
      product:products(id, name, images)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching generated assets:', error);
    throw new Error('Failed to fetch generated assets');
  }

  return data as GeneratedAssetWithProduct[];
}

export async function getGeneratedAssetById(
  assetId: string,
  userId: string
): Promise<GeneratedAsset | null> {
  const { data, error } = await supabaseAdmin
    .from('generated_assets')
    .select('*')
    .eq('id', assetId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching generated asset:', error);
    throw new Error('Failed to fetch generated asset');
  }

  return data as GeneratedAsset;
}

export async function createGeneratedAsset(
  userId: string,
  input: CreateGenerationInput
): Promise<GeneratedAsset> {
  const { data, error } = await supabaseAdmin
    .from('generated_assets')
    .insert({
      user_id: userId,
      product_id: input.product_id,
      generation_type: input.generation_type,
      prompt: input.prompt || null,
      generation_params: input.generation_params || {},
      status: 'pending',
      output_assets: [],
      credits_used: 1, // Default, will be updated based on generation type
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating generated asset:', error);
    throw new Error('Failed to create generated asset');
  }

  return data as GeneratedAsset;
}

export async function updateGeneratedAsset(
  assetId: string,
  userId: string,
  updates: Partial<GeneratedAsset>
): Promise<GeneratedAsset> {
  const { data, error } = await supabaseAdmin
    .from('generated_assets')
    .update(updates)
    .eq('id', assetId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating generated asset:', error);
    throw new Error('Failed to update generated asset');
  }

  return data as GeneratedAsset;
}

export async function deleteGeneratedAsset(
  assetId: string,
  userId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('generated_assets')
    .delete()
    .eq('id', assetId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting generated asset:', error);
    throw new Error('Failed to delete generated asset');
  }
}

// =====================================================
// USER CREDIT QUERIES
// =====================================================

export async function getUserCredits(userId: string): Promise<UserCredits> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('credits_remaining, total_credits_purchased')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user credits:', error);
    throw new Error('Failed to fetch user credits');
  }

  return data as UserCredits;
}

export async function deductUserCredits(
  userId: string,
  amount: number
): Promise<number> {
  // First, get current credits
  const { data: userData, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user credits:', fetchError);
    throw new Error('Failed to fetch user credits');
  }

  const currentCredits = userData.credits_remaining;

  if (currentCredits < amount) {
    throw new Error('Insufficient credits');
  }

  // Deduct credits
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ credits_remaining: currentCredits - amount })
    .eq('id', userId)
    .select('credits_remaining')
    .single();

  if (error) {
    console.error('Error deducting credits:', error);
    throw new Error('Failed to deduct credits');
  }

  return data.credits_remaining;
}

export async function addUserCredits(
  userId: string,
  amount: number
): Promise<number> {
  const { data: userData, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('credits_remaining, total_credits_purchased')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user credits:', fetchError);
    throw new Error('Failed to fetch user credits');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      credits_remaining: userData.credits_remaining + amount,
      total_credits_purchased: userData.total_credits_purchased + amount,
    })
    .eq('id', userId)
    .select('credits_remaining')
    .single();

  if (error) {
    console.error('Error adding credits:', error);
    throw new Error('Failed to add credits');
  }

  return data.credits_remaining;
}
