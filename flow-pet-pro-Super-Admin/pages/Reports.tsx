import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

export const Reports: React.FC = () => {
    const [stats, setStats] = useState({
        mrr: 0,
        churn_rate: 0,
        active_subscriptions: 0,
        avg_ticket: 0,
        plans_distribution: [] as { name: string, count: number }[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_advanced_reports_stats');

            if (error) throw error;
            if (data) {
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Relatórios & Analytics</h2>
                    <p className="text-text-muted text-sm font-light">Métricas detalhadas sobre o desempenho financeiro e operacional.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="glass-panel p-6 rounded-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white">Receita Recorrente (MRR)</h3>
                        <span className="text-primary font-mono font-bold">R$ {stats.mrr.toLocaleString()}</span>
                    </div>
                    {/* Placeholder Chart - Keeping visual appeal but static for now until chart lib integration */}
                    <div className="h-64 flex items-end gap-2 opactiy-80">
                        {/* Visual placeholder for graph */}
                        {[35, 42, 45, 40, 55, 60, 58, 65, 70, 75, 80, 85].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col gap-2 group">
                                <div className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden group-hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-xs text-center text-text-muted">Crescimento simulado (Dados históricos em desenvolvimento)</div>
                </div>

                <div className="glass-panel p-6 rounded-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white">Churn Rate (%)</h3>
                        <span className="text-rose-400 font-mono font-bold">{stats.churn_rate}%</span>
                    </div>
                    <div className="h-64 flex flex-col justify-center gap-4">
                        {/* Simple Bar Chart for Plans distribution */}
                        <p className="text-sm font-bold text-white mb-2">Distribuição de Planos Ativos</p>
                        {stats.plans_distribution?.map((plan, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs text-text-muted">
                                    <span>{plan.name}</span>
                                    <span>{plan.count} / {stats.active_subscriptions}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-400 rounded-full"
                                        style={{ width: `${stats.active_subscriptions > 0 ? (plan.count / stats.active_subscriptions) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {(!stats.plans_distribution || stats.plans_distribution.length === 0) && (
                            <p className="text-xs text-text-muted italic">Nenhum plano ativo.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Tíquete Médio', val: `R$ ${stats.avg_ticket.toLocaleString()}`, sub: 'Média por empresa', color: 'text-emerald-400' },
                    { title: 'CAC (Estimado)', val: `R$ 180,00`, sub: 'Fixo (Ainda não calculado)', color: 'text-blue-400' },
                    { title: 'Assinaturas Ativas', val: stats.active_subscriptions, sub: 'Empresas pagantes', color: 'text-purple-400' },
                ].map((kpi, i) => (
                    <div key={i} className="glass-panel p-6 rounded-3xl group hover:border-primary/30 transition-all">
                        <p className="text-text-muted text-xs font-bold uppercase mb-2 tracking-wider">{kpi.title}</p>
                        <p className="text-3xl font-bold text-white mb-1">{kpi.val}</p>
                        <p className={`text-xs ${kpi.color}`}>{kpi.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};