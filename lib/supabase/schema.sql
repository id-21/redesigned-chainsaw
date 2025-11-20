-- This schema file will be populated after discussion with the user
-- It will include tables for:
-- - vendors
-- - products
-- - photoshoots
-- - photoshoot_features
-- - Any additional tables as discussed

-- Example structure (to be refined):

-- CREATE TABLE vendors (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   email TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- CREATE TABLE products (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
--   name TEXT NOT NULL,
--   description TEXT,
--   category TEXT,
--   original_image_url TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- CREATE TABLE photoshoots (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   product_id UUID REFERENCES products(id) ON DELETE CASCADE,
--   vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
--   status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
--   generated_image_url TEXT,
--   prompt TEXT,
--   metadata JSONB,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- CREATE TABLE photoshoot_features (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   photoshoot_id UUID REFERENCES photoshoots(id) ON DELETE CASCADE,
--   feature_type TEXT NOT NULL,
--   feature_data JSONB NOT NULL,
--   generated_image_url TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Indexes for performance
-- CREATE INDEX idx_products_vendor_id ON products(vendor_id);
-- CREATE INDEX idx_photoshoots_product_id ON photoshoots(product_id);
-- CREATE INDEX idx_photoshoots_vendor_id ON photoshoots(vendor_id);
-- CREATE INDEX idx_photoshoot_features_photoshoot_id ON photoshoot_features(photoshoot_id);
