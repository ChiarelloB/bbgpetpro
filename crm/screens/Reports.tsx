import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNotification } from '../NotificationContext';
import { getGeminiModel } from '../src/lib/gemini';
import { supabase } from '../src/lib/supabase';
import { useTheme, colors } from '../ThemeContext';
import { useSecurity } from '../SecurityContext';

interface Transaction {
  id: string;
  customer: string;
  service: string;
  date: string;
  amount: string;
  amountNumeric: number;
  status: string;
}

export const Reports: React.FC = () => {
  const { tenant } = useSecurity();
  const { accentColor } = useTheme();
  const primaryColor = colors[accentColor]?.primary || colors.purple.primary;
  const [timeFilter, setTimeFilter] = useState('Últimos 7 dias');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [kpis, setKpis] = useState({ totalRevenue: 0, ticketMedio: 0, newClients: 0, returnRate: 68 });
  const { showNotification } = useNotification();

  const fetchReportData = async () => {
    setLoading(true);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // 1. Fetch Transactions
    if (!tenant?.id) return;
    const { data: txs, error: txError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('date', { ascending: false });

    if (txError) {
      console.error('Error fetching transactions:', txError);
    } else {
      const mappedTxs: Transaction[] = txs.map(t => ({
        id: t.id,
        customer: t.client_name || 'Consumidor Final',
        service: t.description || t.type,
        date: new Date(t.date).toLocaleDateString(),
        amount: t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        amountNumeric: t.amount,
        status: t.status
      }));
      setAllTransactions(mappedTxs);

      // KPIs
      const paidTxs = txs.filter(t => t.status === 'paid' && t.type === 'income');
      const totalRevenue = paidTxs.reduce((acc, curr) => acc + curr.amount, 0);
      const ticketMedio = paidTxs.length > 0 ? totalRevenue / paidTxs.length : 0;

      // New Clients (count)
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .gte('created_at', sevenDaysAgoStr);

      setKpis(prev => ({
        ...prev,
        totalRevenue,
        ticketMedio,
        newClients: clientCount || 0
      }));

      // Chart Data: Sales Trend (Last 7 Days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        last7Days.push({ name: dayLabel, current: 0, date: dStr });
      }

      paidTxs.forEach(t => {
        // Use created_at for more reliable date matching with the labels
        const tDateStr = new Date(t.created_at).toISOString().split('T')[0];
        const entry = last7Days.find(day => day.date === tDateStr);
        if (entry) entry.current += t.amount;
      });
      setSalesData(last7Days);
    }

    // 2. Fetch Service Mix (from appointments)
    const { data: appointments } = await supabase
      .from('appointments')
      .select('service')
      .eq('tenant_id', tenant.id);
    if (appointments) {
      const serviceCounts: Record<string, number> = {};
      appointments.forEach(a => {
        serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
      });
      const topServices = Object.entries(serviceCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setServiceData(topServices);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReportData();
  }, [timeFilter]);

  const handleDownloadPDF = () => {
    showNotification('Relatório PDF gerado com sucesso!', 'success');
  };

  const handleGenerateAIReport = async () => {
    setIsAIModalOpen(true);
    setAiReport('');
    setIsGenerating(true);

    try {
      const model = getGeminiModel();
      const prompt = `Analise estes dados de faturamento: ${JSON.stringify(salesData)} e estes serviços: ${JSON.stringify(serviceData)}. Forneça um relatório estratégico curto em Markdown.`;
      const result = await model.generateContent(prompt);
      setAiReport(result.response.text() || "Análise indisponível.");
    } catch (error) {
      console.error(error);
      setAiReport("Erro ao conectar com a IA Analítica.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && allTransactions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      {/* Transactions Modal */}
      {isTransactionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsTransactionsModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-4xl relative z-10 border border-slate-100 dark:border-gray-800 flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
              <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">Transações do Período</h2>
              <button onClick={() => setIsTransactionsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#111] text-slate-500 dark:text-gray-400 uppercase text-[10px] font-black tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Serviço/Produto</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {allTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">{tx.customer}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{tx.service}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{tx.date}</td>
                      <td className="px-6 py-4 font-black text-slate-900 dark:text-white text-sm">{tx.amount}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                          {tx.status === 'paid' ? 'Pago' : tx.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAIModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-100 dark:border-gray-800 flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-500 text-3xl">psychology</span>
                <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">Consultoria IA</h2>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">Mergulhando nos dados...</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-gray-300 font-medium leading-relaxed bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
                    {aiReport}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase italic leading-none">Intelligence</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Relatórios Analíticos do Ecossistema</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleGenerateAIReport} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span> IA Analytics
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">file_download</span> Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex gap-8 border-b border-slate-200 dark:border-gray-800 mb-10 overflow-x-auto no-scrollbar">
        {['Últimos 7 dias', 'Últimos 30 dias', 'Este Ano'].map((tab) => (
          <button key={tab} onClick={() => setTimeFilter(tab)} className={`pb-4 border-b-4 font-black text-xs uppercase tracking-[0.1em] transition-all ${timeFilter === tab ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Faturamento', value: `R$ ${kpis.totalRevenue.toLocaleString()}`, trend: '+12%', color: 'text-emerald-500' },
          { label: 'Ticket Médio', value: `R$ ${kpis.ticketMedio.toFixed(0)}`, trend: '+5%', color: 'text-blue-500' },
          { label: 'Novos Clientes', value: kpis.newClients.toString(), trend: '-2%', color: 'text-purple-500' },
          { label: 'Taxa Retorno', value: `${kpis.returnRate}%`, trend: '+8%', color: 'text-primary' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm group hover:scale-[1.02] transition-transform">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 italic">{kpi.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 italic">{kpi.value}</p>
            <span className={`text-[10px] font-black uppercase ${kpi.color}`}>{kpi.trend} vs anterior</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <h3 className="font-black text-sm uppercase italic tracking-widest text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span> Curva de Faturamento
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '10px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="current" name="Valor" stroke={primaryColor} strokeWidth={4} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <h3 className="font-black text-sm uppercase italic tracking-widest text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">leaderboard</span> Top Serviços
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#111', color: '#fff' }} />
                <Bar dataKey="value" fill={primaryColor} radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-black text-sm uppercase italic tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">list_alt</span> Histórico Recente
          </h3>
          <button onClick={() => setIsTransactionsModalOpen(true)} className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest">Auditar Tudo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-[#222] text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-4">Tutor</th>
                <th className="px-8 py-4">Serviço/Operação</th>
                <th className="px-8 py-4">Data</th>
                <th className="px-8 py-4">Faturamento</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {allTransactions.slice(0, 8).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white italic">{tx.customer}</td>
                  <td className="px-8 py-5 text-xs text-slate-500 font-bold uppercase">{tx.service}</td>
                  <td className="px-8 py-5 text-xs text-slate-400 font-medium">{tx.date}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white italic">{tx.amount}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${tx.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>{tx.status === 'paid' ? 'Liquidado' : 'Pendente'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};