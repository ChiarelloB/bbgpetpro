-- ===========================================
-- MULTI-TENANCY MIGRATION - STEP 4
-- Add invite_code to tenants table
-- ===========================================

-- Add invite_code column
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Generate invite code for existing tenant (BBG Pet)
UPDATE tenants 
SET invite_code = LOWER(slug) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
WHERE invite_code IS NULL;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_tenants_invite_code ON tenants(invite_code);

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code(tenant_slug TEXT)
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := LOWER(tenant_slug) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        SELECT EXISTS(SELECT 1 FROM tenants WHERE invite_code = new_code) INTO code_exists;
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invite code on tenant creation
CREATE OR REPLACE FUNCTION auto_generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := generate_invite_code(NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenant_invite_code_trigger ON tenants;
CREATE TRIGGER tenant_invite_code_trigger
    BEFORE INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_invite_code();
