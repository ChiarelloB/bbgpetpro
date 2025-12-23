import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (data) {
      setPlans(data);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Planos e Assinaturas</h2>
          <p className="text-text-muted text-sm font-light">Gerencie os pacotes comerciais e monitore a base de clientes ativos.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full transition-all shadow-lg shadow-primary/25 font-medium text-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Criar Novo Plano
          </button>
        </div>
      </header>

      <section className="mb-10">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-primary block"></span>
            Planos Disponíveis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Carregando planos...</p>
            </div>
          ) : plans.map((plan) => (
            <div key={plan.id} className="glass-panel rounded-4xl p-6 flex flex-col relative group glass-card-hover transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-white/5 rounded-2xl text-white border border-white/10">
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider ml-1">Ativo</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1 text-white">{plan.name}</h3>
              <p className="text-xs text-text-muted mb-4 h-8 line-clamp-2">{plan.description || 'Sem descrição.'}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold tracking-tight text-white">R$ {parseFloat(plan.price).toFixed(2)}</span>
                <span className="text-sm text-text-muted font-medium">/{plan.frequency === 'monthly' ? 'mês' : 'ano'}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                  <span>Limite: {plan.max_usage} {plan.usage_unit}</span>
                </li>
                {plan.services?.map((service: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text-muted">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors">Editar</button>
                <button className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors">Deletar</button>
              </div>
            </div>
          ))}

          {/* Add New Placeholder */}
          {!loading && (
            <button className="glass-panel rounded-4xl p-6 flex flex-col items-center justify-center relative group border-dashed border-2 border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all duration-300 min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                <span className="material-symbols-outlined text-3xl text-text-muted group-hover:text-primary transition-colors">add</span>
              </div>
              <h3 className="text-lg font-bold text-text-muted group-hover:text-white transition-colors">Novo Plano</h3>
              <p className="text-xs text-text-muted text-center mt-2 px-4 opacity-60">Configure um novo pacote de recursos e preços.</p>
            </button>
          )}
        </div>
      </section>

      <section className="flex flex-col flex-1 min-h-[400px]">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-purple-500 block"></span>
            Assinaturas Ativas
          </h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-glass border border-glass-border hover:bg-white/5 text-text-muted hover:text-white rounded-full transition-all text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros
            </button>
          </div>
        </div>
        <div className="glass-panel rounded-4xl overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-text-muted uppercase tracking-wider border-b border-white/5 bg-white/5">
                  <th className="px-6 py-5 font-semibold">Empresa</th>
                  <th className="px-6 py-5 font-semibold">Plano Atual</th>
                  <th className="px-6 py-5 font-semibold">Status</th>
                  <th className="px-6 py-5 font-semibold">Valor (R$)</th>
                  <th className="px-6 py-5 font-semibold">Próx. Renovação</th>
                  <th className="px-6 py-5 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                <tr className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold border border-orange-500/30">PT</div>
                      <div>
                        <p className="font-semibold text-white">Pet Top Services</p>
                        <p className="text-xs text-text-muted">CNPJ: 12.345.678/0001-90</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="font-medium text-white">Flow Professional</span></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Ativo</span></td>
                  <td className="px-6 py-4 text-text-muted font-mono">349,00</td>
                  <td className="px-6 py-4 text-text-muted">15 Set 2024</td>
                  <td className="px-6 py-4 text-right"><button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">more_vert</span></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};