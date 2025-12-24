-- ===========================================
-- MULTI-TENANCY MIGRATION - STEP 2
-- Add tenant_id to all data tables
-- ===========================================

-- clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
UPDATE clients SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON clients(tenant_id);

-- pets
ALTER TABLE pets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
UPDATE pets SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_pets_tenant_id ON pets(tenant_id);

-- appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
UPDATE appointments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON appointments(tenant_id);

-- services
ALTER TABLE services ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
UPDATE services SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);

-- financial_transactions
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
UPDATE financial_transactions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_financial_transactions_tenant_id ON financial_transactions(tenant_id);

-- resources
ALTER TABLE resources ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
UPDATE resources SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_resources_tenant_id ON resources(tenant_id);

-- ==== OPTIONAL TABLES (only if they exist) ====

-- products (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        EXECUTE 'ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT ''00000000-0000-0000-0000-000000000001''';
        EXECUTE 'UPDATE products SET tenant_id = ''00000000-0000-0000-0000-000000000001'' WHERE tenant_id IS NULL';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id)';
    END IF;
END $$;

-- expenses (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses') THEN
        EXECUTE 'ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT ''00000000-0000-0000-0000-000000000001''';
        EXECUTE 'UPDATE expenses SET tenant_id = ''00000000-0000-0000-0000-000000000001'' WHERE tenant_id IS NULL';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_expenses_tenant_id ON expenses(tenant_id)';
    END IF;
END $$;

-- subscriptions (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        EXECUTE 'ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT ''00000000-0000-0000-0000-000000000001''';
        EXECUTE 'UPDATE subscriptions SET tenant_id = ''00000000-0000-0000-0000-000000000001'' WHERE tenant_id IS NULL';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id)';
    END IF;
END $$;

-- checklist_templates (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'checklist_templates') THEN
        EXECUTE 'ALTER TABLE checklist_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT ''00000000-0000-0000-0000-000000000001''';
        EXECUTE 'UPDATE checklist_templates SET tenant_id = ''00000000-0000-0000-0000-000000000001'' WHERE tenant_id IS NULL';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_checklist_templates_tenant_id ON checklist_templates(tenant_id)';
    END IF;
END $$;
