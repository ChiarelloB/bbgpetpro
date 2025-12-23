import React from 'react';

export const Reports: React.FC = () => {
    return (
        <div className="flex flex-col h-full animate-fade-in">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Relatórios & Analytics</h2>
                    <p className="text-text-muted text-sm font-light">Métricas detalhadas sobre o desempenho financeiro e operacional.</p>
                </div>
                <div className="flex items-center bg-glass border border-glass-border rounded-full p-1">
                     <button className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold">7 Dias</button>
                     <button className="px-4 py-2 rounded-full hover:bg-white/5 text-text-muted hover:text-white text-xs font-medium transition-colors">30 Dias</button>
                     <button className="px-4 py-2 rounded-full hover:bg-white/5 text-text-muted hover:text-white text-xs font-medium transition-colors">3 Meses</button>
                     <button className="px-4 py-2 rounded-full hover:bg-white/5 text-text-muted hover:text-white text-xs font-medium transition-colors">Ano</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="glass-panel p-6 rounded-4xl">
                     <h3 className="font-bold text-white mb-6">Receita Recorrente (MRR)</h3>
                     <div className="h-64 flex items-end gap-2">
                         {[35, 42, 45, 40, 55, 60, 58, 65, 70, 75, 80, 85].map((h, i) => (
                             <div key={i} className="flex-1 flex flex-col gap-2 group">
                                 <div className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden group-hover:bg-primary/40 transition-colors" style={{height: `${h}%`}}>
                                     <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50"></div>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="flex justify-between mt-4 text-xs text-text-muted font-mono uppercase">
                         <span>Jan</span><span>Dez</span>
                     </div>
                </div>

                <div className="glass-panel p-6 rounded-4xl">
                     <h3 className="font-bold text-white mb-6">Churn Rate</h3>
                     <div className="h-64 flex items-end gap-2">
                         {[12, 10, 8, 5, 6, 4, 3, 4, 2, 2, 1.5, 1.2].map((h, i) => (
                             <div key={i} className="flex-1 flex flex-col gap-2 group">
                                 <div className="w-full bg-rose-500/10 rounded-t-lg relative overflow-hidden group-hover:bg-rose-500/20 transition-colors" style={{height: `${h * 5}%`}}>
                                     <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500/50"></div>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="flex justify-between mt-4 text-xs text-text-muted font-mono uppercase">
                         <span>Jan</span><span>Dez</span>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                     { title: 'LTV (Lifetime Value)', val: 'R$ 2.450', sub: 'Média por cliente' },
                     { title: 'CAC (Custo Aquisição)', val: 'R$ 180', sub: 'Redução de 10%' },
                     { title: 'NPS (Net Promoter Score)', val: '72', sub: 'Zona de Excelência' },
                 ].map((kpi, i) => (
                     <div key={i} className="glass-panel p-6 rounded-3xl">
                         <p className="text-text-muted text-xs font-bold uppercase mb-2">{kpi.title}</p>
                         <p className="text-3xl font-bold text-white mb-1">{kpi.val}</p>
                         <p className="text-xs text-emerald-400">{kpi.sub}</p>
                     </div>
                 ))}
            </div>
        </div>
    );
};