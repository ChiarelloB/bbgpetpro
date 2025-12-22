-- ===========================================
-- MULTI-TENANCY MIGRATION - STEP 3
-- Enable RLS and create policies for all tables
-- ===========================================

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== CLIENTS ==========
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS clients_tenant_isolation ON clients;
CREATE POLICY clients_tenant_isolation ON clients
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

-- ========== PETS ==========
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pets_tenant_isolation ON pets;
CREATE POLICY pets_tenant_isolation ON pets
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

-- ========== APPOINTMENTS ==========
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS appointments_tenant_isolation ON appointments;
CREATE POLICY appointments_tenant_isolation ON appointments
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

-- ========== SERVICES ==========
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS services_tenant_isolation ON services;
CREATE POLICY services_tenant_isolation ON services
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

-- ========== FINANCIAL_TRANSACTIONS ==========
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS financial_transactions_tenant_isolation ON financial_transactions;
CREATE POLICY financial_transactions_tenant_isolation ON financial_transactions
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

-- ========== RESOURCES ==========
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS resources_tenant_isolation ON resources;
CREATE POLICY resources_tenant_isolation ON resources
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

-- ========== PROFILES (special case) ==========
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_tenant_isolation ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_tenant_isolation ON profiles
    FOR SELECT
    USING (tenant_id = get_current_tenant_id() OR id = auth.uid());
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (id = auth.uid());

-- ==== OPTIONAL TABLES (only if they exist) ====

-- products (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        EXECUTE 'ALTER TABLE products ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS products_tenant_isolation ON products';
        EXECUTE 'CREATE POLICY products_tenant_isolation ON products FOR ALL USING (tenant_id = get_current_tenant_id())';
    END IF;
END $$;

-- expenses (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses') THEN
        EXECUTE 'ALTER TABLE expenses ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS expenses_tenant_isolation ON expenses';
        EXECUTE 'CREATE POLICY expenses_tenant_isolation ON expenses FOR ALL USING (tenant_id = get_current_tenant_id())';
    END IF;
END $$;

-- subscriptions (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        EXECUTE 'ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS subscriptions_tenant_isolation ON subscriptions';
        EXECUTE 'CREATE POLICY subscriptions_tenant_isolation ON subscriptions FOR ALL USING (tenant_id = get_current_tenant_id())';
    END IF;
END $$;

-- checklist_templates (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'checklist_templates') THEN
        EXECUTE 'ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS checklist_templates_tenant_isolation ON checklist_templates';
        EXECUTE 'CREATE POLICY checklist_templates_tenant_isolation ON checklist_templates FOR ALL USING (tenant_id = get_current_tenant_id())';
    END IF;
END $$;
