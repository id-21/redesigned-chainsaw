-- =====================================================
-- MIGRATION: Add output_image_count column
-- =====================================================
-- This migration adds support for per-image pricing for image generation models
-- like gemini-2.5-flash-image which charge $0.039 per generated image

-- Add the output_image_count column to api_usage_logs table
ALTER TABLE api_usage_logs
ADD COLUMN IF NOT EXISTS output_image_count INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN api_usage_logs.output_image_count IS
  'Number of images generated (for image generation models like gemini-2.5-flash-image)';

-- Update existing records: Set output_image_count to 1 for image generation endpoints
-- This is a one-time backfill for existing data
UPDATE api_usage_logs
SET output_image_count = 1
WHERE api_endpoint = '/api/virtual-tryon/generate'
  AND model_used = 'gemini-2.5-flash-image'
  AND output_image_count = 0;

-- Note: After running this migration, the background worker will automatically
-- recalculate costs for any records where api_cost_usd is NULL
