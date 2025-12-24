-- 1. Archive or Delete existing Global Plans (tenant_id is default '0000...0001')
DELETE FROM subscription_plans 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- 2. Insert Official Plans
INSERT INTO subscription_plans (id, tenant_id, name, description, price, frequency, max_usage, usage_unit, services, is_active, is_pro, max_users, color)
VALUES
-- INICIAL
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Inicial',
    'Para quem está começando agora.',
    89.90,
    'monthly',
    50, -- Assuming client limit corresponds to abstract usage
    'Clientes',
    ARRAY['Até 50 clientes', 'Agenda básica', 'Histórico de vacinas', 'Suporte por email'],
    true,
    false, -- Not PRO? Or maybe basic PRO? Let's assume false or basic. Landing page says "Investimento Inteligente", usually implies paid = pro. But let's stick to basics.
    1,
    'blue'
),
-- PROFISSIONAL
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Profissional',
    'Para pet shops em crescimento acelerado.',
    199.90,
    'monthly',
    999999,
    'Clientes',
    ARRAY['Clientes ilimitados', 'Lembretes via WhatsApp', 'Controle financeiro', 'Módulo de Banho e Tosa', 'Suporte prioritário'],
    true,
    true,
    5,
    'purple'
),
-- ELITE
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Elite',
    'Gestão completa para grandes redes.',
    399.90,
    'monthly',
    999999,
    'Clientes',
    ARRAY['Multi-lojas', 'API de integração', 'Relatórios avançados', 'Gerente de conta dedicado', 'Treinamento para equipe'],
    true,
    true,
    10,
    'black'
);
