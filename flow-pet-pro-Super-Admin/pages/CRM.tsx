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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDeal, setNewDeal] = useState({ company_name: '', value: '', contact: '', tag: 'Starter' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            const newPipeline = initialPipeline.map((col, i) => ({
                ...col,
                items: data.filter(d => d.stage === i.toString())
            }));
            setPipeline(newPipeline);
        }
        setLoading(false);
    };

    const moveDeal = async (dealId: string, nextStage: number) => {
        // Optimistic UI update
        const newPipeline = pipeline.map(col => ({
            ...col,
            items: col.items.filter(i => i.id !== dealId)
        }));

        const dealToMove = pipeline.flatMap(c => c.items).find(i => i.id === dealId);
        if (dealToMove) {
            dealToMove.stage = nextStage.toString();
            newPipeline[nextStage].items.push(dealToMove);
            setPipeline([...newPipeline]);
        }

        const { error } = await supabase
            .from('deals')
            .update({ stage: nextStage.toString() })
            .eq('id', dealId);

        if (error) {
            alert('Erro ao mover deal: ' + error.message);
            fetchDeals(); // Revert on error
        }
    };

    const handleAddDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase
            .from('deals')
            .insert([{
                company_name: newDeal.company_name,
                value: parseFloat(newDeal.value) || 0,
                contact: newDeal.contact,
                tag: newDeal.tag,
                stage: '0',
                priority: 'Medium',
            }]);

        if (!error) {
            setIsModalOpen(false);
            setNewDeal({ company_name: '', value: '', contact: '', tag: 'Starter' });
            fetchDeals();
        } else {
            alert('Erro ao criar deal: ' + error.message);
        }
        setSaving(false);
    };

    const getDaysSince = (dateString: string) => {
        const created = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return diff === 0 ? 'Hoje' : `${diff}d`;
    };

    return (
        <div className="flex flex-col h-full animate-fade-in relative">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Pipeline de Vendas</h2>
                    <p className="text-text-muted text-sm font-light">Acompanhe as oportunidades de negócio em tempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all text-sm font-bold flex items-center gap-2"
                    >
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
                                            <h4 className="font-bold text-sm text-white leading-tight">{card.company_name}</h4>
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
                                            {card.contact || 'S/ Contato'}
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                            <span className="text-xs font-bold text-white bg-white/5 px-2 py-1 rounded">R$ {parseFloat(card.value).toLocaleString()}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-text-muted">{card.tag}</span>
                                                <span className={`text-[10px] ${getDaysSince(card.created_at).includes('d') && parseInt(getDaysSince(card.created_at)) > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                    {getDaysSince(card.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        setNewDeal(prev => ({ ...prev, stage: i.toString() }));
                                        setIsModalOpen(true);
                                    }}
                                    className="w-full py-2 rounded-xl border border-dashed border-white/10 text-text-muted text-xs hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">add</span>
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Deal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-8 rounded-4xl border border-white/10 animate-zoom-in">
                        <h3 className="text-xl font-bold text-white mb-6">Nova Oportunidade</h3>
                        <form onSubmit={handleAddDeal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Nome da Empresa</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                                    placeholder="Ex: Pet Shop do Bairro"
                                    value={newDeal.company_name}
                                    onChange={(e) => setNewDeal({ ...newDeal, company_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Valor (R$)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                                        placeholder="0.00"
                                        value={newDeal.value}
                                        onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Tag / Categoria</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none appearance-none"
                                        value={newDeal.tag}
                                        onChange={(e) => setNewDeal({ ...newDeal, tag: e.target.value })}
                                    >
                                        <option value="Starter">Starter</option>
                                        <option value="Pro">Pro</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Contato Principal</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                                    placeholder="Nome do responsável"
                                    value={newDeal.contact}
                                    onChange={(e) => setNewDeal({ ...newDeal, contact: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-2xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Criando...' : 'Criar Deal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};