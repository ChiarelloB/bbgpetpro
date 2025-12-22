-- ===========================================
-- FIX: Remove conflicting RLS policies
-- The "Enable all for authenticated" policies with USING(true)
-- are overriding the tenant isolation policies!
-- ===========================================

-- CLIENTS - Remove permissive policy
DROP POLICY IF EXISTS "Enable all for authenticated" ON clients;

-- PETS - Remove permissive policy  
DROP POLICY IF EXISTS "Enable all for authenticated" ON pets;

-- APPOINTMENTS - Remove permissive policy
DROP POLICY IF EXISTS "Enable all for authenticated" ON appointments;

-- SERVICES - Remove permissive policies
DROP POLICY IF EXISTS "Enable all for authenticated" ON services;
DROP POLICY IF EXISTS "Enable all for anon" ON services;

-- FINANCIAL_TRANSACTIONS - Remove permissive policy
DROP POLICY IF EXISTS "Enable all for authenticated" ON financial_transactions;

-- RESOURCES - Remove permissive policy
DROP POLICY IF EXISTS "Enable all for authenticated" ON resources;

-- EXPENSES - Remove permissive policy
DROP POLICY IF EXISTS "All anon expenses" ON expenses;

-- SUBSCRIPTIONS - Remove conflicting policies (keep tenant isolation)
DROP POLICY IF EXISTS "Allow all for authenticated" ON subscriptions;
DROP POLICY IF EXISTS "Allow read access" ON subscriptions;

-- TEAM_MEMBERS - Add tenant isolation
DROP POLICY IF EXISTS "All anon team" ON team_members;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- Check if tenant_id exists before creating policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'tenant_id') THEN
        DROP POLICY IF EXISTS team_members_tenant_isolation ON team_members;
        CREATE POLICY team_members_tenant_isolation ON team_members
            FOR ALL USING (tenant_id = get_current_tenant_id())
            WITH CHECK (tenant_id = get_current_tenant_id());
    END IF;
END $$;

-- INVENTORY_ITEMS - Add tenant isolation
DROP POLICY IF EXISTS "Enable all for authenticated" ON inventory_items;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'tenant_id') THEN
        DROP POLICY IF EXISTS inventory_items_tenant_isolation ON inventory_items;
        CREATE POLICY inventory_items_tenant_isolation ON inventory_items
            FOR ALL USING (tenant_id = get_current_tenant_id())
            WITH CHECK (tenant_id = get_current_tenant_id());
    END IF;
END $$;

-- INVENTORY_MOVEMENTS - Add tenant isolation
DROP POLICY IF EXISTS "Enable all for authenticated" ON inventory_movements;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_movements' AND column_name = 'tenant_id') THEN
        DROP POLICY IF EXISTS inventory_movements_tenant_isolation ON inventory_movements;
        CREATE POLICY inventory_movements_tenant_isolation ON inventory_movements
            FOR ALL USING (tenant_id = get_current_tenant_id())
            WITH CHECK (tenant_id = get_current_tenant_id());
    END IF;
END $$;

-- PROFILES - Remove conflicting policies, keep tenant isolation
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON profiles;

-- Verify final policies
SELECT tablename, policyname, cmd, qual::text as using_clause
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'pets', 'appointments', 'services')
ORDER BY tablename, policyname;
