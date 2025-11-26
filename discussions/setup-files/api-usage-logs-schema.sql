-- =====================================================
-- API USAGE LOGS TABLE
-- =====================================================
-- This table tracks all Gemini API calls for cost tracking and analytics
-- Run this schema in Supabase SQL Editor to create the table

CREATE TABLE api_usage_logs (
  -- Primary Key (TEXT with generated UUID string, consistent with existing schema)
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

  -- Foreign Keys (TEXT to match existing schema)
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_asset_id TEXT REFERENCES generated_assets(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,

  -- API Call Metadata
  api_endpoint VARCHAR(255) NOT NULL,
  -- e.g., '/api/virtual-tryon/generate', '/api/virtual-tryon/analyze-product'

  model_used VARCHAR(100) NOT NULL,
  -- e.g., 'gemini-2.5-flash-image', 'gemini-2.0-flash-exp'

  -- Raw Response Data (complete audit trail)
  raw_response_metadata JSONB,
  -- Store complete usageMetadata JSON from Gemini API response

  -- Parsed Token Counts
  prompt_tokens INTEGER NOT NULL,
  -- Text input tokens (from usageMetadata.promptTokenCount)

  prompt_image_tokens INTEGER DEFAULT 0,
  -- Image input tokens (calculated based on image dimensions)

  output_tokens INTEGER NOT NULL,
  -- Response tokens (from usageMetadata.candidatesTokenCount)

  output_image_count INTEGER DEFAULT 0,
  -- Number of images generated (for image generation models like gemini-2.5-flash-image)

  thinking_tokens INTEGER DEFAULT 0,
  -- Thinking tokens for 2.5 models (from usageMetadata.thoughtsTokenCount)

  total_tokens INTEGER NOT NULL,
  -- Total from API (from usageMetadata.totalTokenCount)

  -- Cost (calculated asynchronously by background worker)
  api_cost_usd DECIMAL(10, 6),
  -- Calculated cost in USD (nullable until calculated)

  api_cost_inr DECIMAL(10, 2),
  -- Cost converted to INR (nullable until calculated)

  usd_to_inr_rate DECIMAL(10, 4),
  -- Exchange rate used for USD to INR conversion

  cost_calculated_at TIMESTAMP WITH TIME ZONE,
  -- When cost was calculated

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Fast lookups by user
CREATE INDEX idx_api_usage_logs_user_id ON api_usage_logs(user_id);

-- Fast date range queries
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);

-- Fast filtering by endpoint
CREATE INDEX idx_api_usage_logs_api_endpoint ON api_usage_logs(api_endpoint);

-- Fast filtering by model
CREATE INDEX idx_api_usage_logs_model_used ON api_usage_logs(model_used);

-- Efficient background worker queries for unpriced logs
CREATE INDEX idx_api_usage_logs_cost_null ON api_usage_logs(created_at)
  WHERE api_cost_usd IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own API usage logs
CREATE POLICY "Users can view own api usage logs" ON api_usage_logs
    FOR SELECT USING (auth.uid()::TEXT = user_id);

-- Admins can view all API usage logs
CREATE POLICY "Admins can view all api usage logs" ON api_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::TEXT
            AND users.role = 'admin'
        )
    );

-- Note: INSERT/UPDATE/DELETE operations should be done using
-- the Supabase service role key (not user context) from API routes

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE api_usage_logs IS 'Tracks all Gemini API calls with token usage and costs for analytics';
COMMENT ON COLUMN api_usage_logs.raw_response_metadata IS 'Complete usageMetadata JSON from Gemini API for audit trail';
COMMENT ON COLUMN api_usage_logs.prompt_image_tokens IS 'Calculated image tokens (258 per tile for Gemini 2.5/2.0)';
COMMENT ON COLUMN api_usage_logs.api_cost_usd IS 'Cost in USD, calculated asynchronously by background worker';
COMMENT ON COLUMN api_usage_logs.api_cost_inr IS 'Cost in INR for user-facing pricing and Stripe integration';
