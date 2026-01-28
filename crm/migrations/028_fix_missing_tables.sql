-- 1. Fix missing column in appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT '{}'::jsonb;

-- 2. Handle size_configs table (Create if not exists)
CREATE TABLE IF NOT EXISTS size_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    max_weight NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ensure tenant_id column exists (Fix for error 42703)
ALTER TABLE size_configs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 4. Enable RLS for size_configs
ALTER TABLE size_configs ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS policy for size_configs
DROP POLICY IF EXISTS size_configs_tenant_isolation ON size_configs;
CREATE POLICY size_configs_tenant_isolation ON size_configs
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());
    
-- 6. Add Unique Constraint (Optional but good practice, ignore error if exists)
-- ALTER TABLE size_configs ADD CONSTRAINT size_configs_category_tenant_id_key UNIQUE(category, tenant_id);
