import React, { useState, useEffect } from 'react';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';
import { ScreenType, Appointment } from '../types';
import { AppointmentModal } from '../components/AppointmentModal';
import { useTheme, colors } from '../ThemeContext';
import { isHoliday, getHoliday } from '../utils/holidays';

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
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [monthAppointments, setMonthAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, appointments: 0, newClients: 0 });
  const [todayAppointments, setTodayAppointments] = useState<AppointmentSnapshot[]>([]);
  const { showNotification } = useNotification();

  const fetchDashboardData = async () => {
    setLoading(true);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;

    // 1. Fetch Today's Appointments with joins
    const { data: appts } = await supabase
      .from('appointments')
      .select('*, pets(name, img), clients(name)')
      .gte('start_time', `${today}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`)
      .order('start_time', { ascending: true });

    setTodayAppointments((appts || []).map(a => ({
      id: a.id,
      time: a.start_time.includes('T') ? a.start_time.split('T')[1].substring(0, 5) : a.start_time.substring(0, 5),
      client: (a as any).clients?.name || 'Cliente',
      pet: (a as any).pets?.name || 'Pet',
      service: a.service,
      status: a.status,
      avatar: (a as any).pets?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent((a as any).pets?.name || 'P')}&background=random`
    })));

    // 2. Fetch Stats
    // Revenue (Sum of paid invoices)
    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'income')
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

    // 3. Fetch Monthly Data for calendar view
    const startOfMonth = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 1);
    const endOfMonth = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() + 1, 0);

    const startStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-01T00:00:00`;
    const endStr = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}T23:59:59`;

    const { data: monthApptsData } = await supabase
      .from('appointments')
      .select('*, pets(name, img), clients(name)')
      .gte('start_time', startStr)
      .lte('start_time', endStr)
      .order('start_time', { ascending: true });

    setMonthAppointments((monthApptsData || []).map(a => ({
      id: a.id,
      date: a.start_time.split('T')[0],
      time: a.start_time.includes('T') ? a.start_time.split('T')[1].substring(0, 5) : a.start_time.substring(0, 5),
      pet: (a as any).pets?.name || 'Pet',
      status: a.status
    })));

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, selectedCalendarDate]);

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
      const prompt = `Analise estes agendamentos de hoje: ${JSON.stringify(todayAppointments)}. Forneça um resumo executivo curto em Markdown com recomendações operacionais.`;
      const result = await model.generateContent(prompt);
      setReportContent(result.response.text() || "Sem insights no momento.");
    } catch (error) {
      setReportContent("Erro ao gerar análise IA.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && todayAppointments.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-4 lg:py-6 space-y-4 animate-in fade-in duration-500 relative w-full max-w-none overflow-hidden h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-6 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-tight">
            <span className="text-slate-900 dark:text-white">Quartel</span>
            <span className="text-primary italic ml-2">General</span>
          </h1>
          <p className="text-[10px] text-gray-400 mt-1">Painel de Performance em Tempo Real</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 lg:px-10 shrink-0">
        {[
          { title: 'Receita Total', value: `R$ ${stats.revenue.toLocaleString()}`, trend: 'Acumulado', icon: 'payments', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Pets Hoje', value: stats.appointments.toString(), trend: 'Hoje', icon: 'pets', color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'Novos Tutores', value: stats.newClients.toString(), trend: '7 dias', icon: 'person_add', color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1a1a1a] p-4 lg:p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-3 ${card.bg} ${card.color} rounded-bl-2xl opacity-60`}>
              <span className="material-symbols-outlined text-xl">{card.icon}</span>
            </div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{card.title}</p>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-black ${card.color} italic tracking-tighter`}>{card.value}</span>
              <span className="text-[9px] font-black uppercase text-slate-400 mb-1">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 px-6 lg:px-10 flex-1 min-h-0">
        {/* Unified Monthly Calendar Component */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white dark:bg-[#141414] p-6 lg:p-8 rounded-2xl border border-slate-200 dark:border-gray-800/50 shadow-2xl flex flex-col min-h-0">


          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-7 mb-6">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => (
                <div key={d} className="text-center text-[11px] font-black text-gray-500 tracking-[0.2em] uppercase">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
              {Array.from({ length: 42 }).map((_, i) => {
                const startOfMonth = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 1);
                const firstDay = startOfMonth.getDay();
                const cellDate = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), i - firstDay + 1);
                const isToday = new Date().toDateString() === cellDate.toDateString();
                const isCurrentMonth = cellDate.getMonth() === selectedCalendarDate.getMonth();
                const cellDateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
                const cellAppts = monthAppointments.filter(a => a.date === cellDateStr);

                return (
                  <div
                    key={i}
                    onClick={() => onNavigate('schedule', { date: cellDate })}
                    className={`
                      aspect-auto p-2 rounded-xl border transition-all duration-300 flex flex-col gap-1 relative group flex-1 cursor-pointer
                      hover:scale-[1.02] hover:z-20
                      ${isCurrentMonth ? 'bg-slate-50 dark:bg-[#1e1e1e] border-slate-100 dark:border-gray-800/40 hover:border-primary/40 hover:shadow-xl' : 'bg-transparent border-transparent opacity-5 pointer-events-none'}
                      ${isToday ? 'border-primary ring-1 ring-primary/20 shadow-[0_0_20px_-5px_var(--color-primary)] dark:shadow-[0_0_25px_-5px_var(--color-primary)]' : ''}
                    `}
                  >
                    <div className="flex justify-between items-center z-10 shrink-0">
                      <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md ${isToday ? 'bg-primary text-white shadow-lg' : isHoliday(cellDate) ? 'bg-red-600 text-white' : 'text-gray-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        {cellDate.getDate()}
                      </span>
                      {isHoliday(cellDate) && (
                        <span className="text-[8px] font-black uppercase text-red-500 truncate ml-1 opacity-80">{getHoliday(cellDate)?.name}</span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto nike-scroll flex-1 pr-1 min-h-0 max-h-[60px] lg:max-h-none">
                      {cellAppts.map((appt, idx) => (
                        <div
                          key={idx}
                          className={`
                            text-[9px] font-bold p-2 rounded-xl truncate tracking-tight flex items-center gap-2 border border-white/5
                            ${appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              appt.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                                'bg-primary/10 text-primary border-primary/20'}
                          `}
                        >
                          <span className="opacity-70 font-black shrink-0">{appt.time}</span>
                          <span className="uppercase truncate">{appt.pet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Controls & Agenda Stack */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4 flex flex-col min-h-0">
          {/* Top: Today's Appointments */}
          <div className="bg-white dark:bg-[#1a1a1a] p-5 lg:p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col min-h-0 max-h-[40%]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Missões de Hoje</h3>
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded-md">{todayAppointments.length}</span>
              </div>
              <button onClick={() => onNavigate('schedule')} className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">calendar_view_day</span></button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[300px]">
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

            <button onClick={() => onNavigate('schedule')} className="mt-4 w-full py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 shrink-0">Ver Todas as Missões</button>
          </div>

          {/* Middle: Side Controls (Painel de Acesso) */}
          <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm shrink-0">
            <h3 className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest mb-4 italic">Painel de Acesso</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tutores', icon: 'person_add', color: 'primary', screen: 'clients' },
                { label: 'Estoque', icon: 'inventory_2', color: 'blue-500', screen: 'inventory' },
                { label: 'Vendas', icon: 'receipt_long', color: 'emerald-500', screen: 'finance' },
                { label: 'Notificar', icon: 'campaign', color: 'purple-500', screen: 'communication' }
              ].map((act, i) => (
                <button key={i} onClick={() => onNavigate(act.screen as any)} className="group p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex flex-col items-center gap-2 border border-transparent hover:border-slate-200 dark:hover:border-gray-700">
                  <span className={`material-symbols-outlined text-sm text-${act.color}`}>{act.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400">{act.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom: Lançamentos */}
          <div className="bg-gradient-to-br from-slate-900 to-primary/20 p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-4xl text-white">rocket_launch</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-md uppercase tracking-widest">v4.2.0</span>
                <h3 className="text-[9px] font-black text-white uppercase tracking-widest italic">Lançamentos</h3>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex gap-2 items-start">
                  <span className="material-symbols-outlined text-primary text-[16px]">palette</span>
                  <p className="text-white text-[10px] font-bold leading-tight">Customização do App</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="material-symbols-outlined text-primary text-[16px]">touch_app</span>
                  <p className="text-white text-[10px] font-bold leading-tight">Gestão de Visibilidade</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('roadmap')}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Ver Roadmap
              </button>
            </div>
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