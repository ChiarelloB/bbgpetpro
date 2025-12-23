import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

// Activity Interface
interface Activity {
  id: string;
  type: 'appointment' | 'client_registered' | 'review';
  userInitials: string;
  userName: string;
  action: string;
  target?: string;
  time: string;
  color: string;
  timestamp: Date;
}

const DAILY_GOAL = 100;

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    companies: 0,
    pets: 0,
    mrr: 0,
    appointments: 0,
    newClientsToday: 0
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch Global Stats via RPC (bypassing RLS)
      const { data: globalStats, error: statsError } = await supabase.rpc('get_admin_dashboard_stats');

      if (statsError) throw statsError;

      // Fetch Recent Activity (Appointments and New Clients) - These might still be subject to RLS if not also in an RPC
      // For now, we'll keep them as is, or we might need another RPC for global activity if requested.
      const { data: recentAppts } = await supabase
        .from('appointments')
        .select('id, created_at, professional, status, services:service_id(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentClients } = await supabase
        .from('clients')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Transform and Merge Activities
      const activities: Activity[] = [];

      recentClients?.forEach((c: any) => {
        activities.push({
          id: c.id,
          type: 'client_registered',
          userInitials: c.name.substring(0, 2).toUpperCase(),
          userName: c.name.split(' ')[0],
          action: 'cadastrou',
          target: 'Novo Pet',
          time: getTimeAgo(new Date(c.created_at)),
          color: 'from-purple-500 to-indigo-600',
          timestamp: new Date(c.created_at)
        });
      });

      recentAppts?.forEach((a: any) => {
        activities.push({
          id: a.id,
          type: 'appointment',
          userInitials: a.professional ? a.professional.substring(0, 2).toUpperCase() : 'AG',
          userName: a.professional || 'Sistema',
          action: 'agendou',
          target: 'Serviço',
          time: getTimeAgo(new Date(a.created_at)),
          color: 'from-blue-500 to-cyan-600',
          timestamp: new Date(a.created_at)
        });
      });

      // Sort by timestamp desc and take top 5
      const sortedActivities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 4);

      if (globalStats) {
        setStats({
          companies: globalStats.companies || 0,
          pets: globalStats.pets || 0,
          mrr: globalStats.mrr || 0,
          appointments: globalStats.appointments || 0,
          newClientsToday: globalStats.new_clients_today || 0
        });
      }
      setRecentActivity(sortedActivities);

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
    setLoading(false);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos atrás";
    return Math.floor(seconds) + " segundos atrás";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Dashboard</h2>
          <p className="text-text-muted text-sm font-light">Status consolidado e métricas em tempo real.</p>
        </div>
      </header>

      {/* Top Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: 'payments', color: 'text-primary', bg: 'bg-primary/10', label: 'MRR Total', value: `R$ ${stats.mrr.toLocaleString()}`, trend: '+12%' },
          { icon: 'pets', color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Total Pets', value: stats.pets.toLocaleString(), trend: '+5%' },
          { icon: 'store', color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Empresas Ativas', value: stats.companies.toLocaleString(), trend: '+2%' },
          { icon: 'calendar_month', color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Total Agendamentos', value: stats.appointments.toLocaleString(), trend: '+8%' }
        ].map((item, idx) => (
          <div key={idx} className="glass-panel rounded-4xl p-6 glass-card-hover transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 ${item.bg} rounded-2xl ${item.color}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{item.trend}</span>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-text-muted text-xs font-bold uppercase tracking-wider">{item.label}</p>
              <h3 className="text-2xl font-black text-white">{loading ? '...' : item.value}</h3>
            </div>
            {/* Decorative gradient blob */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${item.bg} blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* App do Tutor (Novos Tutores & Atividade) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Engajamento & Crescimento</h3>
          </div>
          <div className="glass-panel rounded-4xl p-6 flex-1 flex flex-col gap-6 relative overflow-hidden">

            <div>
              <div className="flex justify-between items-end mb-4">
                <h4 className="font-bold text-lg text-white">Novos Tutores</h4>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg">Meta: {DAILY_GOAL}/dia</span>
              </div>

              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.min((stats.newClientsToday / DAILY_GOAL) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-white">{Math.round((stats.newClientsToday / DAILY_GOAL) * 100)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-3xl p-4 border border-white/5 hover:border-purple-500/20 transition-colors">
                <span className="material-symbols-outlined text-purple-400 mb-2 text-2xl">person_add</span>
                <p className="text-2xl font-bold text-white">{stats.newClientsToday}</p>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Hoje</p>
              </div>
              <div className="bg-black/20 rounded-3xl p-4 border border-white/5 hover:border-purple-500/20 transition-colors">
                <span className="material-symbols-outlined text-purple-400 mb-2 text-2xl">pets</span>
                <p className="text-2xl font-bold text-white">{stats.pets}</p>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Pets Total</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col mt-2">
              <h5 className="text-xs font-bold uppercase text-text-muted mb-4 tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history</span> Atividade Recente
              </h5>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-text-muted text-xs italic">Nenhuma atividade recente.</p>
                ) : (
                  recentActivity.map((act, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${act.color} flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                        {act.userInitials}
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <p className="text-sm text-white font-medium leading-tight">
                          <span className="text-white/90">{act.userName}</span>{' '}
                          <span className="opacity-70 font-normal">{act.action}</span>{' '}
                          {act.target && <span className="text-purple-400 font-bold">{act.target}</span>}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          </div>
        </div>

        {/* Web & Vendas (Conversão & Tráfego) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Conversão & Tráfego</h3>
          </div>

          {/* Card Conversão */}
          <div className="glass-panel rounded-4xl p-6 relative overflow-hidden group min-h-[180px] flex flex-col justify-center">
            <div className="absolute right-[-20%] top-[-20%] w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full group-hover:bg-blue-500/30 transition-all duration-500"></div>

            <div className="relative z-10 mb-4">
              <h4 className="font-bold text-lg text-white">Conversão Demo</h4>
              <p className="text-text-muted text-xs">Visitantes para Leads qualificados</p>
            </div>

            <div className="flex items-end gap-3 relative z-10">
              <h2 className="text-5xl font-black text-white tracking-tight">4.8%</h2>
              <span className="text-xs text-emerald-400 font-bold mb-2 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">+0.4%</span>
            </div>

            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-6">
              <div className="h-full w-[48%] bg-gradient-to-r from-blue-400 to-indigo-500 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
            </div>
          </div>

          {/* Card Origem Tráfego */}
          <div className="glass-panel rounded-4xl p-6 flex-1 flex flex-col">
            <h4 className="font-bold text-lg mb-6 text-white">Origem de Tráfego</h4>
            <div className="space-y-6">
              {[
                { l: 'Orgânico (Google)', v: '45%', c: 'bg-white/80', w: '45%' },
                { l: 'Social (Instagram)', v: '32%', c: 'bg-pink-500', w: '32%' },
                { l: 'Pago (Ads)', v: '23%', c: 'bg-blue-500', w: '23%' }
              ].map((t, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-wider">
                    <span className="text-text-muted">{t.l}</span>
                    <span className="text-white">{t.v}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className={`h-full w-[${t.w}] ${t.c} rounded-full shadow-lg`}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-auto w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-xs uppercase font-bold tracking-widest transition-all text-text-muted hover:text-white flex items-center justify-center gap-2 group">
              Ver Relatório Completo
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Performance CRM (Chart Placeholder with updated style) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Performance Global</h3>
          </div>
          <div className="glass-panel rounded-4xl p-6 flex-1 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-bold text-lg text-white">Crescimento</h4>
              <select className="bg-black/20 border border-white/10 text-xs rounded-lg px-3 py-1.5 text-text-muted outline-none font-medium hover:border-white/20 transition-colors">
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
              </select>
            </div>

            <div className="flex-1 flex items-end justify-between gap-3 pb-4 border-b border-white/5">
              {[
                { h: 'h-[40%]', l: 'Jan', v: '40' }, { h: 'h-[50%]', l: 'Fev', v: '50' },
                { h: 'h-[30%]', l: 'Mar', v: '30' }, { h: 'h-[60%]', l: 'Abr', v: '60' },
                { h: 'h-[75%]', l: 'Mai', v: '75' }, { h: 'h-[90%]', l: 'Jun', active: true, v: '90' }
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-3 w-full group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded mb-1 pointer-events-none">
                    {bar.v}%
                  </div>
                  <div className={`w-full max-w-[40px] ${bar.active ? 'bg-gradient-to-t from-primary to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 hover:bg-white/10'} rounded-t-lg relative transition-all duration-500 ${bar.h}`}>
                    {!bar.active && <div className="absolute bottom-0 w-full h-1 bg-primary/50"></div>}
                  </div>
                  <span className={`text-[10px] ${bar.active ? 'text-white font-bold' : 'text-text-muted font-medium'}`}>{bar.l}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div>
                <p className="text-text-muted text-[10px] font-bold uppercase mb-1 tracking-wider">Média Mensal</p>
                <p className="text-xl font-bold text-white">+12.5%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};