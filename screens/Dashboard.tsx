import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';
import { ScreenType, Appointment } from '../types';
import { AppointmentModal } from '../components/AppointmentModal';
import { useTheme, colors } from '../ThemeContext';

interface DashboardProps {
  onNavigate: (screen: ScreenType) => void;
}

interface AppointmentSnapshot {
  id: string;
  time: string;
  client: string;
  pet: string;
  service: string;
  status: string;
  avatar: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { accentColor } = useTheme();
  const primaryColor = colors[accentColor]?.primary || colors.purple.primary;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeFilter, setTimeFilter] = useState('7 Dias');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, appointments: 0, newClients: 0 });
  const [todayAppointments, setTodayAppointments] = useState<AppointmentSnapshot[]>([]);
  const { showNotification } = useNotification();

  const fetchDashboardData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // 1. Fetch Today's Appointments
    const { data: appts } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', today)
      .order('start_time', { ascending: true });

    setTodayAppointments((appts || []).map(a => ({
      id: a.id,
      time: a.start_time.substring(0, 5),
      client: a.client_name,
      pet: a.pet_name,
      service: a.service,
      status: a.status,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.pet_name)}&background=random`
    })));

    // 2. Fetch Stats
    // Revenue (Sum of paid invoices)
    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'invoice')
      .eq('status', 'paid');

    const totalRevenue = (transactions || []).reduce((acc, curr) => acc + curr.amount, 0);

    // New Clients (Last 7 days)
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgoStr);

    setStats({
      revenue: totalRevenue,
      appointments: appts?.length || 0,
      newClients: clientCount || 0
    });

    // 3. Generate Chart Data (Simplified for now - Daily for last 7 days)
    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      last7DaysData.push({ name: dayLabel, value: 0, date: dStr });
    }

    const { data: recentRevenue } = await supabase
      .from('financial_transactions')
      .select('amount, date')
      .eq('type', 'invoice')
      .eq('status', 'paid')
      .gte('date', sevenDaysAgoStr);

    (recentRevenue || []).forEach(tr => {
      const entry = last7DaysData.find(item => item.date === tr.date);
      if (entry) entry.value += tr.amount;
    });

    setChartData(last7DaysData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const handleAddAppointment = async (appt: any) => {
    const startTimestamp = `${appt.date}T${appt.startTime}:00`;
    const { error } = await supabase
      .from('appointments')
      .insert([{
        resource_id: appt.resourceId || null,
        client_id: appt.clientId || null,
        pet_id: appt.petId || null,
        service: appt.service,
        start_time: startTimestamp,
        duration: appt.duration,
        status: appt.status || 'pending',
        notes: appt.notes,
        professional: appt.professional
      }]);

    if (error) {
      console.error('Error adding appointment:', error);
      showNotification('Erro ao criar agendamento', 'error');
    } else {
      showNotification('Agendamento criado! Verifique a tela de Agenda.', 'success');
      fetchDashboardData();
    }
  };

  const handleReport = async () => {
    setIsReportOpen(true);
    if (reportContent) return;

    setIsGenerating(true);
    try {
      const { getGeminiModel } = await import('../src/lib/gemini');
      const model = getGeminiModel();
      const prompt = `Analise estes dados de faturamento semanal: ${JSON.stringify(chartData)}. Forneça um resumo executivo curto em Markdown.`;
      const result = await model.generateContent(prompt);
      setReportContent(result.response.text() || "Sem insights no momento.");
    } catch (error) {
      setReportContent("Erro ao gerar análise IA.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && chartData.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight uppercase leading-tight">
            <div className="text-slate-900 dark:text-white">Quartel</div>
            <div className="text-primary italic">General</div>
          </h1>
          <p className="text-xs text-gray-400 mt-2">Painel de Performance em Tempo Real</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-sm font-black uppercase italic shadow-xl shadow-primary/20 transition-all transform active:scale-95 border border-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Agendar Pet
          </button>
          <button
            onClick={handleReport}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold border border-white/10 transition-all backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">temp_preferences_custom</span>
            Insights IA
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Receita Total', value: `R$ ${stats.revenue.toLocaleString()}`, trend: 'Acumulado', icon: 'payments', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Pets Hoje', value: stats.appointments.toString(), trend: 'Hoje', icon: 'pets', color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Novos Tutores', value: stats.newClients.toString(), trend: '7 dias', icon: 'person_add', color: 'text-blue-500', bg: 'bg-blue-500/10' }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-4 ${card.bg} ${card.color} rounded-bl-3xl opacity-60 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-3xl">{card.icon}</span>
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{card.title}</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">{card.value}</span>
              <span className="text-[10px] font-black uppercase text-slate-400 mb-1.5">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Fluxo de Receita</h3>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Últimos 7 dias de operação</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              {['7 Dias', '30 Dias', 'Ano'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${timeFilter === tab ? 'bg-white dark:bg-[#333] text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1a1a1a', color: '#fff', padding: '12px' }}
                  cursor={{ stroke: primaryColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Controls & Agenda */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm shrink-0">
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-6 italic">Painel de Acesso</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Tutores', icon: 'person_add', color: 'primary', screen: 'clients' },
                { label: 'Estoque', icon: 'inventory_2', color: 'blue-500', screen: 'inventory' },
                { label: 'Vendas', icon: 'receipt_long', color: 'emerald-500', screen: 'finance' },
                { label: 'Notificar', icon: 'campaign', color: 'purple-500', screen: 'communication' }
              ].map((act, i) => (
                <button key={i} onClick={() => onNavigate(act.screen as any)} className="group p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex flex-col items-center gap-3 border border-transparent hover:border-slate-200 dark:hover:border-gray-700">
                  <span className={`material-symbols-outlined text-${act.color} group-hover:scale-110 transition-transform`}>{act.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400">{act.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Missões de Hoje</h3>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg">{todayAppointments.length}</span>
              </div>
              <button onClick={() => onNavigate('schedule')} className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">calendar_view_day</span></button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-100 dark:hover:border-gray-800">
                  <div className="relative shrink-0">
                    <img src={apt.avatar} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                    {apt.status === 'in-progress' && <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white dark:border-[#1a1a1a] rounded-full animate-pulse"></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm font-black text-slate-900 dark:text-white truncate italic tracking-tight">{apt.pet}</span>
                      <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 rounded uppercase">{apt.time}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{apt.service}</p>
                  </div>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
                  <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                  <p className="text-[10px] font-black uppercase">QG Silencioso hoje</p>
                </div>
              )}
            </div>

            <button onClick={() => onNavigate('schedule')} className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">Ver Todas as Missões</button>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddAppointment}
        title="Novo Agendamento"
        saveLabel="Agendar Pet"
      />

      {/* AI Analysis Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsReportOpen(false)}></div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-100 dark:border-gray-800 flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white tracking-widest">Brainstorming IA</h2>
              </div>
              <button onClick={() => setIsReportOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
                  <p className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-widest mb-2">Processando Neurônios...</p>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Decodificando padrões de faturamento e comportamento</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-gray-300 font-medium leading-relaxed bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
                    {reportContent}
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222] flex justify-end">
              <button onClick={() => setIsReportOpen(false)} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};