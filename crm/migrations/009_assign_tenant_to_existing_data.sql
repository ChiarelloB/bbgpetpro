-- ===========================================
-- MIGRAÇÃO: Atribuir tenant_id aos dados existentes
-- ===========================================

-- Primeiro, vamos ver o ID de cada tenant
-- Flow Pet: 00000000-0000-0000-0000-000000000001
-- peteste: a02e852a-a1cf-4af5-a82a-fb5b2d14a80a

-- 1. Atribuir todos os dados SEM tenant_id ao Flow Pet (dados antigos)
UPDATE clients SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE pets SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE appointments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE services SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE financial_transactions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE resources SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 2. Opcional: Se tiver outras tabelas (comentadas pois podem não ter tenant_id)
-- UPDATE team_members SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
-- UPDATE expenses SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
-- UPDATE subscriptions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
-- UPDATE inventory_items SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
-- UPDATE inventory_movements SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 3. Verificar o profile do usuário "peteste" e corrigir se necessário
-- Execute esta query primeiro para ver os profiles:
SELECT id, full_name, tenant_id FROM profiles;

-- 4. Se o usuário peteste não tiver tenant_id correto, atualize:
-- UPDATE profiles 
-- SET tenant_id = 'a02e852a-a1cf-4af5-a82a-fb5b2d14a80a'
-- WHERE full_name ILIKE '%peteste%';

-- 5. Verificar contagem de registros por tenant
SELECT 
    t.name as tenant,
    (SELECT COUNT(*) FROM clients WHERE tenant_id = t.id) as clients,
    (SELECT COUNT(*) FROM pets WHERE tenant_id = t.id) as pets,
    (SELECT COUNT(*) FROM appointments WHERE tenant_id = t.id) as appointments
FROM tenants t;
