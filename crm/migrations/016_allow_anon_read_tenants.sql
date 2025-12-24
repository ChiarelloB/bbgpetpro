-- ===========================================
-- Migration: 016_allow_anon_read_tenants.sql
-- Purpose: Allow anonymous users to read tenants for client app pet shop selection
-- ===========================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS tenant_read_own ON tenants;
DROP POLICY IF EXISTS tenant_select_all ON tenants;

-- Create policy for public read access (needed for client app)
CREATE POLICY tenants_public_read ON tenants
    FOR SELECT
    USING (true);

-- Keep insert/update policies for authenticated users only
DROP POLICY IF EXISTS tenant_insert ON tenants;
CREATE POLICY tenant_insert ON tenants
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS tenant_update_own ON tenants;
CREATE POLICY tenant_update_own ON tenants
    FOR UPDATE TO authenticated
    USING (
        id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );
