import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

export const CRM: React.FC = () => {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const initialPipeline = [
        { title: 'Leads (Entrada)', items: [] },
        { title: 'Qualificação', items: [] },
        { title: 'Demonstração', items: [] },
        { title: 'Negociação', items: [] },
        { title: 'Fechado (Ganho)', items: [] },
    ];

    const [pipeline, setPipeline] = useState(initialPipeline);

    useEffect(() => {
        // In a real app, fetch from Supabase. For this demo, let's use the mockup data but make it editable.
        const mockDeals = [
            { id: 1, name: 'Pet Shop Bicho Feliz', contact: 'Marta Souza', val: 'R$ 899', days: '2d', tag: 'Inbound', stage: 0 },
            { id: 2, name: 'Clínica Vet Care', contact: 'Dr. André', val: 'R$ 1.200', days: '1d', tag: 'Indicação', stage: 0 },
            { id: 3, name: 'Shopping dos Bichos', contact: 'Fernanda', val: 'R$ 2.400', days: '5d', tag: 'Enterprise', stage: 1, hot: true },
            { id: 4, name: 'Hospital Vet 24h', contact: 'Dra. Carla', val: 'R$ 3.500', days: '1d', tag: 'Enterprise', stage: 2, hot: true },
            { id: 5, name: 'Rede Pet Mais (3 un.)', contact: 'Diretoria', val: 'R$ 2.700', days: '7d', tag: 'Multi-loja', stage: 3 },
            { id: 6, name: 'Cantinho do Pet', contact: 'Ricardo', val: 'R$ 199', days: 'Hoje', tag: 'Starter', stage: 4 },
        ];

        const newPipeline = initialPipeline.map((col, i) => ({
            ...col,
            items: mockDeals.filter(d => d.stage === i)
        }));

        setPipeline(newPipeline);
        setLoading(false);
    }, []);

    const moveDeal = (dealId: number, nextStage: number) => {
        const allItems = pipeline.flatMap(p => p.items);
        const deal = allItems.find(d => d.id === dealId);
        if (!deal) return;

        deal.stage = nextStage;
        const newPipeline = initialPipeline.map((col, i) => ({
            ...col,
            items: allItems.filter(d => d.stage === i)
        }));
        setPipeline(newPipeline);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in relative">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Pipeline de Vendas</h2>
                    <p className="text-text-muted text-sm font-light">Acompanhe as oportunidades de negócio em tempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Novo Deal
                    </button>
                </div>
            </header>

            {/* Pipeline Board */}
            <div className="flex-1 overflow-x-auto min-h-0 pb-4">
                <div className="flex gap-4 min-w-[1200px] h-full">
                    {pipeline.map((col, i) => (
                        <div key={i} className="flex-1 flex flex-col min-w-[280px]">
                            <div className={`flex items-center justify-between mb-3 px-1 border-b-2 border-white/10 ${i === 4 ? 'border-emerald-500/50' : ''} pb-2`}>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-white">{col.title}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-text-muted font-bold">{col.items.length}</span>
                                </div>
                            </div>

                            <div className="flex-1 bg-white/[0.02] rounded-2xl p-2 space-y-3 overflow-y-auto border border-white/5 no-scrollbar">
                                {col.items.map((card: any, idx) => (
                                    <div key={idx} className="glass-panel p-4 rounded-xl hover:border-primary/30 transition-all group relative">
                                        {card.hot && <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm text-white leading-tight">{card.name}</h4>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {i > 0 && (
                                                    <button onClick={() => moveDeal(card.id, i - 1)} className="p-1 hover:bg-white/10 rounded text-text-muted hover:text-white">
                                                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                                    </button>
                                                )}
                                                {i < 4 && (
                                                    <button onClick={() => moveDeal(card.id, i + 1)} className="p-1 hover:bg-white/10 rounded text-text-muted hover:text-white">
                                                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                                    </button>
                                                )}
                                            </div>
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