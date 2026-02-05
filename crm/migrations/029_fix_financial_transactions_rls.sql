-- ===========================================
-- Migration: 029_fix_financial_transactions_rls.sql
-- Purpose: Corrigir erro de RLS na tabela financial_transactions ao finalizar entrega
-- ===========================================

-- 1. Garantir que a função get_my_tenant_id existe (mesma da migração 026)
CREATE OR REPLACE FUNCTION get_my_tenant_id() 
RETURNS UUID AS $$
    SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 2. Habilitar RLS (caso não esteja)
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "financial_transactions_tenant_isolation" ON financial_transactions;
DROP POLICY IF EXISTS "staff_all_financial_transactions" ON financial_transactions;

-- 4. Criar nova política robusta para funcionários
-- Permite que funcionários do tenant vejam e criem transações
CREATE POLICY "staff_all_financial_transactions" ON financial_transactions
    FOR ALL
    USING (tenant_id = get_my_tenant_id())
    WITH CHECK (tenant_id = get_my_tenant_id());

-- 5. Garantir que o trigger de tenant_id está correto (opcional, mas recomendado)
CREATE OR REPLACE FUNCTION set_tenant_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := (SELECT tenant_id FROM profiles WHERE id = auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_tenant_id_financial ON financial_transactions;
CREATE TRIGGER set_tenant_id_financial 
    BEFORE INSERT ON financial_transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION set_tenant_id_on_insert();
