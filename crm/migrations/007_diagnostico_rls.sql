-- ===========================================
-- DIAGNÓSTICO E CORREÇÃO DE MULTI-TENANCY
-- Execute no Supabase SQL Editor
-- ===========================================

-- 1. VER TODOS OS PROFILES E SEUS TENANT_IDs
SELECT 
    p.id,
    p.full_name,
    p.tenant_id,
    t.name as tenant_name,
    t.slug
FROM profiles p
LEFT JOIN tenants t ON p.tenant_id = t.id
ORDER BY t.created_at DESC;

-- 2. VER SE RLS ESTÁ HABILITADO
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('clients', 'pets', 'appointments', 'services', 'profiles', 'tenants');

-- 3. VER POLÍTICAS EXISTENTES
SELECT 
    tablename,
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===========================================
-- CORREÇÃO: Se o usuário "peteste" tiver tenant_id errado
-- Descomente e execute após verificar o ID correto
-- ===========================================

-- Encontre o ID do tenant "peteste":
-- SELECT id FROM tenants WHERE slug = 'peteste';

-- Atualize o profile do usuário para o tenant correto:
-- UPDATE profiles 
-- SET tenant_id = 'a02e852a-a1cf-4af5-a82a-fb5b2d14a80a'  -- ID do tenant peteste
-- WHERE full_name ILIKE '%peteste%' OR id = 'SEU_USER_ID_AQUI';

-- ===========================================
-- IMPORTANTE: Para verificar se o RLS funciona
-- após aplicar as migrações, faça login como usuário
-- do tenant "peteste" e verifique se só vê seus dados
-- ===========================================
