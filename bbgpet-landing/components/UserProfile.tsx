import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type TabType = 'dashboard' | 'team' | 'history' | 'academy' | 'tutorials';

interface DashboardStats {
    clients: number;
    pets: number;
    appointmentsThisMonth: number;
    revenueThisMonth: number;
}

interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    category: string;
    duration: string;
    image_url: string;
    lessons_count: number;
    is_pro_only: boolean;
    progress?: number;
    is_completed?: boolean;
}

interface Tutorial {
    id: string;
    step_number: string;
    title: string;
    description: string;
    icon: string;
    duration: string;
    video_url: string;
    is_completed?: boolean;
}

// Tutorial content for modal
const tutorialContent: Record<string, { steps: { title: string; content: string }[] }> = {
    '01': {
        steps: [
            { title: 'Acessar Configurações', content: 'No menu lateral, clique em "Configurações" para abrir o painel de configurações do sistema.' },
            { title: 'Dados da Empresa', content: 'Preencha o nome do seu pet shop, CNPJ, endereço completo e telefone de contato.' },
            { title: 'Logo e Identidade', content: 'Faça upload da logo da sua empresa. Ela aparecerá em recibos e comunicações.' },
            { title: 'Horários de Funcionamento', content: 'Defina os horários de abertura e fechamento para cada dia da semana.' },
        ]
    },
    '02': {
        steps: [
            { title: 'Acessar Equipe', content: 'No menu lateral, clique em "Equipe" para gerenciar os membros do seu time.' },
            { title: 'Adicionar Membro', content: 'Clique em "Adicionar Membro" e preencha nome, email, cargo e senha inicial.' },
            { title: 'Definir Permissões', content: 'Configure quais telas cada membro pode acessar (Gerente tem acesso total, Atendente limitado).' },
            { title: 'Vincular Serviços', content: 'Associe cada groomer aos serviços que ele realiza para a agenda funcionar corretamente.' },
        ]
    },
    '03': {
        steps: [
            { title: 'Acessar Serviços', content: 'No menu lateral, clique em "Serviços" para configurar sua tabela de preços.' },
            { title: 'Criar Serviço', content: 'Clique em "Novo Serviço" e defina nome, categoria (Banho, Tosa, Combo) e tempo médio.' },
            { title: 'Preços por Porte', content: 'Configure preços diferentes para cada porte: Mini, Pequeno, Médio, Grande, Gigante.' },
            { title: 'Combos e Pacotes', content: 'Crie combos como "Banho + Tosa Higiênica" com preço promocional.' },
        ]
    },
};

// Course content pages
const courseContent: Record<string, { lessons: { title: string; content: string; duration: string }[] }> = {
    'Banho e Tosa Profissional': {
        lessons: [
            { title: 'Introdução à Estética Pet', content: 'Conheça os fundamentos da estética animal, equipamentos essenciais e como montar sua estrutura de trabalho.', duration: '25 min' },
            { title: 'Preparação do Animal', content: 'Aprenda a avaliar o pet antes do banho, identificar problemas de pele e preparar a pelagem corretamente.', duration: '30 min' },
            { title: 'Técnicas de Banho', content: 'Domine a temperatura ideal, produtos por tipo de pelagem e técnicas de massagem durante o banho.', duration: '35 min' },
            { title: 'Secagem Profissional', content: 'Técnicas de secagem para cada tipo de pelo, uso correto do soprador e como evitar queimaduras.', duration: '30 min' },
            { title: 'Acabamentos e Finalizações', content: 'Aprenda a usar perfumes, laços e acessórios para entregar um pet impecável ao tutor.', duration: '20 min' },
        ]
    },
    'Gestão Financeira para Pet Shops': {
        lessons: [
            { title: 'Formação de Preço', content: 'Calcule o custo real de cada serviço incluindo produtos, mão de obra, energia e lucro desejado.', duration: '30 min' },
            { title: 'Controle de Caixa', content: 'Implemente um controle de caixa eficiente com abertura, fechamento e conferência diária.', duration: '25 min' },
            { title: 'Fluxo de Caixa', content: 'Projete entradas e saídas para os próximos meses e evite surpresas financeiras.', duration: '30 min' },
            { title: 'Comissões Inteligentes', content: 'Estruture comissões que motivem a equipe sem comprometer sua margem de lucro.', duration: '25 min' },
        ]
    },
};

// Course quizzes
interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

const courseQuizzes: Record<string, QuizQuestion[]> = {
    'Banho e Tosa Profissional': [
        { question: 'Qual a temperatura ideal da água para banho em cães?', options: ['Gelada (10-15°C)', 'Morna (35-38°C)', 'Quente (45-50°C)', 'Ambiente (20-25°C)'], correctIndex: 1 },
        { question: 'O que deve ser avaliado ANTES de iniciar o banho?', options: ['Apenas o peso do animal', 'Condição da pele e pelagem', 'Somente a raça', 'A idade do tutor'], correctIndex: 1 },
        { question: 'Qual equipamento é essencial para secagem profissional?', options: ['Secador de cabelo comum', 'Soprador profissional', 'Toalha apenas', 'Ventilador'], correctIndex: 1 },
        { question: 'Por que usar perfume específico para pets?', options: ['É mais barato', 'pH adequado e seguro para a pele', 'Cheira mais forte', 'Dura mais tempo'], correctIndex: 1 },
        { question: 'Qual o principal objetivo do acabamento final?', options: ['Aumentar o preço', 'Entregar o pet impecável e encaantar o tutor', 'Esconder falhas do banho', 'Ganhar tempo'], correctIndex: 1 },
    ],
    'Gestão Financeira para Pet Shops': [
        { question: 'O que deve ser incluído no cálculo do custo de um serviço?', options: ['Apenas produtos', 'Produtos, mão de obra e custos fixos', 'Só o lucro desejado', 'Apenas o tempo gasto'], correctIndex: 1 },
        { question: 'Qual a frequência ideal para fazer fechamento de caixa?', options: ['Semanal', 'Mensal', 'Diário', 'Anual'], correctIndex: 2 },
        { question: 'Para que serve o fluxo de caixa?', options: ['Decorar a planilha', 'Projetar entradas e saídas futuras', 'Aumentar vendas', 'Reduzir equipe'], correctIndex: 1 },
        { question: 'Como definir comissões de forma saudável?', options: ['100% do serviço', 'Percentual que motive sem comprometer margem', 'Valor fixo alto', 'Não pagar comissão'], correctIndex: 1 },
    ],
};

export const UserProfile: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({ clients: 0, pets: 0, appointmentsThisMonth: 0, revenueThisMonth: 0 });
    const [courses, setCourses] = useState<Course[]>([]);
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // Modal states
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

    // Quiz states
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    const [activeSubscription, setActiveSubscription] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);

                // Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(profileData);

                // Fetch Subscription & Plan
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('tenant_id', profileData?.tenant_id)
                    .is('client_name', null)
                    .eq('status', 'active')
                    .maybeSingle();

                if (subData) {
                    // Fetch plan info by name (since there is no direct FK)
                    const { data: planData } = await supabase
                        .from('subscription_plans')
                        .select('name, is_pro, max_users')
                        .eq('name', subData.plan_name)
                        .maybeSingle();

                    // Fallback: If RLS blocks the query, detect PRO from plan name
                    const planName = subData.plan_name?.toLowerCase() || '';
                    const isPro = planData?.is_pro ||
                        planName.includes('profissional') ||
                        planName.includes('elite') ||
                        planName.includes('pro');
                    const maxUsers = planData?.max_users ||
                        (planName.includes('elite') ? 30 :
                            planName.includes('profissional') ? 5 :
                                planName.includes('inicial') ? 2 : 1);

                    setActiveSubscription({
                        ...subData,
                        plan_name: subData.plan_name || 'Plano Personalizado',
                        is_pro: isPro,
                        max_users: maxUsers
                    });
                }

                // Fetch Tenant
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profileData?.tenant_id)
                    .single();
                setTenant(tenantData);

                // Fetch Team
                const { data: teamData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('tenant_id', profileData?.tenant_id)
                    .order('full_name', { ascending: true });
                setTeam(teamData || []);

                // Fetch real purchase history (financial transactions)
                const { data: historyData } = await supabase
                    .from('financial_transactions')
                    .select('*')
                    .eq('tenant_id', profileData?.tenant_id)
                    .order('created_at', { ascending: false })
                    .limit(10);

                setHistory(historyData || []);

                // Fetch real dashboard stats
                const tenantId = profileData?.tenant_id;
                if (tenantId) {
                    // Count clients
                    const { count: clientsCount } = await supabase
                        .from('clients')
                        .select('*', { count: 'exact', head: true })
                        .eq('tenant_id', tenantId);

                    // Count pets
                    const { count: petsCount } = await supabase
                        .from('pets')
                        .select('*', { count: 'exact', head: true })
                        .eq('tenant_id', tenantId);

                    // Count appointments this month
                    const startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    startOfMonth.setHours(0, 0, 0, 0);

                    const { count: appointmentsCount } = await supabase
                        .from('appointments')
                        .select('*', { count: 'exact', head: true })
                        .eq('tenant_id', tenantId)
                        .gte('date', startOfMonth.toISOString().split('T')[0]);

                    // Sum revenue this month
                    const { data: revenueData } = await supabase
                        .from('financial_transactions')
                        .select('amount')
                        .eq('tenant_id', tenantId)
                        .eq('type', 'income')
                        .gte('created_at', startOfMonth.toISOString());

                    const totalRevenue = (revenueData || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);

                    setStats({
                        clients: clientsCount || 0,
                        pets: petsCount || 0,
                        appointmentsThisMonth: appointmentsCount || 0,
                        revenueThisMonth: totalRevenue
                    });
                }

                // Fetch Courses with user progress
                const { data: coursesData } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true });

                if (coursesData && session?.user) {
                    // Get user's course progress
                    const { data: progressData } = await supabase
                        .from('user_course_progress')
                        .select('course_id, progress_percent, is_completed')
                        .eq('user_id', session.user.id);

                    const progressMap = new Map(progressData?.map(p => [p.course_id, p]) || []);

                    setCourses(coursesData.map(course => ({
                        ...course,
                        progress: progressMap.get(course.id)?.progress_percent || 0,
                        is_completed: progressMap.get(course.id)?.is_completed || false
                    })));
                }

                // Fetch Tutorials with user progress
                const { data: tutorialsData } = await supabase
                    .from('tutorials')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true });

                if (tutorialsData && session?.user) {
                    // Get user's tutorial progress
                    const { data: tutorialProgressData } = await supabase
                        .from('user_tutorial_progress')
                        .select('tutorial_id, is_completed')
                        .eq('user_id', session.user.id);

                    const tutorialProgressMap = new Map(tutorialProgressData?.map(p => [p.tutorial_id, p]) || []);

                    setTutorials(tutorialsData.map(tutorial => ({
                        ...tutorial,
                        is_completed: tutorialProgressMap.get(tutorial.id)?.is_completed || false
                    })));
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    // Mark tutorial as completed
    const markTutorialComplete = async (tutorialId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('user_tutorial_progress')
            .upsert({
                user_id: user.id,
                tutorial_id: tutorialId,
                is_completed: true,
                completed_at: new Date().toISOString()
            }, { onConflict: 'user_id,tutorial_id' });

        if (!error) {
            setTutorials(prev => prev.map(t =>
                t.id === tutorialId ? { ...t, is_completed: true } : t
            ));
        }
    };

    // Update course progress
    const updateCourseProgress = async (courseId: string, progress: number) => {
        if (!user) return;

        const { error } = await supabase
            .from('user_course_progress')
            .upsert({
                user_id: user.id,
                course_id: courseId,
                progress_percent: progress,
                is_completed: progress >= 100,
                last_accessed: new Date().toISOString()
            }, { onConflict: 'user_id,course_id' });

        if (!error) {
            setCourses(prev => prev.map(c =>
                c.id === courseId ? { ...c, progress, is_completed: progress >= 100 } : c
            ));
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Visão Geral', icon: 'dashboard' },
        { id: 'team', label: 'Equipe', icon: 'groups' },
        { id: 'history', label: 'Assinatura', icon: 'history' },
        { id: 'academy', label: 'Academy', icon: 'school' },
        { id: 'tutorials', label: 'Tutoriais', icon: 'menu_book' },
    ];

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-black p-4 md:p-8 overflow-y-auto animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0 space-y-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-black uppercase italic tracking-tighter text-black dark:text-white">
                            Minha <span className="text-primary">Conta</span>
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as TabType)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="pt-8 border-t border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <div className="size-12 rounded-full border-2 border-primary overflow-hidden bg-gray-200">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="size-full object-cover" />
                                ) : (
                                    <div className="size-full flex items-center justify-center text-gray-500">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm truncate text-black dark:text-white">{profile?.full_name || user?.email}</p>
                                <p className="text-[10px] font-black uppercase text-primary">
                                    {activeSubscription?.plan_name || 'Sem Assinatura'}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-[3rem] border border-gray-100 dark:border-white/10 p-8 md:p-12 min-h-full shadow-sm">

                        {activeTab === 'dashboard' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <header className="mb-12">
                                    <h2 className="text-4xl font-black uppercase italic italic tracking-tighter text-black dark:text-white">
                                        Bem-vindo, {profile?.full_name?.split(' ')[0] || 'Usuário'}!
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 italic">Acompanhe seu progresso e gerencie sua assinatura.</p>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Plan Card */}
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20">
                                        <span className="material-symbols-outlined text-4xl mb-4">diamond</span>
                                        <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Plano Atual</h3>
                                        <p className="text-3xl font-black uppercase italic italic tracking-tighter">
                                            {activeSubscription?.plan_name || (activeSubscription?.is_pro ? 'PRO' : 'Free')}
                                        </p>
                                        <p className="text-xs font-bold mt-4 opacity-70">
                                            {activeSubscription?.next_billing
                                                ? `Renova: ${new Date(activeSubscription.next_billing).toLocaleDateString('pt-BR')}`
                                                : 'Sem vencimento'
                                            }
                                        </p>
                                    </div>

                                    {/* Clients Card */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5">
                                        <span className="material-symbols-outlined text-4xl mb-4 text-blue-500">groups</span>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">Clientes</h3>
                                        <p className="text-3xl font-black text-black dark:text-white">{stats.clients}</p>
                                        <p className="text-xs font-bold mt-4 text-gray-400">Cadastrados</p>
                                    </div>

                                    {/* Pets Card */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5">
                                        <span className="material-symbols-outlined text-4xl mb-4 text-amber-500">pets</span>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">Pets</h3>
                                        <p className="text-3xl font-black text-black dark:text-white">{stats.pets}</p>
                                        <p className="text-xs font-bold mt-4 text-gray-400">Cadastrados</p>
                                    </div>

                                    {/* Appointments Card */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5">
                                        <span className="material-symbols-outlined text-4xl mb-4 text-green-500">calendar_month</span>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">Agendamentos</h3>
                                        <p className="text-3xl font-black text-black dark:text-white">{stats.appointmentsThisMonth}</p>
                                        <p className="text-xs font-bold mt-4 text-gray-400">Este mês</p>
                                    </div>

                                    {/* Revenue Card - Full Width */}
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20 lg:col-span-2">
                                        <span className="material-symbols-outlined text-4xl mb-4">payments</span>
                                        <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Receita do Mês</h3>
                                        <p className="text-4xl font-black">
                                            R$ {stats.revenueThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {/* Team Usage Card */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 lg:col-span-2">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-4xl text-primary">group</span>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Equipe</h3>
                                                    <p className="text-2xl font-black text-black dark:text-white">
                                                        {team.length} <span className="text-lg opacity-50">/ {activeSubscription?.max_users || 1}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${team.length >= (activeSubscription?.max_users || 1) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {team.length >= (activeSubscription?.max_users || 1) ? 'Limite Atingido' : 'Disponível'}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${team.length >= (activeSubscription?.max_users || 1) ? 'bg-red-500' : 'bg-primary'}`}
                                                style={{ width: `${Math.min((team.length / (activeSubscription?.max_users || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Updates Card - Full Width */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 lg:col-span-full">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">rocket_launch</span> Novidades do Flow Pet PRO
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { icon: 'point_of_sale', title: 'PDV Turbo', desc: 'Vendas 3x mais rápidas', tag: 'Novo' },
                                                { icon: 'smart_toy', title: 'IA Integrada', desc: 'Lembretes automáticos', tag: 'Beta' },
                                                { icon: 'local_shipping', title: 'Leva e Traz', desc: 'Gestão de entregas', tag: 'Em breve' }
                                            ].map((update, i) => (
                                                <div key={i} className="flex gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                                                    <div className="size-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <span className="material-symbols-outlined">{update.icon}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-black text-black dark:text-white">{update.title}</h4>
                                                            <span className="text-[8px] font-black uppercase bg-primary/20 text-primary px-2 py-0.5 rounded">{update.tag}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{update.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                    <div>
                                        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-black dark:text-white">
                                            Gestão de <span className="text-primary">Equipe</span>
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">Gerencie quem tem acesso ao CRM da sua empresa.</p>
                                    </div>
                                    <div className="bg-primary/10 px-6 py-4 rounded-3xl border border-primary/20 flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Código de Convite</p>
                                            <p className="text-xl font-black text-black dark:text-white tracking-widest">{tenant?.invite_code || '---'}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (tenant?.invite_code) {
                                                    navigator.clipboard.writeText(tenant.invite_code);
                                                    alert('Código de convite copiado!');
                                                }
                                            }}
                                            className="size-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20"
                                        >
                                            <span className="material-symbols-outlined text-xl">content_copy</span>
                                        </button>
                                    </div>
                                </header>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    {/* Summary & Limits */}
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/10">
                                            <h3 className="text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Limite do Plano</h3>
                                            <div className="flex items-end justify-between mb-2">
                                                <p className="text-4xl font-black text-black dark:text-white">
                                                    {team.length} <span className="text-lg text-gray-400">/ {activeSubscription?.max_users || 1}</span>
                                                </p>
                                                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-md">
                                                    {activeSubscription?.is_pro ? 'PRO' : 'FREE'}
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                                    style={{ width: `${Math.min((team.length / (activeSubscription?.max_users || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-bold mt-4 italic">
                                                {team.length >= (activeSubscription?.max_users || 1)
                                                    ? '⚠️ Você atingiu o limite de usuários. Faça upgrade para adicionar mais.'
                                                    : `Você ainda pode adicionar ${(activeSubscription?.max_users || 1) - team.length} ${(activeSubscription?.max_users || 1) - team.length === 1 ? 'usuário' : 'usuários'}.`
                                                }
                                            </p>
                                            {team.length >= (activeSubscription?.max_users || 1) && (
                                                <button
                                                    onClick={() => setActiveTab('history')}
                                                    className="w-full mt-4 py-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform"
                                                >
                                                    Fazer Upgrade
                                                </button>
                                            )}
                                        </div>

                                        <div className="bg-primary p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20">
                                            <span className="material-symbols-outlined text-4xl mb-4 text-white">person_add</span>
                                            <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Novo Membro?</h3>
                                            <p className="text-sm font-bold leading-relaxed mb-6">
                                                Compartilhe o código de convite acima com seu colaborador. Ele deve usá-lo na tela de cadastro.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    const text = `Oi! Use o código ${tenant?.invite_code} para se juntar à equipe ${tenant?.name} no Flow Pet PRO. Crie sua conta aqui: ${window.location.origin}`;
                                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                                                }}
                                                className="w-full py-3 bg-white text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hex-shadow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-xs">share</span>
                                                Enviar Convite via WhatsApp
                                            </button>
                                        </div>
                                    </div>

                                    {/* Members List */}
                                    <div className="lg:col-span-3">
                                        <div className="bg-white dark:bg-transparent rounded-[2rem] border border-gray-100 dark:border-white/10 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        <th className="px-8 py-4">Membro</th>
                                                        <th className="px-8 py-4">Cargo</th>
                                                        <th className="px-8 py-4">Status</th>
                                                        <th className="px-8 py-4 text-right">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                                    {team.map((member) => (
                                                        <tr key={member.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                            <td className="px-8 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="size-10 rounded-full border-2 border-primary/20 overflow-hidden bg-gray-100 dark:bg-white/5">
                                                                        {member.avatar_url ? (
                                                                            <img src={member.avatar_url} alt="Avatar" className="size-full object-cover" />
                                                                        ) : (
                                                                            <div className="size-full flex items-center justify-center text-gray-400">
                                                                                <span className="material-symbols-outlined">person</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-black dark:text-white text-sm">{member.full_name || 'Sem nome'}</p>
                                                                        <p className="text-[10px] text-gray-500 lowercase">{member.email || 'sem email'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-4">
                                                                <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                                    {member.role || 'Membro'}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`size-2 rounded-full ${member.status === 'online' ? 'bg-green-500' : member.status === 'busy' ? 'bg-amber-500' : 'bg-gray-300'}`}></span>
                                                                    <span className="text-[10px] font-bold uppercase text-gray-500">{member.status || 'offline'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-4 text-right">
                                                                <button
                                                                    onClick={() => {
                                                                        if (member.id === user?.id) {
                                                                            alert('Você não pode se remover da própria equipe.');
                                                                            return;
                                                                        }
                                                                        if (confirm(`Remover ${member.full_name} da equipe?`)) {
                                                                            // Logic to remove user would go here
                                                                            alert('Ação restrita ao administrador no CRM.');
                                                                        }
                                                                    }}
                                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <header className="mb-12">
                                    <h2 className="text-4xl font-black uppercase italic italic tracking-tighter text-black dark:text-white">
                                        Histórico de <span className="text-primary">Faturamento</span>
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">Veja seus pagamentos recentes e faturas.</p>
                                </header>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <th className="pb-4">Data</th>
                                                <th className="pb-4">Plano</th>
                                                <th className="pb-4">Valor</th>
                                                <th className="pb-4">Status</th>
                                                <th className="pb-4 text-right">Recibo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                            {history.map((tx) => (
                                                <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="py-6 text-sm font-bold text-gray-500">
                                                        {new Date(tx.created_at || tx.date).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">
                                                            {tx.description || tx.plan || 'Pagamento'}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 font-black text-black dark:text-white">
                                                        R$ {(tx.amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-tighter">
                                                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 text-right">
                                                        <button className="text-gray-400 hover:text-primary transition-colors">
                                                            <span className="material-symbols-outlined">download</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'academy' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <header className="mb-12">
                                    <h2 className="text-4xl font-black uppercase italic italic tracking-tighter text-black dark:text-white">
                                        Flow Pet <span className="text-primary">Academy</span>
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">Sua biblioteca exclusiva de capacitação.</p>
                                </header>

                                {activeSubscription?.is_pro ? (
                                    <div className="space-y-8">
                                        {/* Course Categories */}
                                        <div className="flex gap-4 overflow-x-auto pb-2">
                                            {['Todos', ...Array.from(new Set(courses.map(c => c.category)))].map((cat, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Courses Stats */}
                                        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 rounded-2xl border border-primary/20 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-xl bg-white dark:bg-black flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary">school</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-black dark:text-white">
                                                        {courses.filter(c => c.is_completed).length} de {courses.length} cursos concluídos
                                                    </p>
                                                    <p className="text-xs text-gray-500">Continue aprendendo para dominar seu negócio</p>
                                                </div>
                                            </div>
                                            <div className="text-3xl font-black text-primary">
                                                {courses.length > 0 ? Math.round(courses.filter(c => c.is_completed).length / courses.length * 100) : 0}%
                                            </div>
                                        </div>

                                        {/* Courses Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(courses.length > 0 ? courses : []).filter(course =>
                                                selectedCategory === 'Todos' || course.category === selectedCategory
                                            ).map((course) => (
                                                <div
                                                    key={course.id}
                                                    className="group bg-gray-50 dark:bg-white/5 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer"
                                                    onClick={() => setSelectedCourse(course)}
                                                >
                                                    <div className="h-40 relative overflow-hidden">
                                                        <img src={course.image_url} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                                                            <span className="text-[10px] font-black uppercase bg-white/20 backdrop-blur px-2 py-1 rounded text-white">{course.category}</span>
                                                            <span className="text-[10px] font-bold text-white/80">{course.duration}</span>
                                                        </div>
                                                        {course.is_completed && (
                                                            <div className="absolute top-3 right-3 size-8 bg-green-500 rounded-full flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-white text-sm">check</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="material-symbols-outlined text-white text-5xl">play_circle</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <h4 className="font-black text-black dark:text-white mb-1 group-hover:text-primary transition-colors">{course.title}</h4>
                                                        <p className="text-xs text-gray-500 font-bold mb-3">{course.instructor} • {course.lessons_count} aulas</p>
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 mb-1">
                                                            <span>{course.is_completed ? 'Concluído' : (course.progress || 0) === 0 ? 'Não iniciado' : 'Em andamento'}</span>
                                                            <span>{course.progress || 0}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all ${course.is_completed ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${course.progress || 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {courses.length === 0 && (
                                                <div className="col-span-full text-center py-12 text-gray-500">
                                                    <span className="material-symbols-outlined text-4xl mb-4">school</span>
                                                    <p className="font-bold">Cursos em breve!</p>
                                                    <p className="text-sm">Estamos preparando conteúdos incríveis para você.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10">
                                        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <span className="material-symbols-outlined text-4xl text-primary">lock</span>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-4">
                                            Acesso Exclusivo <span className="text-primary text-primary">PRO</span>
                                        </h3>
                                        <p className="text-gray-500 max-w-sm mx-auto mb-8 font-bold">
                                            Para desbloquear nossos cursos e treinamentos de elite, você precisa de uma assinatura PRO ativa.
                                        </p>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                setTimeout(() => {
                                                    document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' });
                                                }, 100);
                                            }}
                                            className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-primary/20"
                                        >
                                            Fazer Upgrade Agora
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tutorials' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <header className="mb-12">
                                    <h2 className="text-4xl font-black uppercase italic italic tracking-tighter text-black dark:text-white">
                                        Guia do <span className="text-primary">Mestre</span>
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">Aprenda a configurar seu CRM passo a passo.</p>
                                </header>

                                <div className="space-y-8">
                                    {/* Progress Overview */}
                                    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-3xl border border-primary/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-black text-black dark:text-white">Seu Progresso no Guia</h3>
                                                <p className="text-sm text-gray-500">
                                                    {tutorials.filter(t => t.is_completed).length} de {tutorials.length} tutoriais concluídos
                                                </p>
                                            </div>
                                            <div className="size-16 rounded-full bg-white dark:bg-black flex items-center justify-center">
                                                <span className="text-xl font-black text-primary">
                                                    {tutorials.length > 0 ? Math.round(tutorials.filter(t => t.is_completed).length / tutorials.length * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-white dark:bg-black rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-500"
                                                style={{ width: `${tutorials.length > 0 ? (tutorials.filter(t => t.is_completed).length / tutorials.length * 100) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Tutorial List */}
                                    <div className="space-y-4">
                                        {(tutorials.length > 0 ? tutorials : []).map((tutorial) => (
                                            <div
                                                key={tutorial.id}
                                                onClick={() => setSelectedTutorial(tutorial)}
                                                className={`flex gap-6 p-6 rounded-3xl border transition-all cursor-pointer group ${tutorial.is_completed ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-primary'}`}
                                            >
                                                <div className={`size-16 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${tutorial.is_completed ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-white dark:bg-black text-primary shadow-black/5'}`}>
                                                    {tutorial.is_completed ? (
                                                        <span className="material-symbols-outlined text-3xl">check</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-3xl">{tutorial.icon}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">{tutorial.step_number}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                            {tutorial.duration}
                                                        </span>
                                                        {tutorial.is_completed && (
                                                            <span className="text-[10px] font-black uppercase text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">Concluído</span>
                                                        )}
                                                    </div>
                                                    <h4 className={`text-xl font-black uppercase italic tracking-tighter mb-1 transition-colors ${tutorial.is_completed ? 'text-green-700 dark:text-green-400' : 'text-black dark:text-white group-hover:text-primary'}`}>
                                                        {tutorial.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 font-bold leading-relaxed">{tutorial.description}</p>
                                                </div>
                                                <div className="self-center flex items-center gap-3">
                                                    {!tutorial.is_completed && (
                                                        <span className="hidden md:flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full">
                                                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                                                            Assistir
                                                        </span>
                                                    )}
                                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">chevron_right</span>
                                                </div>
                                            </div>
                                        ))}
                                        {tutorials.length === 0 && (
                                            <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-white/5 rounded-3xl">
                                                <span className="material-symbols-outlined text-4xl mb-4">menu_book</span>
                                                <p className="font-bold">Tutoriais em breve!</p>
                                                <p className="text-sm">Estamos preparando guias passo a passo para você.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Help Section */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
                                        <span className="material-symbols-outlined text-5xl text-primary mb-4">support_agent</span>
                                        <h3 className="text-xl font-black text-black dark:text-white mb-2">Precisa de Ajuda?</h3>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Nossa equipe está pronta para te ajudar a extrair o máximo do seu CRM.</p>
                                        <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                                            Falar com Suporte
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {/* Tutorial Modal */}
            {selectedTutorial && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedTutorial(null)}>
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold opacity-80">Tutorial {selectedTutorial.step_number}</span>
                                <button onClick={() => setSelectedTutorial(null)} className="size-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">{selectedTutorial.title}</h2>
                            <p className="text-sm opacity-80 mt-2">{selectedTutorial.description}</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span>{selectedTutorial.duration}</span>
                            </div>

                            {tutorialContent[selectedTutorial.step_number] ? (
                                <div className="space-y-4">
                                    {tutorialContent[selectedTutorial.step_number].steps.map((step, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                            <div className="size-8 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-black dark:text-white mb-1">{step.title}</h4>
                                                <p className="text-sm text-gray-500">{step.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <span className="material-symbols-outlined text-4xl mb-4">construction</span>
                                    <p className="font-bold">Conteúdo em desenvolvimento</p>
                                    <p className="text-sm">Este tutorial estará disponível em breve.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-between">
                            <button
                                onClick={() => {
                                    if (!selectedTutorial.is_completed) {
                                        markTutorialComplete(selectedTutorial.id);
                                    }
                                    setSelectedTutorial(null);
                                }}
                                className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                            >
                                {selectedTutorial.is_completed ? 'Fechar' : 'Marcar como Concluído'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => { setSelectedCourse(null); setCurrentLessonIndex(0); }}>
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Header with Image */}
                        <div className="relative h-48">
                            <img src={selectedCourse.image_url} className="size-full object-cover" alt={selectedCourse.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <button
                                onClick={() => { setSelectedCourse(null); setCurrentLessonIndex(0); }}
                                className="absolute top-4 right-4 size-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="absolute bottom-4 left-6 right-6 text-white">
                                <span className="text-xs font-bold uppercase bg-primary px-2 py-1 rounded mb-2 inline-block">{selectedCourse.category}</span>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">{selectedCourse.title}</h2>
                                <p className="text-sm opacity-80 mt-1">{selectedCourse.instructor}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex h-[50vh]">
                            {/* Sidebar - Lessons List */}
                            <div className="w-1/3 border-r border-gray-100 dark:border-white/10 overflow-y-auto">
                                <div className="p-4">
                                    <p className="text-xs font-bold uppercase text-gray-400 mb-4">{selectedCourse.lessons_count} Aulas • {selectedCourse.duration}</p>
                                    {(courseContent[selectedCourse.title]?.lessons || []).map((lesson, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentLessonIndex(i)}
                                            className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${currentLessonIndex === i ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${currentLessonIndex === i ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold text-sm truncate ${currentLessonIndex === i ? 'text-white' : 'text-black dark:text-white'}`}>{lesson.title}</p>
                                                    <p className={`text-xs ${currentLessonIndex === i ? 'opacity-80' : 'text-gray-400'}`}>{lesson.duration}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {!courseContent[selectedCourse.title] && (
                                        <div className="text-center py-8 text-gray-400">
                                            <span className="material-symbols-outlined">construction</span>
                                            <p className="text-xs mt-2">Aulas em desenvolvimento</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {showQuiz ? (
                                    // Quiz View
                                    <div>
                                        {!quizCompleted ? (
                                            <div>
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-xs font-bold uppercase text-primary">
                                                        Questão {currentQuestionIndex + 1} de {courseQuizzes[selectedCourse.title]?.length || 0}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        {(courseQuizzes[selectedCourse.title] || []).map((_, i) => (
                                                            <div key={i} className={`size-2 rounded-full ${i < currentQuestionIndex ? 'bg-green-500' : i === currentQuestionIndex ? 'bg-primary' : 'bg-gray-200 dark:bg-white/20'}`}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-black text-black dark:text-white mb-6">
                                                    {courseQuizzes[selectedCourse.title]?.[currentQuestionIndex]?.question}
                                                </h3>
                                                <div className="space-y-3">
                                                    {(courseQuizzes[selectedCourse.title]?.[currentQuestionIndex]?.options || []).map((option, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                const newAnswers = [...selectedAnswers];
                                                                newAnswers[currentQuestionIndex] = i;
                                                                setSelectedAnswers(newAnswers);
                                                            }}
                                                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedAnswers[currentQuestionIndex] === i
                                                                ? 'border-primary bg-primary/10'
                                                                : 'border-gray-100 dark:border-white/10 hover:border-primary/50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`size-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedAnswers[currentQuestionIndex] === i
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-gray-100 dark:bg-white/10'
                                                                    }`}>
                                                                    {String.fromCharCode(65 + i)}
                                                                </span>
                                                                <span className="font-bold text-black dark:text-white">{option}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            // Quiz Results
                                            <div className="text-center py-8">
                                                <div className={`size-24 rounded-full mx-auto mb-6 flex items-center justify-center ${quizScore >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}>
                                                    <span className="material-symbols-outlined text-5xl text-white">
                                                        {quizScore >= 70 ? 'emoji_events' : 'refresh'}
                                                    </span>
                                                </div>
                                                <h3 className="text-3xl font-black text-black dark:text-white mb-2">
                                                    {quizScore >= 70 ? 'Parabéns!' : 'Quase lá!'}
                                                </h3>
                                                <p className="text-gray-500 mb-4">
                                                    Você acertou <span className="font-black text-primary">{quizScore}%</span> das questões
                                                </p>
                                                {quizScore >= 70 ? (
                                                    <p className="text-green-600 font-bold">
                                                        ✓ Curso concluído com sucesso!
                                                    </p>
                                                ) : (
                                                    <p className="text-orange-600 font-bold">
                                                        Você precisa de 70% para passar. Revise o conteúdo e tente novamente.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : courseContent[selectedCourse.title]?.lessons[currentLessonIndex] ? (
                                    <>
                                        <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center mb-6">
                                            <div className="text-center text-white">
                                                <span className="material-symbols-outlined text-6xl mb-4">play_circle</span>
                                                <p className="font-bold">Clique para reproduzir</p>
                                                <p className="text-sm opacity-60">{courseContent[selectedCourse.title].lessons[currentLessonIndex].duration}</p>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-black dark:text-white mb-3">
                                            {courseContent[selectedCourse.title].lessons[currentLessonIndex].title}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed">
                                            {courseContent[selectedCourse.title].lessons[currentLessonIndex].content}
                                        </p>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-6xl mb-4">school</span>
                                            <p className="font-bold text-lg">Selecione uma aula</p>
                                            <p className="text-sm">Escolha uma aula na lista ao lado para começar.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                            {showQuiz ? (
                                quizCompleted ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowQuiz(false);
                                                setQuizCompleted(false);
                                                setCurrentQuestionIndex(0);
                                                setSelectedAnswers([]);
                                                setCurrentLessonIndex(0);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-gray-500 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined">refresh</span>
                                            Revisar Aulas
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (quizScore >= 70) {
                                                    updateCourseProgress(selectedCourse.id, 100);
                                                }
                                                setSelectedCourse(null);
                                                setCurrentLessonIndex(0);
                                                setShowQuiz(false);
                                                setQuizCompleted(false);
                                                setSelectedAnswers([]);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-primary text-white hover:scale-105 transition-transform"
                                        >
                                            {quizScore >= 70 ? 'Finalizar' : 'Tentar Novamente'}
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                            disabled={currentQuestionIndex === 0}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-gray-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => {
                                                const questions = courseQuizzes[selectedCourse.title] || [];
                                                if (currentQuestionIndex < questions.length - 1) {
                                                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                                                } else {
                                                    // Calculate score
                                                    let correct = 0;
                                                    questions.forEach((q, i) => {
                                                        if (selectedAnswers[i] === q.correctIndex) correct++;
                                                    });
                                                    const score = Math.round((correct / questions.length) * 100);
                                                    setQuizScore(score);
                                                    setQuizCompleted(true);
                                                }
                                            }}
                                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-primary text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {currentQuestionIndex < (courseQuizzes[selectedCourse.title]?.length || 1) - 1 ? 'Próxima' : 'Ver Resultado'}
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </>
                                )
                            ) : (
                                <>
                                    <button
                                        onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                                        disabled={currentLessonIndex === 0}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-gray-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                        Anterior
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {(courseContent[selectedCourse.title]?.lessons || []).map((_, i) => (
                                            <div key={i} className={`size-2 rounded-full transition-all ${currentLessonIndex === i ? 'bg-primary w-6' : 'bg-gray-200 dark:bg-white/20'}`}></div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const lessons = courseContent[selectedCourse.title]?.lessons || [];
                                            if (currentLessonIndex < lessons.length - 1) {
                                                setCurrentLessonIndex(currentLessonIndex + 1);
                                            } else if (courseQuizzes[selectedCourse.title]) {
                                                // Start quiz
                                                setShowQuiz(true);
                                                setCurrentQuestionIndex(0);
                                                setSelectedAnswers([]);
                                                setQuizCompleted(false);
                                            } else {
                                                updateCourseProgress(selectedCourse.id, 100);
                                                setSelectedCourse(null);
                                                setCurrentLessonIndex(0);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-primary text-white hover:scale-105 transition-transform"
                                    >
                                        {currentLessonIndex < (courseContent[selectedCourse.title]?.lessons.length || 1) - 1
                                            ? 'Próxima'
                                            : courseQuizzes[selectedCourse.title]
                                                ? 'Fazer Questionário'
                                                : 'Concluir Curso'}
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
