-- ===========================================
-- FIX: Allow tenant creation by admins
-- ===========================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS tenant_read_own ON tenants;

-- Create policies that allow full access for now
-- (In production, you'd want to restrict this to super-admins only)

-- Allow all authenticated users to read all tenants (needed for invite code lookup)
CREATE POLICY tenant_select_all ON tenants
    FOR SELECT
    USING (true);

-- Allow all authenticated users to insert tenants (for admin panel)
CREATE POLICY tenant_insert ON tenants
    FOR INSERT
    WITH CHECK (true);

-- Allow update only on own tenant
CREATE POLICY tenant_update_own ON tenants
    FOR UPDATE
    USING (id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
