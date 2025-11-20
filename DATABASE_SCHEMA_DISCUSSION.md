# Database Schema Discussion Guide

This document outlines the key questions and considerations for designing the Supabase database schema.

## Current Proposed Schema

```sql
-- Core tables
vendors
  ├── products
  │     └── photoshoots
  │           └── photoshoot_features
```

## Questions to Address

### 1. Vendor/User Management

**Option A: Simple Single-User Vendors**
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Option B: Multi-User Organizations**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  company_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT, -- 'admin', 'member', 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Questions:**
- Single user per vendor or team support?
- Role-based permissions needed?
- Separate user authentication or use Supabase Auth?

### 2. Product Schema

**Minimal Approach:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  name TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Comprehensive Approach:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  sku TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  -- Product attributes
  brand TEXT,
  material TEXT,
  colors TEXT[],
  sizes TEXT[],
  -- Image storage
  original_image_url TEXT NOT NULL,
  additional_images TEXT[],
  -- Metadata
  tags TEXT[],
  metadata JSONB,
  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'deleted'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Questions:**
- How much product metadata do vendors need to store?
- Should we support product variants (e.g., same shirt in different colors)?
- Do we need product categories/taxonomy?
- Should products have tags for searching?

### 3. Photoshoot Schema

**Current Design:**
```sql
CREATE TABLE photoshoots (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  vendor_id UUID REFERENCES vendors(id), -- Denormalized for fast queries
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  generated_image_url TEXT,
  prompt TEXT,
  metadata JSONB, -- Generation parameters, costs, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Questions:**
- Should we store generation costs per photoshoot?
- Do we need versioning (multiple generations of same product)?
- Should we track which Gemini model was used?
- How should we handle failed generations?
- Do we need a separate table for generation history/audit?

### 4. Feature Storage

**Current Design (Flexible):**
```sql
CREATE TABLE photoshoot_features (
  id UUID PRIMARY KEY,
  photoshoot_id UUID REFERENCES photoshoots(id),
  feature_type TEXT NOT NULL, -- 'studio', 'lifestyle', 'feature_highlight'
  feature_data JSONB NOT NULL, -- Feature-specific config
  generated_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Alternative (Structured):**
```sql
CREATE TABLE photoshoot_features (
  id UUID PRIMARY KEY,
  photoshoot_id UUID REFERENCES photoshoots(id),
  feature_type TEXT NOT NULL,
  -- Structured columns instead of JSONB
  scene_description TEXT,
  lighting_type TEXT,
  background_color TEXT,
  model_type TEXT,
  highlighted_features TEXT[],
  -- Image data
  generated_image_url TEXT,
  generation_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Questions:**
- JSONB for flexibility vs structured columns for validation?
- Should each feature type have its own table?
- How do we ensure extensibility for future features?

### 5. Image Storage

**Questions:**
- Where should images be stored?
  - Supabase Storage (integrated, easy RLS)
  - AWS S3 (scalable, CDN-ready)
  - Cloudinary (image optimization built-in)
- Should we store both original and optimized versions?
- Do we need image versioning?
- Should we track image metadata (size, dimensions, format)?

**Proposed Image Metadata Table:**
```sql
CREATE TABLE images (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'product', 'photoshoot', 'feature'
  entity_id UUID NOT NULL,
  url TEXT NOT NULL,
  storage_provider TEXT, -- 'supabase', 's3', 'cloudinary'
  storage_path TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Usage & Billing

**Questions:**
- Should we track API usage per vendor?
- Do we need to implement quotas/limits?
- Should we track costs for each generation?

**Proposed Usage Table:**
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  action_type TEXT, -- 'photoshoot_generation', 'feature_generation'
  resource_id UUID, -- photoshoot_id or feature_id
  api_cost DECIMAL(10,4),
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vendor_quotas (
  vendor_id UUID PRIMARY KEY REFERENCES vendors(id),
  monthly_quota INTEGER DEFAULT 100,
  used_this_month INTEGER DEFAULT 0,
  reset_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Additional Considerations

**a) Settings/Preferences**
```sql
CREATE TABLE vendor_settings (
  vendor_id UUID PRIMARY KEY REFERENCES vendors(id),
  default_style TEXT, -- 'professional', 'lifestyle'
  default_background TEXT,
  api_preferences JSONB,
  notification_preferences JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**b) Templates (Future Feature)**
```sql
CREATE TABLE photoshoot_templates (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  name TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT,
  default_features TEXT[],
  config JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**c) Generation Queue (For Async Processing)**
```sql
CREATE TABLE generation_queue (
  id UUID PRIMARY KEY,
  photoshoot_id UUID REFERENCES photoshoots(id),
  status TEXT DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

## Recommended Approach

### Phase 1: MVP Schema
Start with minimal tables to get the app working:
- `vendors` (simple, single-user)
- `products` (name, image, basic metadata)
- `photoshoots` (status, image, prompt)
- `photoshoot_features` (JSONB for flexibility)

### Phase 2: Production Features
Add as needed:
- Usage tracking and quotas
- Image metadata table
- Settings/preferences
- Generation queue for async processing

### Phase 3: Advanced Features
- Multi-user organizations
- Templates
- Advanced analytics
- Product variants

## Row Level Security (RLS)

All tables should have RLS policies to ensure vendors can only access their own data:

```sql
-- Example for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own products"
  ON products FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own products"
  ON products FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

-- Similar policies for all tables
```

## Indexes for Performance

```sql
-- Frequently queried columns
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_photoshoots_product_id ON photoshoots(product_id);
CREATE INDEX idx_photoshoots_vendor_id ON photoshoots(vendor_id);
CREATE INDEX idx_photoshoots_status ON photoshoots(status);
CREATE INDEX idx_features_photoshoot_id ON photoshoot_features(photoshoot_id);

-- For JSONB queries (if using metadata heavily)
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);
CREATE INDEX idx_photoshoots_metadata ON photoshoots USING GIN (metadata);
```

## Next Steps

1. Review the questions above
2. Decide on the initial schema scope (recommend Phase 1 for MVP)
3. Implement the schema in Supabase
4. Add RLS policies
5. Create indexes
6. Update the TypeScript types to match
7. Implement the data access layer in `lib/supabase/`

## Discussion Points

Please provide feedback on:

1. **Vendor Structure**: Single-user or multi-user organizations?
2. **Product Attributes**: Which fields are essential for your use case?
3. **Image Storage**: Preference for Supabase Storage, S3, or other?
4. **Billing**: Do we need usage tracking and quotas from day 1?
5. **MVP Scope**: Start minimal or include more features upfront?
