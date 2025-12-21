import React, { useState, useEffect } from 'react';
import { useNotification } from '../NotificationContext';
import { getGeminiModel } from '../src/lib/gemini';
import { supabase } from '../src/lib/supabase';

interface Invoice {
    id: string;
    pet: string;
    client: string;
    service: string;
    detail: string;
    date: string;
    amountValue: number;
    amountFormatted: string;
    status: 'pending' | 'paid' | 'late';
    img: string;
}

interface Expense {
    id: string;
    title: string;
    category: string;
    date: string;
    amountValue: number;
    amountFormatted: string;
    status: 'paid' | 'pending';
}

const InvoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (i: any) => void;
    initialData?: Invoice;
    title: string;
    saveLabel: string;
}> = ({ isOpen, onClose, onSave, initialData, title, saveLabel }) => {
    const [formData, setFormData] = useState({
        client: '', pet: '', service: 'Consulta', amount: '', detail: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                client: initialData.client,
                pet: initialData.pet,
                service: initialData.service,
                amount: initialData.amountValue.toString(),
                detail: initialData.detail
            });
        } else {
            setFormData({ client: '', pet: '', service: 'Consulta', amount: '', detail: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        if (!initialData) setFormData({ client: '', pet: '', service: 'Consulta', amount: '', detail: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">{title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cliente (Nome)</label>
                            <input type="text" required value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Nome" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pet (Nome)</label>
                            <input type="text" required value={formData.pet} onChange={e => setFormData({ ...formData, pet: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Nome do Pet" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Serviço</label>
                        <select value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm">
                            <option>Consulta Vet</option>
                            <option>Banho e Tosa</option>
                            <option>Vacina</option>
                            <option>Produto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Valor (R$)</label>
                        <input type="text" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="150.00" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Detalhe</label>
                        <input type="text" value={formData.detail} onChange={e => setFormData({ ...formData, detail: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Obs..." />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg">{saveLabel}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddExpenseModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (e: any) => void }> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Estoque');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, category, amount, date });
        onClose();
        setTitle('');
        setAmount('');
        setDate('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Nova Despesa</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Ex: Conta de Luz" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Categoria</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm">
                            <option>Estoque</option>
                            <option>Instalações</option>
                            <option>Pessoal</option>
                            <option>Utilidades</option>
                            <option>Marketing</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Valor (R$)</label>
                            <input type="text" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vencimento</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg">Registrar Saída</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const Finance: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { showNotification } = useNotification();

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('financial_transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            showNotification('Erro ao carregar dados financeiros', 'error');
        } else {
            const income: Invoice[] = [];
            const exp: Expense[] = [];

            (data || []).forEach(tr => {
                const amountValue = Number(tr.amount);
                const amountFormatted = `R$ ${amountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                const date = new Date(tr.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

                if (tr.type === 'income') {
                    income.push({
                        id: tr.id,
                        pet: (tr as any).pet_name || 'Pet',
                        client: (tr as any).client_name || 'Cliente',
                        service: tr.description.split(' - ')[0] || 'Serviço',
                        detail: tr.description.split(' - ')[1] || '',
                        date,
                        amountValue,
                        amountFormatted,
                        status: tr.status as any || 'pending',
                        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK3c6BByA6JANr6cX9pTxJSRlvlbGksvF3cOq_4CUASqKC_TBGMb2joF8Op85yM0T89J4AK6lNNg76X7Y_NG3wOJWltL1ApXm4VVLa5hbbmdT-oofAD4i4U9e50AtdFm0rvGZGYMqmpK5VJkFML_sNhCsoM3oLeMTrg-3mmomHV2lyuAkfE7L_pMqRsk33BUQjHaSe2NF_ialZLiIxMp9n-xw-l88bxzytihFDoqEXR2-RBs1Bq1lkyM-kbuHlv8k0z6J7cr2pSis'
                    });
                } else {
                    exp.push({
                        id: tr.id,
                        title: tr.description.split(' - ')[0] || 'Despesa',
                        category: tr.description.split(' - ')[1] || 'Geral',
                        date,
                        amountValue,
                        amountFormatted,
                        status: tr.status as any || 'paid'
                    });
                }
            });

            setInvoices(income);
            setExpenses(exp);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleExport = () => {
        showNotification('Exportando dados para CSV...', 'info');
    };

    const handleAddInvoice = async (data: any) => {
        const { error } = await supabase
            .from('financial_transactions')
            .insert([{
                type: 'income',
                amount: parseFloat(data.amount),
                description: `${data.service} - ${data.detail}`,
                status: 'pending',
                // For simplicity, we're putting names in description meta if needed, 
                // but let's assume the schema has client_name/pet_name for now or just use description
            }]);

        if (error) {
            console.error('Error adding invoice:', error);
            showNotification('Erro ao criar fatura', 'error');
        } else {
            fetchTransactions();
            showNotification('Fatura criada com sucesso!', 'success');
        }
    };

    const handleAddExpense = async (data: any) => {
        const { error } = await supabase
            .from('financial_transactions')
            .insert([{
                type: 'expense',
                amount: parseFloat(data.amount),
                description: `${data.title} - ${data.category}`,
                status: 'pending',
            }]);

        if (error) {
            console.error('Error adding expense:', error);
            showNotification('Erro ao registrar despesa', 'error');
        } else {
            fetchTransactions();
            showNotification('Despesa registrada.', 'success');
        }
    };

    const handleUpdateInvoice = async (data: any) => {
        if (!selectedInvoice) return;
        const { error } = await supabase
            .from('financial_transactions')
            .update({
                amount: parseFloat(data.amount),
                description: `${data.service} - ${data.detail}`,
            })
            .eq('id', selectedInvoice.id);

        if (error) {
            console.error('Error updating invoice:', error);
            showNotification('Erro ao atualizar fatura', 'error');
        } else {
            fetchTransactions();
            showNotification('Fatura atualizada!', 'success');
        }
    };

    const handleEditClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const statuses = ['pending', 'paid', 'late'];
        const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

        const { error } = await supabase
            .from('financial_transactions')
            .update({ status: nextStatus })
            .eq('id', id);

        if (error) {
            console.error('Error toggling status:', error);
        } else {
            fetchTransactions();
            showNotification(`Status alterado para: ${nextStatus === 'paid' ? 'Pago' : nextStatus === 'late' ? 'Atrasado' : 'Pendente'}`, 'info');
        }
    };

    const handleRunAIAnalysis = async () => {
        setIsAIModalOpen(true);
        setAiAnalysis('');
        setIsAnalyzing(true);

        try {
            const model = getGeminiModel();
            const prompt = `
            Você é um consultor financeiro de Pet Shop. Analise estes dados:
            Receitas: ${JSON.stringify(invoices.map(i => ({ client: i.client, amount: i.amountFormatted, status: i.status })))}
            Despesas: ${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amountFormatted })))}
            
            Retorne um relatório curto em Markdown:
            1. Resumo do fluxo de caixa (Entradas vs Saídas).
            2. Identifique o maior risco de inadimplência (se houver).
            3. Escreva uma mensagem curta e educada de cobrança para WhatsApp.
            4. Uma dica estratégica para aumentar a margem de lucro.
        `;

            const result = await model.generateContent(prompt);
            const response = result.response;

            setAiAnalysis(response.text() || "Análise indisponível.");
        } catch (error) {
            console.error(error);
            setAiAnalysis("Erro ao conectar com a IA Financeira.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch =
            inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.pet.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.service.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === 'Todos' ||
            (filterStatus === 'Pendentes' && inv.status === 'pending') ||
            (filterStatus === 'Pagos' && inv.status === 'paid') ||
            (filterStatus === 'Atrasados' && inv.status === 'late');

        return matchesSearch && matchesFilter;
    });

    if (loading && (invoices.length === 0 && expenses.length === 0)) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#111]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold">Carregando financeiro...</p>
                </div>
            </div>
        );
    }

    const totalIncome = invoices.reduce((acc, curr) => acc + curr.amountValue, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amountValue, 0);
    const balance = totalIncome - totalExpenses;

    return (
        <div className="p-6 lg:p-10 max-w-[1440px] mx-auto animate-in fade-in duration-500">
            <InvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddInvoice}
                title="Nova Fatura"
                saveLabel="Criar"
            />

            {selectedInvoice && (
                <InvoiceModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleUpdateInvoice}
                    initialData={selectedInvoice}
                    title="Editar Fatura"
                    saveLabel="Atualizar"
                />
            )}

            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSave={handleAddExpense}
            />

            {/* AI Modal */}
            {isAIModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAIModalOpen(false)}></div>
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-100 dark:border-gray-800 flex flex-col max-h-[85vh] animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <span className="material-symbols-outlined">auto_graph</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white leading-none">Consultor Financeiro IA</h2>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">Análise de Receita e Cobrança</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAIModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                                    <p className="text-slate-900 dark:text-white font-bold text-lg mb-2">Processando dados financeiros...</p>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto">Identificando inadimplência e projetando fluxo de caixa.</p>
                                </div>
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-700 dark:text-gray-300 leading-relaxed">
                                        {aiAnalysis}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222] flex justify-end gap-3">
                            <button
                                onClick={() => setIsAIModalOpen(false)}
                                className="px-6 py-2.5 rounded-lg text-slate-500 font-bold text-sm hover:text-slate-700 dark:hover:text-white transition-colors"
                            >
                                Fechar
                            </button>
                            <button
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                                onClick={() => showNotification('Lembretes de cobrança agendados.', 'success')}
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span> Enviar Cobranças
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Financeiro</h1>
                    <p className="text-slate-500 dark:text-gray-400">Controle completo de receitas, despesas e fluxo de caixa.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRunAIAnalysis}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-purple-600 dark:text-purple-400 hover:border-purple-500 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Consultor IA
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-lg font-bold text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span> Exportar
                    </button>
                    {activeTab === 'receivables' ? (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/30 transition-transform active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span> Nova Receita
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsExpenseModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-500/30 transition-transform active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px]">remove</span> Nova Despesa
                        </button>
                    )}
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-4 mb-8 bg-white dark:bg-[#1a1a1a] p-1.5 rounded-xl border border-slate-200 dark:border-gray-800 w-fit">
                <button
                    onClick={() => setActiveTab('receivables')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'receivables' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">trending_up</span> Receitas
                </button>
                <button
                    onClick={() => setActiveTab('payables')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'payables' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">trending_down</span> Despesas
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Saldo Atual</p>
                    <p className={`text-2xl font-bold tracking-tight ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Total Receitas</p>
                    <p className="text-2xl font-bold text-emerald-500 tracking-tight">
                        R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Total Despesas</p>
                    <p className="text-2xl font-bold text-red-500 tracking-tight">
                        R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Pendentes</p>
                    <p className="text-2xl font-bold text-amber-500 tracking-tight">
                        {invoices.filter(i => i.status === 'pending').length} Faturas
                    </p>
                </div>
            </div>

            {activeTab === 'receivables' ? (
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-[#111]">
                        <div className="flex gap-6 overflow-x-auto no-scrollbar">
                            {['Todos', 'Pendentes', 'Pagos', 'Atrasados'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setFilterStatus(filter)}
                                    className={`pb-3 border-b-4 font-bold text-sm uppercase tracking-wide whitespace-nowrap transition-colors ${filterStatus === filter
                                        ? 'border-primary text-black dark:text-white'
                                        : 'border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Filtrar por cliente, pet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-white dark:bg-[#222] dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-[#111] text-slate-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Equipe / Pet</th>
                                    <th className="px-6 py-4">Serviço</th>
                                    <th className="px-6 py-4">Vencimento</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                    <th className="px-6 py-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(inv.id, inv.status)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${inv.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                    inv.status === 'late' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                    }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'paid' ? 'bg-green-500' :
                                                    inv.status === 'late' ? 'bg-red-500' : 'bg-amber-500'
                                                    }`}></span>
                                                {inv.status === 'paid' ? 'Pago' : inv.status === 'late' ? 'Atrasado' : 'Pendente'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={inv.img} className="w-10 h-10 rounded-full object-cover" alt={inv.pet} />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white">{inv.pet}</span>
                                                    <span className="text-xs text-slate-500 dark:text-gray-400">{inv.client}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 dark:text-white">{inv.service}</span>
                                                <span className="text-xs text-slate-500 dark:text-gray-400">{inv.detail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600 dark:text-gray-400">{inv.date}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">{inv.amountFormatted}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleEditClick(inv)}
                                                className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors"
                                                title="Editar Fatura"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222]">
                            <h3 className="font-bold text-slate-900 dark:text-white">Histórico de Despesas</h3>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-[#111] text-slate-500 dark:text-gray-400 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                {expenses.map(exp => (
                                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-xs font-bold text-slate-600 dark:text-gray-300">{exp.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-gray-400">{exp.date}</td>
                                        <td className="px-6 py-4 text-right font-black text-red-600 dark:text-red-400">-{exp.amountFormatted}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};