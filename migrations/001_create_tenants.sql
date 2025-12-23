-- ===========================================
-- MULTI-TENANCY MIGRATION - STEP 1
-- Create tenants table and add tenant_id to profiles
-- ===========================================

-- 1. Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#FF6B00',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create default tenant for existing data (Flow Pet)
INSERT INTO tenants (id, name, slug, logo_url)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Flow Pet',
    'flowpet',
    NULL
) ON CONFLICT (slug) DO NOTHING;

-- 3. Add tenant_id to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) 
DEFAULT '00000000-0000-0000-0000-000000000001';

-- 4. Update existing profiles to have the default tenant
UPDATE profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);

-- 6. Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policy: Users can only see their own tenant
CREATE POLICY tenant_read_own ON tenants
    FOR SELECT
    USING (id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
