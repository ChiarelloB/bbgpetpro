-- ===========================================
-- MIGRAÇÃO: Corrigir RLS para Planos de Assinatura
-- ===========================================

-- 1. Remover polícias restritivas anteriores
DROP POLICY IF EXISTS subscription_plans_tenant_isolation ON subscription_plans;

-- 2. Permitir que todos os usuários leiam planos globais (do tenant padrão) 
-- ou planos de sua própria empresa.
CREATE POLICY subscription_plans_read_global_and_own ON subscription_plans
    FOR SELECT
    USING (
        tenant_id = '00000000-0000-0000-0000-000000000001' 
        OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- 3. Garantir que inserção/atualização só possam ser feitas no próprio tenant
CREATE POLICY subscription_plans_insert_own ON subscription_plans
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY subscription_plans_update_own ON subscription_plans
    FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY subscription_plans_delete_own ON subscription_plans
    FOR DELETE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
