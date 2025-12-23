-- ===========================================
-- MIGRAÇÃO: Limites de Usuários por Plano
-- ===========================================

-- 1. Adicionar coluna max_users à tabela subscription_plans
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 1;

-- 2. Atualizar limites para os planos padrão (se existirem)
UPDATE subscription_plans SET max_users = 1 WHERE name ILIKE '%Free%';
UPDATE subscription_plans SET max_users = 2 WHERE name ILIKE '%Inicial%';
UPDATE subscription_plans SET max_users = 5 WHERE name ILIKE '%Profissional%';
UPDATE subscription_plans SET max_users = 30 WHERE name ILIKE '%Elite%';

-- 3. Garantir que o Plano Free padrão tenha max_users = 1
UPDATE subscription_plans 
SET max_users = 1 
WHERE name = 'Plano Free' OR name = 'Grátis';

-- 4. Adicionar max_users também aos planos pro existentes se necessário
-- (Geralmente Profissional e Elite são PRO)
UPDATE subscription_plans SET is_pro = true WHERE name ILIKE '%Profissional%' OR name ILIKE '%Elite%';
