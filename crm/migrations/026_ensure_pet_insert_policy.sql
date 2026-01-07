-- ===========================================
-- Migration: 026_ensure_pet_insert_policy.sql
-- Purpose: Garantir que funcionários possam criar Pets e Agendamentos (Correção de RLS)
-- ===========================================

-- 1. Helper function para debug (opcional, pode ser removida em prod se desejar)
-- Garante que temos acesso ao tenant_id correto na sessão
CREATE OR REPLACE FUNCTION get_my_tenant_id() 
RETURNS UUID AS $$
    SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 2. Refazer políticas da tabela PETS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas que podem estar conflitando ou mal definidas
DROP POLICY IF EXISTS "pets_tenant_isolation" ON pets;
DROP POLICY IF EXISTS "pets_client_insert" ON pets; -- Remover e recriar corretamente
DROP POLICY IF EXISTS "pets_client_update" ON pets;
DROP POLICY IF EXISTS "pets_client_delete" ON pets;
DROP POLICY IF EXISTS "pets_client_read" ON pets;

-- Política 1: Funcionários podem FAZER TUDO no seu próprio tenant
CREATE POLICY "staff_all_pets" ON pets
    FOR ALL
    USING (tenant_id = get_my_tenant_id())
    WITH CHECK (tenant_id = get_my_tenant_id());

-- Política 2: App do Cliente (Dono do Pet) - LEITURA
CREATE POLICY "client_select_own_pets" ON pets
    FOR SELECT
    USING (
        client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')
    );

-- Política 3: App do Cliente - INSERÇÃO (Auto-cadastro)
-- Cliente só pode inserir se o client_id for dele mesmo
CREATE POLICY "client_insert_own_pets" ON pets
    FOR INSERT
    WITH CHECK (
        client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')
    );

-- Política 4: App do Cliente - ATUALIZAÇÃO
CREATE POLICY "client_update_own_pets" ON pets
    FOR UPDATE
    USING (client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'))
    WITH CHECK (client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'));


-- 3. Refazer políticas da tabela APPOINTMENTS (Agendamentos)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_tenant_isolation" ON appointments;
DROP POLICY IF EXISTS "appointments_client_read" ON appointments;
DROP POLICY IF EXISTS "appointments_client_insert" ON appointments;

-- Política 1: Funcionários podem FAZER TUDO no seu próprio tenant
CREATE POLICY "staff_all_appointments" ON appointments
    FOR ALL
    USING (tenant_id = get_my_tenant_id())
    WITH CHECK (tenant_id = get_my_tenant_id());

-- Política 2: App do Cliente - LEITURA (Ver seus agendamentos)
CREATE POLICY "client_select_own_appointments" ON appointments
    FOR SELECT
    USING (
        client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')
    );

-- Política 3: App do Cliente - INSERÇÃO (Solicitar agendamento)
CREATE POLICY "client_insert_own_appointments" ON appointments
    FOR INSERT
    WITH CHECK (
        client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')
    );

-- 4. Garantir que CLIENTS também permite inserção por funcionários
-- (Caso esteja falhando ao selecionar o tutor no dropdown ou criar novo)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_tenant_isolation" ON clients;

CREATE POLICY "staff_select_clients" ON clients
    FOR SELECT
    USING (tenant_id = get_my_tenant_id());

CREATE POLICY "staff_all_clients" ON clients
    FOR ALL
    USING (tenant_id = get_my_tenant_id())
    WITH CHECK (tenant_id = get_my_tenant_id());

-- Manter acesso do cliente aos seus próprios dados de perfil
DROP POLICY IF EXISTS "clients_owner_read" ON clients;
CREATE POLICY "clients_owner_read" ON clients
    FOR SELECT
    USING (email = auth.jwt() ->> 'email');
