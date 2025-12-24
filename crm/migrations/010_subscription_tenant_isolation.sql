-- ===========================================
-- MIGRAÇÃO: Isolamento de Tenants para Assinaturas e Planos
-- ===========================================

-- 1. Adicionar tenant_id à tabela subscription_plans
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) 
DEFAULT '00000000-0000-0000-0000-000000000001';

-- 2. Atualizar planos existentes para o tenant padrão
UPDATE subscription_plans SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tenant_id ON subscription_plans(tenant_id);

-- 4. Habilitar RLS nas tabelas
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Criar Políticas de RLS para subscription_plans
DROP POLICY IF EXISTS subscription_plans_tenant_isolation ON subscription_plans;
CREATE POLICY subscription_plans_tenant_isolation ON subscription_plans
    FOR ALL
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 6. Re-garantir Políticas de RLS para subscriptions (caso não estejam aplicadas)
DROP POLICY IF EXISTS subscriptions_tenant_isolation ON subscriptions;
CREATE POLICY subscriptions_tenant_isolation ON subscriptions
    FOR ALL
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 7. Corrigir permissões para a função get_current_tenant_id se necessária (opcional, já deve existir)
-- No migration 003 usamos get_current_tenant_id(), vamos usar a subquery direta aqui por segurança caso a função não esteja disponível no contexto RLS
