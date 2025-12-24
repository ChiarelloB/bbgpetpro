-- ===========================================
-- FIX: Ensure RLS is working correctly for multi-tenancy
-- ===========================================

-- 1. First, check if the function exists and recreate it
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
    tid UUID;
BEGIN
    SELECT tenant_id INTO tid FROM profiles WHERE id = auth.uid();
    RETURN tid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Drop all existing policies and recreate them properly
-- CLIENTS
DROP POLICY IF EXISTS clients_tenant_isolation ON clients;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY clients_tenant_isolation ON clients
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- PETS
DROP POLICY IF EXISTS pets_tenant_isolation ON pets;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY pets_tenant_isolation ON pets
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- APPOINTMENTS
DROP POLICY IF EXISTS appointments_tenant_isolation ON appointments;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY appointments_tenant_isolation ON appointments
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- SERVICES
DROP POLICY IF EXISTS services_tenant_isolation ON services;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY services_tenant_isolation ON services
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- FINANCIAL_TRANSACTIONS
DROP POLICY IF EXISTS financial_transactions_tenant_isolation ON financial_transactions;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY financial_transactions_tenant_isolation ON financial_transactions
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- RESOURCES
DROP POLICY IF EXISTS resources_tenant_isolation ON resources;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY resources_tenant_isolation ON resources
    FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- PROFILES (users can see other users from same tenant)
DROP POLICY IF EXISTS profiles_tenant_isolation ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_tenant_isolation ON profiles
    FOR SELECT
    USING (tenant_id = get_current_tenant_id() OR id = auth.uid());
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (id = auth.uid());
CREATE POLICY profiles_insert_own ON profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- 3. Create trigger to auto-set tenant_id on new records
CREATE OR REPLACE FUNCTION set_tenant_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := get_current_tenant_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to main tables
DROP TRIGGER IF EXISTS set_tenant_id_clients ON clients;
CREATE TRIGGER set_tenant_id_clients BEFORE INSERT ON clients FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_pets ON pets;
CREATE TRIGGER set_tenant_id_pets BEFORE INSERT ON pets FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_appointments ON appointments;
CREATE TRIGGER set_tenant_id_appointments BEFORE INSERT ON appointments FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_services ON services;
CREATE TRIGGER set_tenant_id_services BEFORE INSERT ON services FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_resources ON resources;
CREATE TRIGGER set_tenant_id_resources BEFORE INSERT ON resources FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_financial ON financial_transactions;
CREATE TRIGGER set_tenant_id_financial BEFORE INSERT ON financial_transactions FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

-- 4. Verify the new user has correct tenant_id
-- Run this query to check: SELECT id, email, tenant_id FROM auth.users JOIN profiles ON auth.users.id = profiles.id;
