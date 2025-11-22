-- Note: UUID extension not needed - using TEXT IDs for Clerk compatibility
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    -- Primary Key (TEXT to support Clerk user IDs like "user_...")
    id TEXT PRIMARY KEY,

    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    -- Note: If using Supabase Auth, password is handled separately

    -- User Info
    full_name VARCHAR(255),

    -- Role & Permissions
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    -- Options: 'user', 'admin'

    -- Credits System
    credits_remaining INTEGER NOT NULL DEFAULT 0,
    total_credits_purchased INTEGER DEFAULT 0,

    -- Account Status
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CHECK (role IN ('user', 'admin')),
    CHECK (credits_remaining >= 0)
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    -- Primary Key (TEXT with generated UUID string)
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

    -- User Association (TEXT to match users.id)
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Core Product Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),

    -- Product Images (URLs or paths)
    images JSONB NOT NULL DEFAULT '[]',
    -- Structure: [{"url": "...",  "filename": "...", "uploaded_at": "...", "is_primary": true}]

    -- Flexible User-Defined Fields
    custom_fields JSONB DEFAULT '{}',
    -- Structure: {"color": "red", "material": "cotton", "size": "M", ...}

    tags TEXT[] DEFAULT '{}',
    -- Array of tags: ["summer", "promotional", "bestseller"]

    -- System Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Indexes for products table
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_tags ON products USING GIN (tags);

-- =====================================================
-- 3. GENERATED ASSETS TABLE
-- =====================================================
CREATE TABLE generated_assets (
    -- Primary Key (TEXT with generated UUID string)
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

    -- Foreign Key to Products (TEXT to match products.id)
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- User Association (TEXT to match users.id)
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Generation Details
    generation_type VARCHAR(50) NOT NULL,
    -- e.g., "model_shot", "lifestyle",  "room_scene"

    prompt TEXT,
    -- The prompt used for generation

    generation_params JSONB DEFAULT '{}',
    -- Model settings: {"model": "gemini-1.5-pro", "temperature": 0.7, ...}

    -- Status Tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Options: 'pending', 'processing', 'completed', 'failed'

    is_successful BOOLEAN,
    error_message TEXT,

    -- Generated Files
    output_assets JSONB DEFAULT '[]',
    -- Structure: [{"url": "...", "filename": "...", "type": "image", "is_selected": true}]

    -- Metadata
    generation_duration_ms INTEGER,
    api_cost DECIMAL(10, 4),
    credits_used INTEGER DEFAULT 1,
    -- Number of credits deducted for this generation

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- User Selection
    is_favorited BOOLEAN DEFAULT false,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_notes TEXT
);

-- Indexes for generated_assets table
CREATE INDEX idx_generated_assets_product_id ON generated_assets(product_id);
CREATE INDEX idx_generated_assets_user_id ON generated_assets(user_id);
CREATE INDEX idx_generated_assets_status ON generated_assets(status);
CREATE INDEX idx_generated_assets_created_at ON generated_assets(created_at DESC);

-- =====================================================
-- 4. USAGE STATISTICS TABLE (Optional)
-- =====================================================
CREATE TABLE usage_stats (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    total_generations INTEGER DEFAULT 0,
    successful_generations INTEGER DEFAULT 0,
    failed_generations INTEGER DEFAULT 0,

    total_cost DECIMAL(10, 4) DEFAULT 0,
    total_duration_ms BIGINT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (user_id, date)
);

-- Indexes for usage_stats table
CREATE INDEX idx_usage_stats_user_date ON usage_stats(user_id, date DESC);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::TEXT = id);

-- Allow authenticated users to insert their own record
CREATE POLICY "Users can create own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::TEXT = id);

-- Products table policies
CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own products" ON products
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Generated assets table policies
CREATE POLICY "Users can view own generated assets" ON generated_assets
    FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert own generated assets" ON generated_assets
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own generated assets" ON generated_assets
    FOR UPDATE USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own generated assets" ON generated_assets
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Usage stats table policies
CREATE POLICY "Users can view own usage stats" ON usage_stats
    FOR SELECT USING (auth.uid()::TEXT = user_id);

-- =====================================================
-- 6. ADMIN POLICIES (Full access for admin role)
-- =====================================================

-- Admin policies for products
CREATE POLICY "Admins can view all products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::TEXT
            AND users.role = 'admin'
        )
    );

-- Admin policies for generated_assets
CREATE POLICY "Admins can view all generated assets" ON generated_assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::TEXT
            AND users.role = 'admin'
        )
    );

-- Admin policies for users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::TEXT
            AND users.role = 'admin'
        )
    );

-- Admin policies for usage_stats
CREATE POLICY "Admins can view all usage stats" ON usage_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::TEXT
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- 7. FUNCTIONS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_stats_updated_at BEFORE UPDATE ON usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();