-- ===========================================
-- MIGRAÇÃO: Atribuição de Plano Free aos Tenants Atuais
-- ===========================================

-- 1. Permitir NULL em client_name e pet_name para suportar assinaturas de nível de sistema (CRM)
ALTER TABLE subscriptions ALTER COLUMN client_name DROP NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN pet_name DROP NOT NULL;

-- 2. Garantir que o "Plano Free" exista para todos os tenants na tabela de planos
INSERT INTO subscription_plans (name, price, frequency, is_pro, tenant_id)
SELECT 'Plano Free', 0.00, 'mensal', false, t.id
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM subscription_plans sp WHERE sp.name = 'Plano Free' AND sp.tenant_id = t.id
);

-- 3. Vincular todos os tenants que não possuem assinatura ativa ao Plano Free
-- Usando plan_name pois a tabela subscriptions utiliza o nome do plano para vínculo
INSERT INTO subscriptions (tenant_id, plan_name, status, value, frequency, next_billing)
SELECT 
    t.id, 
    'Plano Free',
    'active',
    0.00,
    'mensal',
    CURRENT_DATE + INTERVAL '1 month'
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s WHERE s.tenant_id = t.id AND s.status = 'active'
);
