-- ===========================================
-- Migration: 017_client_app_rls.sql
-- Purpose: RLS policies for client app (pet owners) to access their data
-- ===========================================

-- 1. Allow clients to read their own record from clients table
DROP POLICY IF EXISTS clients_owner_read ON clients;
CREATE POLICY clients_owner_read ON clients
    FOR SELECT
    USING (
        -- User can read if email matches their auth email
        email = auth.jwt() ->> 'email'
        OR
        -- Or if they are an authenticated user from the same tenant (CRM staff)
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- 2. Allow clients to update their own record
DROP POLICY IF EXISTS clients_owner_update ON clients;
CREATE POLICY clients_owner_update ON clients
    FOR UPDATE
    USING (email = auth.jwt() ->> 'email')
    WITH CHECK (email = auth.jwt() ->> 'email');

-- 3. Allow inserting new clients (for registration)
DROP POLICY IF EXISTS clients_insert_any ON clients;
CREATE POLICY clients_insert_any ON clients
    FOR INSERT
    WITH CHECK (true);

-- 4. Allow pet owners to read their own pets
DROP POLICY IF EXISTS pets_client_read ON pets;
CREATE POLICY pets_client_read ON pets
    FOR SELECT
    USING (
        client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')
        OR
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- 5. Allow pet owners to insert pets
DROP POLICY IF EXISTS pets_client_insert ON pets;
CREATE POLICY pets_client_insert ON pets
    FOR INSERT
    WITH CHECK (
        client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')
    );

-- 6. Allow pet owners to update their pets
DROP POLICY IF EXISTS pets_client_update ON pets;
CREATE POLICY pets_client_update ON pets
    FOR UPDATE
    USING (client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'))
    WITH CHECK (client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'));

-- 7. Allow pet owners to delete their pets
DROP POLICY IF EXISTS pets_client_delete ON pets;
CREATE POLICY pets_client_delete ON pets
    FOR DELETE
    USING (client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'));

-- 8. Create/Update appointments table RLS for client access
DROP POLICY IF EXISTS appointments_client_read ON appointments;
CREATE POLICY appointments_client_read ON appointments
    FOR SELECT
    USING (
        client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')
        OR
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS appointments_client_insert ON appointments;
CREATE POLICY appointments_client_insert ON appointments
    FOR INSERT
    WITH CHECK (
        client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')
    );

-- 9. Allow anyone to read services (for scheduling)
DROP POLICY IF EXISTS services_public_read ON services;
CREATE POLICY services_public_read ON services
    FOR SELECT
    USING (true);

-- 10. Allow anyone to read subscription_plans (for viewing available plans)
DROP POLICY IF EXISTS subscription_plans_client_read ON subscription_plans;
CREATE POLICY subscription_plans_client_read ON subscription_plans
    FOR SELECT
    USING (true);

-- 11. Allow clients to read subscriptions for their pet shop
DROP POLICY IF EXISTS subscriptions_client_read ON subscriptions;
CREATE POLICY subscriptions_client_read ON subscriptions
    FOR SELECT
    USING (
        -- Allow if pet_name belongs to one of their pets (client-level subscription)
        pet_name IN (SELECT name FROM pets WHERE client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'))
        OR
        -- Or if authenticated staff from tenant
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        OR
        -- Allow reading plans from their pet shop (for viewing available plans)
        tenant_id IN (SELECT tenant_id FROM clients WHERE email = auth.jwt() ->> 'email')
    );

