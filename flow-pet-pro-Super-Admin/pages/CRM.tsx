import React from 'react';

export const CRM: React.FC = () => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Pipeline de Vendas</h2>
          <p className="text-text-muted text-sm font-light">Acompanhe as oportunidades de negócio em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-2">
                {[1,2,3].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-background-dark bg-gray-${i*100 + 500} flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-600`}>
                        {['JS', 'MC', 'RA'][i-1]}
                    </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-white/10 flex items-center justify-center text-[10px] text-white">
                    +4
                </div>
            </div>
            <button className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Novo Deal
            </button>
        </div>
      </header>

      {/* Pipeline Board */}
      <div className="flex-1 overflow-x-auto min-h-0 pb-4">
        <div className="flex gap-4 min-w-[1200px] h-full">
            {[
                { title: 'Leads (Entrada)', count: 12, value: 'R$ 18.400', color: 'border-blue-500/50', items: [
                    { name: 'Pet Shop Bicho Feliz', contact: 'Marta Souza', val: 'R$ 899', days: '2d', tag: 'Inbound' },
                    { name: 'Clínica Vet Care', contact: 'Dr. André', val: 'R$ 1.200', days: '1d', tag: 'Indicação' },
                    { name: 'Banho & Tosa Vip', contact: 'Juliana', val: 'R$ 450', days: '4h', tag: 'Ads' },
                ]},
                { title: 'Qualificação', count: 8, value: 'R$ 12.100', color: 'border-purple-500/50', items: [
                    { name: 'Shopping dos Bichos', contact: 'Fernanda', val: 'R$ 2.400', days: '5d', tag: 'Enterprise', hot: true },
                    { name: 'Amigo Fiel', contact: 'Roberto', val: 'R$ 349', days: '3d', tag: 'Pro' },
                ]},
                { title: 'Demonstração', count: 5, value: 'R$ 8.500', color: 'border-orange-500/50', items: [
                    { name: 'Hospital Vet 24h', contact: 'Dra. Carla', val: 'R$ 3.500', days: '1d', tag: 'Enterprise', hot: true },
                    { name: 'Pet Center Sul', contact: 'Marcos', val: 'R$ 899', days: '2d', tag: 'Pro' },
                ]},
                { title: 'Negociação', count: 3, value: 'R$ 4.200', color: 'border-pink-500/50', items: [
                    { name: 'Rede Pet Mais (3 un.)', contact: 'Diretoria', val: 'R$ 2.700', days: '7d', tag: 'Multi-loja' },
                ]},
                { title: 'Fechado (Ganho)', count: 14, value: 'R$ 22.150', color: 'border-emerald-500/50', items: [
                     { name: 'Cantinho do Pet', contact: 'Ricardo', val: 'R$ 199', days: 'Hoje', tag: 'Starter' },
                ]},
            ].map((col, i) => (
                <div key={i} className="flex-1 flex flex-col min-w-[280px]">
                    <div className={`flex items-center justify-between mb-3 px-1 border-b-2 ${col.color} pb-2`}>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{col.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-text-muted font-bold">{col.count}</span>
                        </div>
                        <span className="text-[10px] text-text-muted font-mono">{col.value}</span>
                    </div>
                    
                    <div className="flex-1 bg-white/[0.02] rounded-2xl p-2 space-y-3 overflow-y-auto border border-white/5">
                        {col.items.map((card, idx) => (
                            <div key={idx} className="glass-panel p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all group relative">
                                {card.hot && <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm text-white leading-tight">{card.name}</h4>
                                    <button className="text-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                                    <span className="material-symbols-outlined text-[14px]">person</span>
                                    {card.contact}
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                    <span className="text-xs font-bold text-white bg-white/5 px-2 py-1 rounded">{card.val}</span>
                                    <div className="flex items-center gap-2">
                                         <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-text-muted">{card.tag}</span>
                                         <span className={`text-[10px] ${parseInt(card.days) > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>{card.days}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-2 rounded-xl border border-dashed border-white/10 text-text-muted text-xs hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            Adicionar
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};