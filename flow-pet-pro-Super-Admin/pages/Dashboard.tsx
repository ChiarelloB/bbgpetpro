import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    companies: 0,
    pets: 0,
    mrr: 0,
    appointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [
        { count: companyCount },
        { count: petCount },
        { data: subData },
        { count: appointCount }
      ] = await Promise.all([
        supabase.from('tenants').select('*', { count: 'exact', head: true }),
        supabase.from('pets').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('subscription_plans(price)').eq('status', 'active'),
        supabase.from('appointments').select('*', { count: 'exact', head: true })
      ]);

      const totalMRR = subData?.reduce((acc, sub: any) => acc + (parseFloat(sub.subscription_plans?.price) || 0), 0) || 0;

      setStats({
        companies: companyCount || 0,
        pets: petCount || 0,
        mrr: totalMRR,
        appointments: appointCount || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Dashboard</h2>
          <p className="text-text-muted text-sm font-light">Bem-vindo de volta. Aqui está o status consolidado do ecossistema.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: 'payments', color: 'text-primary', bg: 'bg-primary/10', label: 'MRR Total', value: `R$ ${stats.mrr.toLocaleString()}`, trend: '+0%' },
          { icon: 'pets', color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Total Pets', value: stats.pets.toLocaleString(), trend: '+0%' },
          { icon: 'store', color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Empresas Ativas', value: stats.companies.toLocaleString(), trend: '+0%' },
          { icon: 'calendar_month', color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Total Agendamentos', value: stats.appointments.toLocaleString(), trend: '+0%' }
        ].map((item, idx) => (
          <div key={idx} className="glass-panel rounded-4xl p-6 glass-card-hover transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${item.bg} rounded-2xl ${item.color}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-text-muted text-sm font-medium uppercase tracking-wide">{item.label}</p>
              <h3 className="text-2xl font-bold text-white">{loading ? '...' : item.value}</h3>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance CRM */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Performance CRM</h3>
          </div>
          <div className="glass-panel rounded-4xl p-6 flex-1 min-h-[320px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-lg text-white">Agendamentos</h4>
              <select className="bg-black/20 border border-white/10 text-xs rounded-lg px-2 py-1 text-text-muted outline-none">
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
              </select>
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2">
              {/* Chart Bars */}
              {[
                { h: 'bar-height-40', l: 'Jan' }, { h: 'bar-height-50', l: 'Fev' },
                { h: 'bar-height-30', l: 'Mar' }, { h: 'bar-height-60', l: 'Abr' },
                { h: 'bar-height-75', l: 'Mai' }, { h: 'bar-height-90', l: 'Jun', active: true }
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full group">
                  <div className={`w-full ${bar.active ? 'bg-gradient-to-t from-primary to-primary-hover shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-primary/20 hover:bg-primary/40'} rounded-t-lg relative transition-all ${bar.h} overflow-hidden`}>
                    {!bar.active && <div className="absolute bottom-0 w-full h-1 bg-primary"></div>}
                  </div>
                  <span className={`text-[10px] ${bar.active ? 'text-white font-bold' : 'text-text-muted font-medium'}`}>{bar.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-4xl p-6 flex justify-between items-center">
            <div>
              <p className="text-text-muted text-xs font-bold uppercase mb-1">Clientes Ativos</p>
              <p className="text-xl font-bold text-white">1.842 <span className="text-text-muted text-sm font-normal">pet shops</span></p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">store</span>
            </div>
          </div>
        </div>

        {/* App do Tutor */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">App do Tutor</h3>
          </div>
          <div className="glass-panel rounded-4xl p-6 flex-1 flex flex-col gap-6">
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Novos Tutores</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                </div>
                <span className="text-sm font-bold text-white">78% da meta</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-3xl p-4 border border-white/5">
                <span className="material-symbols-outlined text-purple-400 mb-2">person_add</span>
                <p className="text-2xl font-bold text-white">450</p>
                <p className="text-[10px] text-text-muted uppercase">Hoje</p>
              </div>
              <div className="bg-black/20 rounded-3xl p-4 border border-white/5">
                <span className="material-symbols-outlined text-purple-400 mb-2">pets</span>
                <p className="text-2xl font-bold text-white">892</p>
                <p className="text-[10px] text-text-muted uppercase">Pets cadastrados</p>
              </div>
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-bold uppercase text-text-muted mb-3 tracking-wider">Atividade Recente</h5>
              <div className="space-y-3">
                {[
                  { i: 'MJ', c: 'from-purple-500 to-indigo-600', t: 'Maria J. cadastrou', h: 'Thor', time: 'Há 2 minutos' },
                  { i: 'RL', c: 'from-blue-500 to-cyan-600', t: 'Ricardo L. agendou banho', h: '', time: 'Há 5 minutos' },
                  { i: 'AN', c: 'from-pink-500 to-rose-600', t: 'Ana N. avaliou o serviço', h: '', time: 'Há 12 minutos' }
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${act.c} flex items-center justify-center text-[10px] font-bold text-white`}>{act.i}</div>
                    <div className="flex-1">
                      <p className="text-xs text-white">{act.t} {act.h && <span className="text-purple-400">{act.h}</span>}</p>
                      <p className="text-[10px] text-text-muted">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Web & Vendas */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Web & Vendas</h3>
          </div>
          <div className="glass-panel rounded-4xl p-6 h-[200px] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full"></div>
            <div className="relative z-10">
              <h4 className="font-bold text-lg text-white">Conversão Demo</h4>
              <p className="text-text-muted text-xs">Visitantes para Leads qualificados</p>
            </div>
            <div className="flex items-end gap-2 relative z-10">
              <h2 className="text-4xl font-black text-white">4.8%</h2>
              <span className="text-xs text-emerald-400 font-bold mb-1 bg-black/40 px-2 py-0.5 rounded-full">+0.4%</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-2">
              <div className="h-full w-[48%] bg-gradient-to-r from-primary to-blue-400"></div>
            </div>
          </div>
          <div className="glass-panel rounded-4xl p-6 flex-1 flex flex-col">
            <h4 className="font-bold text-lg mb-4 text-white">Origem de Tráfego</h4>
            <div className="space-y-4">
              {[
                { l: 'Orgânico (Google)', v: '45%', c: 'bg-white/80' },
                { l: 'Social (Instagram)', v: '32%', c: 'bg-pink-500' },
                { l: 'Pago (Ads)', v: '23%', c: 'bg-primary' }
              ].map((t, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-muted">{t.l}</span>
                    <span className="font-bold text-white">{t.v}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className={`h-full w-[${t.v.replace('%', '')}%] ${t.c} rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-auto w-full py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-xs uppercase font-bold tracking-widest transition-all text-text-muted hover:text-white flex items-center justify-center gap-2">
              Ver Relatório Completo
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};