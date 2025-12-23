import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type TabType = 'dashboard' | 'team' | 'history' | 'academy' | 'tutorials';

export const UserProfile: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

                    setActiveSubscription({
                        ...subData,
                        plan_name: subData.plan_name || 'Plano Personalizado',
                        is_pro: planData?.is_pro || false,
                        max_users: planData?.max_users || 1
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
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

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

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20">
                                        <span className="material-symbols-outlined text-4xl mb-4">diamond</span>
                                        <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Plano Atual</h3>
                                        <p className="text-3xl font-black uppercase italic italic tracking-tighter">
                                            {activeSubscription?.plan_name || 'Free'}
                                        </p>
                                        <p className="text-xs font-bold mt-4 opacity-70">
                                            {activeSubscription?.next_billing
                                                ? `Próxima renovação: ${new Date(activeSubscription.next_billing).toLocaleDateString('pt-BR')}`
                                                : 'Nenhuma assinatura ativa'
                                            }
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5">
                                        <span className="material-symbols-outlined text-4xl mb-4 text-primary">school</span>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">Cursos Concluídos</h3>
                                        <p className="text-3xl font-black text-black dark:text-white">12 <span className="text-lg opacity-50">/ 45</span></p>
                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-6">
                                            <div className="w-[28%] h-full bg-primary rounded-full shadow-lg shadow-primary/40"></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 lg:col-span-full">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">notifications</span> Últimas Atualizações do CRM
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { date: 'Hoje', title: 'Novo PDV Lançado', desc: 'Interface de vendas mais rápida e intuitiva.' },
                                                { date: 'Ontem', title: 'Integração WhatsApp', desc: 'Envie lembretes automáticos para seus clientes.' }
                                            ].map((update, i) => (
                                                <div key={i} className="flex gap-4 p-4 hover:bg-white dark:hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/10 group">
                                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <span className="material-symbols-outlined">rocket_launch</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-primary mb-1">{update.date}</p>
                                                        <h4 className="font-bold text-black dark:text-white">{update.title}</h4>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { title: 'Estética Pet de Elite', instructor: 'Renata Banhos', progress: 45, image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800' },
                                            { title: 'Gestão Financeira', instructor: 'Carlos Mentor', progress: 10, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800' }
                                        ].map((course, i) => (
                                            <div key={i} className="group bg-gray-50 dark:bg-white/5 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all">
                                                <div className="h-48 relative overflow-hidden">
                                                    <img src={course.image} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <h4 className="text-lg font-black uppercase italic italic tracking-tighter text-black dark:text-white mb-1">{course.title}</h4>
                                                    <p className="text-xs text-gray-500 font-bold mb-4">Por {course.instructor}</p>
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                                                        <span>Progresso</span>
                                                        <span>{course.progress}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full">
                                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${course.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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

                                <div className="space-y-6">
                                    {[
                                        { step: '01', title: 'Primeiros Passos', desc: 'Configurando seu pet shop, horários e equipe.', icon: 'rocket' },
                                        { step: '02', title: 'Gestão de Serviços', desc: 'Como criar combos, pacotes e tabelas de preços.', icon: 'list_alt' },
                                        { step: '03', title: 'Domine a Agenda', desc: 'Agendamentos online e lembretes automáticos.', icon: 'calendar_month' },
                                        { step: '04', title: 'Financeiro sem Stress', desc: 'Controle de caixa, fluxo e comissões.', icon: 'payments' }
                                    ].map((tutorial, i) => (
                                        <div key={i} className="flex gap-6 p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-primary transition-all cursor-pointer group">
                                            <div className="size-16 shrink-0 rounded-2xl bg-white dark:bg-black flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-black/5">
                                                <span className="material-symbols-outlined text-3xl">{tutorial.icon}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">{tutorial.step}</span>
                                                <h4 className="text-xl font-black uppercase italic italic tracking-tighter text-black dark:text-white mb-1 group-hover:text-primary transition-colors">
                                                    {tutorial.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 font-bold leading-relaxed">{tutorial.desc}</p>
                                            </div>
                                            <div className="ml-auto self-center">
                                                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">chevron_right</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};
