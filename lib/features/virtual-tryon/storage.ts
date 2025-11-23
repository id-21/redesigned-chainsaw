// File upload and storage helpers for Virtual Try-On feature
// Uses Supabase Storage

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { UploadResult } from './types';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const GENERATED_ASSETS_BUCKET = 'generated-assets';

// =====================================================
// PRODUCT IMAGE UPLOAD
// =====================================================

export async function uploadProductImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const filename = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading product image:', error);
    throw new Error('Failed to upload image');
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filename);

  return {
    url: urlData.publicUrl,
    filename: data.path,
  };
}

// =====================================================
// GENERATED ASSET UPLOAD (for storing AI outputs)
// =====================================================

export async function uploadGeneratedAsset(
  file: Blob | File,
  userId: string,
  assetId: string
): Promise<UploadResult> {
  const filename = `${userId}/${assetId}/${Date.now()}.png`;

  const { data, error } = await supabaseAdmin.storage
    .from(GENERATED_ASSETS_BUCKET)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/png',
    });

  if (error) {
    console.error('Error uploading generated asset:', error);
    throw new Error('Failed to upload generated asset');
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(GENERATED_ASSETS_BUCKET)
    .getPublicUrl(filename);

  return {
    url: urlData.publicUrl,
    filename: data.path,
  };
}

// =====================================================
// DELETE FILES
// =====================================================

export async function deleteProductImage(filename: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([filename]);

  if (error) {
    console.error('Error deleting product image:', error);
    throw new Error('Failed to delete image');
  }
}

export async function deleteGeneratedAsset(filename: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(GENERATED_ASSETS_BUCKET)
    .remove([filename]);

  if (error) {
    console.error('Error deleting generated asset:', error);
    throw new Error('Failed to delete generated asset');
  }
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file size (max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be a JPG, PNG, or WEBP image',
    };
  }

  return { valid: true };
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
