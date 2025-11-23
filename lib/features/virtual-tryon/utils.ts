// Utility functions for Virtual Try-On feature

import type { GeneratedAsset } from './types';

// =====================================================
// DATE FORMATTING
// =====================================================

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than 1 day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than 1 week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// =====================================================
// STATUS HELPERS
// =====================================================

export function getStatusColor(
  status: GeneratedAsset['status']
): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(status: GeneratedAsset['status']): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'processing':
      return 'Processing';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}

// =====================================================
// GENERATION TYPE HELPERS
// =====================================================

export function getGenerationTypeLabel(type: string): string {
  switch (type) {
    case 'model_shot':
      return 'Model Shot';
    case 'lifestyle':
      return 'Lifestyle';
    case 'room_scene':
      return 'Room Scene';
    default:
      return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

export const GENERATION_TYPES = [
  { value: 'model_shot', label: 'Model Shot', credits: 1 },
  { value: 'lifestyle', label: 'Lifestyle', credits: 1 },
  { value: 'room_scene', label: 'Room Scene', credits: 2 },
] as const;

export function getGenerationTypeCredits(type: string): number {
  const generationType = GENERATION_TYPES.find((t) => t.value === type);
  return generationType?.credits ?? 1;
}

// =====================================================
// FILE SIZE FORMATTING
// =====================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// =====================================================
// CREDIT DISPLAY
// =====================================================

export function formatCredits(credits: number): string {
  return credits.toLocaleString();
}

export function getCreditWarningLevel(credits: number): 'none' | 'low' | 'critical' {
  if (credits === 0) return 'critical';
  if (credits < 5) return 'low';
  return 'none';
}

// =====================================================
// IMAGE HELPERS
// =====================================================

export function getImageThumbnail(
  images: Array<{ url: string; is_primary?: boolean }>
): string | null {
  if (!images || images.length === 0) return null;

  // Find primary image
  const primaryImage = images.find((img) => img.is_primary);
  if (primaryImage) return primaryImage.url;

  // Return first image
  return images[0].url;
}

export function downloadImage(url: string, filename: string): void {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    })
    .catch((error) => {
      console.error('Error downloading image:', error);
    });
}
