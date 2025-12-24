-- ===========================================
-- Migration: 015_create_courses_and_tutorials.sql
-- Purpose: Create tables for courses, tutorials, and progress tracking
-- ===========================================

-- =====================
-- 1. COURSES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    category VARCHAR(50) NOT NULL DEFAULT 'Geral', -- Gestão, Estética, Vendas, Atendimento
    duration VARCHAR(20), -- e.g., '4h 30min'
    image_url TEXT,
    lessons_count INT DEFAULT 0,
    is_pro_only BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 2. COURSE LESSONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    duration VARCHAR(20), -- e.g., '15 min'
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 3. TUTORIALS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number VARCHAR(10) NOT NULL, -- '01', '02', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'play_circle',
    video_url TEXT,
    duration VARCHAR(20), -- e.g., '5 min'
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 4. USER COURSE PROGRESS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS user_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_lessons UUID[] DEFAULT '{}', -- Array of completed lesson IDs
    progress_percent INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- =====================
-- 5. USER TUTORIAL PROGRESS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS user_tutorial_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutorial_id UUID NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tutorial_id)
);

-- =====================
-- 6. RLS POLICIES
-- =====================

-- Courses: Everyone can read
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_read_all" ON courses;
CREATE POLICY "courses_read_all" ON courses FOR SELECT USING (true);

-- Course Lessons: Everyone can read
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "course_lessons_read_all" ON course_lessons;
CREATE POLICY "course_lessons_read_all" ON course_lessons FOR SELECT USING (true);

-- Tutorials: Everyone can read
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tutorials_read_all" ON tutorials;
CREATE POLICY "tutorials_read_all" ON tutorials FOR SELECT USING (true);

-- User Course Progress: Only user can access their own
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_course_progress_own" ON user_course_progress;
CREATE POLICY "user_course_progress_own" ON user_course_progress 
    FOR ALL USING (user_id = auth.uid());

-- User Tutorial Progress: Only user can access their own
ALTER TABLE user_tutorial_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_tutorial_progress_own" ON user_tutorial_progress;
CREATE POLICY "user_tutorial_progress_own" ON user_tutorial_progress 
    FOR ALL USING (user_id = auth.uid());

-- =====================
-- 7. SEED DATA - COURSES (Comprehensive)
-- =====================
INSERT INTO courses (title, description, instructor, category, duration, image_url, lessons_count, is_pro_only, sort_order) VALUES
-- Curso 1: Banho e Tosa Profissional
('Banho e Tosa Profissional', 'Domine as técnicas de banho e tosa que transformam seu pet shop em referência. Aprenda desde a preparação correta do animal até acabamentos impecáveis que encantam os tutores.', 'Dra. Patricia Santos - Médica Veterinária', 'Estética', '6h 30min', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800', 15, true, 1),

-- Curso 2: Gestão Financeira para Pet Shops
('Gestão Financeira para Pet Shops', 'Transforme seu pet shop em um negócio lucrativo. Aprenda a precificar serviços corretamente, controlar custos, calcular comissões e projetar crescimento sustentável.', 'Carlos Eduardo - MBA em Gestão', 'Gestão', '4h 15min', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800', 12, true, 2),

-- Curso 3: Técnicas Avançadas de Tosa por Raça
('Técnicas de Tosa por Raça', 'Guia completo de tosas comerciais e de padrão para as raças mais atendidas: Shih Tzu, Poodle, Yorkshire, Golden, Maltês, Lhasa Apso, Schnauzer e mais.', 'Marina Silva - Tosadora Campeã', 'Estética', '8h 45min', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800', 20, true, 3),

-- Curso 4: Vendas e Fidelização
('Vendas e Fidelização de Clientes', 'Estratégias comprovadas para aumentar seu ticket médio em 40%, criar programas de fidelidade irresistíveis e transformar clientes em promotores do seu negócio.', 'Paulo Roberto - Especialista em Vendas', 'Vendas', '3h 30min', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800', 10, true, 4),

-- Curso 5: Atendimento ao Cliente Pet
('Atendimento 5 Estrelas', 'Transforme cada visita em uma experiência memorável. Aprenda comunicação efetiva com tutores, gestão de reclamações e técnicas para criar conexão emocional.', 'Ana Paula - Customer Success', 'Atendimento', '2h 45min', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800', 8, true, 5),

-- Curso 6: Dermato Veterinária Básica
('Dermatologia Pet para Groomers', 'Identifique problemas de pele, alergias e parasitas antes e durante o banho. Saiba quando encaminhar ao veterinário e quais produtos usar em cada caso.', 'Dr. Fernando Costa - Dermatologista Vet', 'Saúde', '3h', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800', 9, true, 6),

-- Curso 7: Marketing Digital para Pet Shops
('Marketing Digital para Pet Shops', 'Domine Instagram, TikTok e Google Meu Negócio. Crie conteúdo viral, gerencie avaliações e atraia novos clientes organicamente.', 'Juliana Redes - Social Media Expert', 'Marketing', '4h', 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=800', 11, true, 7),

-- Curso 8: Dominando o Flow Pet PRO (Gratuito)
('Dominando o Flow Pet PRO', 'Guia completo para extrair o máximo do seu CRM. Desde configurações básicas até automações avançadas e relatórios gerenciais.', 'Equipe Flow Pet', 'Gestão', '5h', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', 18, false, 8),

-- Curso 9: Segurança e Bem-Estar Animal
('Segurança no Banho e Tosa', 'Protocolos de segurança essenciais, contenção humanizada, primeiros socorros pet e como lidar com animais agressivos ou medrosos.', 'Dra. Carla Viana - Comportamentalista', 'Saúde', '2h 30min', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800', 7, true, 9),

-- Curso 10: Gestão de Equipe
('Liderança e Gestão de Equipe', 'Contrate, treine e retenha os melhores profissionais. Crie escalas eficientes, defina metas e construa uma cultura de excelência.', 'Roberto Lemes - Coach Empresarial', 'Gestão', '3h 15min', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800', 9, true, 10);

-- =====================
-- 8. SEED DATA - COURSE LESSONS (Detailed)
-- =====================

-- Lessons for Course 1: Banho e Tosa Profissional (will need to get course IDs dynamically)
-- For simplicity, we'll create a separate insert that doesn't depend on specific UUIDs

-- =====================
-- 9. SEED DATA - TUTORIALS (Comprehensive)
-- =====================
DELETE FROM tutorials;
INSERT INTO tutorials (step_number, title, description, icon, duration, video_url, sort_order) VALUES
('01', 'Configuração Inicial', 
'Configure seu pet shop no sistema: adicione o nome da empresa, logo, endereço, telefone e horário de funcionamento. Defina os dias úteis e horários de atendimento para cada dia da semana.', 
'settings', '8 min', 'https://youtube.com/watch?v=tutorial1', 1),

('02', 'Cadastrando sua Equipe', 
'Adicione os membros da sua equipe, defina funções (groomer, atendente, gerente), configure permissões de acesso e vincule cada profissional aos serviços que ele realiza.',
'groups', '10 min', 'https://youtube.com/watch?v=tutorial2', 2),

('03', 'Criando Serviços e Preços', 
'Monte sua tabela de serviços com preços por porte (mini, pequeno, médio, grande, gigante). Configure combos, pacotes promocionais e defina tempo médio de cada serviço.',
'list_alt', '15 min', 'https://youtube.com/watch?v=tutorial3', 3),

('04', 'Cadastrando Clientes e Pets', 
'Aprenda a cadastrar tutores com dados completos, adicionar múltiplos pets por cliente, registrar observações importantes, alergias, comportamento e preferências de tosa.',
'person_add', '12 min', 'https://youtube.com/watch?v=tutorial4', 4),

('05', 'Dominando a Agenda', 
'Crie agendamentos eficientes, visualize por dia/semana/mês, configure lembretes automáticos via WhatsApp, gerencie encaixes e evite conflitos de horário.',
'calendar_month', '18 min', 'https://youtube.com/watch?v=tutorial5', 5),

('06', 'Usando o PDV', 
'Realize vendas de produtos e serviços, aplique descontos, processe diferentes formas de pagamento, emita recibos e gerencie o caixa do dia.',
'point_of_sale', '14 min', 'https://youtube.com/watch?v=tutorial6', 6),

('07', 'Controle Financeiro', 
'Registre entradas e saídas, categorize despesas, acompanhe o fluxo de caixa, configure comissões de funcionários e visualize relatórios de lucro.',
'payments', '16 min', 'https://youtube.com/watch?v=tutorial7', 7),

('08', 'Gestão de Estoque', 
'Cadastre produtos, defina estoque mínimo, receba alertas de reposição, registre compras de fornecedores e acompanhe a movimentação.',
'inventory_2', '12 min', 'https://youtube.com/watch?v=tutorial8', 8),

('09', 'Comunicação com Clientes', 
'Envie mensagens em massa via WhatsApp, crie campanhas de aniversário de pets, lembretes de retorno e promoções sazonais.',
'chat', '10 min', 'https://youtube.com/watch?v=tutorial9', 9),

('10', 'Relatórios e Métricas', 
'Analise o desempenho do seu negócio: faturamento mensal, serviços mais vendidos, clientes mais frequentes, ticket médio e comparativos.',
'analytics', '15 min', 'https://youtube.com/watch?v=tutorial10', 10),

('11', 'Configurações Avançadas', 
'Personalize notificações, configure integrações, defina permissões detalhadas, crie templates de mensagens e automatize processos.',
'tune', '12 min', 'https://youtube.com/watch?v=tutorial11', 11),

('12', 'Dicas de Produtividade', 
'Atalhos de teclado, fluxos de trabalho otimizados, automações inteligentes e melhores práticas dos pet shops mais eficientes.',
'bolt', '8 min', 'https://youtube.com/watch?v=tutorial12', 12);

-- =====================
-- 10. CREATE INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tutorial_progress_user ON user_tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_sort ON tutorials(sort_order);

-- =====================
-- 11. TRIGGER FOR UPDATED_AT
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS courses_updated_at ON courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- 12. VIEW FOR COURSE STATS
-- =====================
CREATE OR REPLACE VIEW course_stats AS
SELECT 
    c.id,
    c.title,
    c.category,
    COUNT(DISTINCT ucp.user_id) as enrolled_users,
    COUNT(DISTINCT CASE WHEN ucp.is_completed THEN ucp.user_id END) as completed_users,
    ROUND(AVG(ucp.progress_percent)::numeric, 1) as avg_progress
FROM courses c
LEFT JOIN user_course_progress ucp ON c.id = ucp.course_id
GROUP BY c.id, c.title, c.category;
