import React, { useState, useEffect } from 'react';
import { useSecurity } from '../SecurityContext';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';

export const Account: React.FC = () => {
    const { user, tenant } = useSecurity();
    const { showNotification } = useNotification();
    const [activeSubscription, setActiveSubscription] = useState<any>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchAccountData();
        }
    }, [user]);

    const fetchAccountData = async () => {
        setLoading(true);
        try {
            // Fetch active subscription for the pet (using a simple one for now)
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('status', 'active')
                .limit(1)
                .single();

            setActiveSubscription(subData);

            // Fetch purchase history (financial transactions)
            const { data: historyData } = await supabase
                .from('financial_transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            setPurchaseHistory(historyData || []);
        } catch (error) {
            console.error('Error fetching account data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col gap-8">
                {/* Profile Section */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 border border-slate-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-[120px]">account_circle</span>
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[40px]">person</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                {user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </h2>
                            <p className="text-slate-500 dark:text-gray-400 font-bold">{user.email}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {tenant?.name || 'Cliente'}
                                </span>
                                <span className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Subscription & Access Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined text-[80px]">loyalty</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">verified</span> Assinatura Ativa
                            </h3>
                            {activeSubscription ? (
                                <>
                                    <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-2">{activeSubscription.plan_name}</h4>
                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-xl font-bold">R$ {activeSubscription.value.toFixed(2)}</span>
                                        <span className="text-sm opacity-60">/ {activeSubscription.frequency}</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm font-bold bg-white/10 rounded-xl p-3">
                                            <span>Próxima Cobrança</span>
                                            <span>{new Date(activeSubscription.next_billing).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold bg-white/10 rounded-xl p-3">
                                            <span>Método</span>
                                            <span>{activeSubscription.payment_method}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-6 text-center">
                                    <p className="font-bold mb-4">Você ainda não possui uma assinatura ativa.</p>
                                    <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all">
                                        Ver Planos
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 border border-slate-100 dark:border-gray-800 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">key</span> Meus Acessos
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Agenda', icon: 'calendar_today', access: true },
                                { label: 'Financeiro', icon: 'payments', access: activeSubscription ? true : false },
                                { label: 'Cursos PRO', icon: 'school', access: activeSubscription?.is_pro || false, highlight: true },
                                { label: 'Relatórios', icon: 'bar_chart', access: true },
                            ].map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl border transition-all ${item.access
                                        ? item.highlight
                                            ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30 text-amber-600'
                                            : 'bg-slate-50 border-slate-100 dark:bg-white/5 dark:border-gray-800 text-slate-600 dark:text-gray-300'
                                        : 'bg-slate-50/50 border-slate-50 dark:bg-black/10 dark:border-gray-900 opacity-40'
                                    }`}>
                                    <span className="material-symbols-outlined text-xl mb-2">{item.icon}</span>
                                    <p className="text-xs font-black uppercase">{item.label}</p>
                                    {item.access && item.highlight && (
                                        <span className="text-[8px] font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full mt-2 inline-block">ATIVADO</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {activeSubscription?.is_pro ? (
                            <a href="/cursos" target="_blank" className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                                Acessar Área de Cursos <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </a>
                        ) : (
                            <button disabled className="mt-6 w-full py-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl font-bold text-sm cursor-not-allowed">
                                Upgrade para acessar cursos
                            </button>
                        )}
                    </section>
                </div>

                {/* Purchase History */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 border border-slate-100 dark:border-gray-800 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">history</span> Histórico de Pagamentos
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-gray-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="pb-4">Data</th>
                                    <th className="pb-4">Descrição</th>
                                    <th className="pb-4">Valor</th>
                                    <th className="pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {purchaseHistory.length > 0 ? (
                                    purchaseHistory.map((tx, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 dark:border-gray-900/50 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4 text-slate-500 dark:text-gray-400">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</td>
                                            <td className="py-4 font-bold text-slate-900 dark:text-white truncate max-w-[300px]">{tx.description}</td>
                                            <td className="py-4 font-black">R$ {tx.amount.toFixed(2)}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-500 font-bold">Nenhum pagamento registrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};
