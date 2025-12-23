import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

export const Reports: React.FC = () => {
    const [stats, setStats] = useState({
        totalCompanies: 0,
        activePlans: 0,
        estimatedMRR: 0,
        ltv: 2450,
        cac: 180,
        nps: 72
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { count: companiesCount } = await supabase.from('tenants').select('*', { count: 'exact', head: true });
            const { count: plansCount } = await supabase.from('subscription_plans').select('*', { count: 'exact', head: true });

            // Simulating MRR based on companies and a base price if real data isn't available
            const mrr = (companiesCount || 0) * 199; // Assume 199 as base price for simulation

            setStats(prev => ({
                ...prev,
                totalCompanies: companiesCount || 0,
                activePlans: plansCount || 0,
                estimatedMRR: mrr
            }));
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
                <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 self-end md:self-auto">
                    <button className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold">Hoje</button>
                    <button className="px-4 py-2 rounded-full hover:bg-white/5 text-text-muted hover:text-white text-xs font-medium transition-colors">7 Dias</button>
                    <button className="px-4 py-2 rounded-full hover:bg-white/5 text-text-muted hover:text-white text-xs font-medium transition-colors">30 Dias</button>
                    <button className="px-4 py-2 rounded-full hover:bg-white/5 text-text-muted hover:text-white text-xs font-medium transition-colors">Ano</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="glass-panel p-6 rounded-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white">Receita Recorrente (MRR Est.)</h3>
                        <span className="text-primary font-mono font-bold">R$ {stats.estimatedMRR.toLocaleString()}</span>
                    </div>
                    <div className="h-64 flex items-end gap-2">
                        {[35, 42, 45, 40, 55, 60, 58, 65, 70, 75, 80, 85].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col gap-2 group">
                                <div className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden group-hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-text-muted font-mono uppercase tracking-widest">
                        <span>Jan 2024</span><span>Dez 2024</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white">Churn Rate (%)</h3>
                        <span className="text-rose-400 font-mono font-bold">1.2%</span>
                    </div>
                    <div className="h-64 flex items-end gap-2">
                        {[12, 10, 8, 5, 6, 4, 3, 4, 2, 2, 1.5, 1.2].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col gap-2 group">
                                <div className="w-full bg-rose-500/10 rounded-t-lg relative overflow-hidden group-hover:bg-rose-500/20 transition-colors" style={{ height: `${h * 5}%` }}>
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500/50"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-text-muted font-mono uppercase tracking-widest">
                        <span>Jan 2024</span><span>Dez 2024</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'LTV (Lifetime Value)', val: `R$ ${stats.ltv.toLocaleString()}`, sub: 'Média por cliente', color: 'text-emerald-400' },
                    { title: 'CAC (Custo Aquisição)', val: `R$ ${stats.cac.toLocaleString()}`, sub: 'Redução de 10%', color: 'text-blue-400' },
                    { title: 'NPS (Net Promoter Score)', val: stats.nps, sub: 'Zona de Excelência', color: 'text-purple-400' },
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