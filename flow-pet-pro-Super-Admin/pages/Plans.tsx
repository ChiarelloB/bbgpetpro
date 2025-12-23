import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('tenant_id', '00000000-0000-0000-0000-000000000001') // Only Global Plans
      .order('price', { ascending: true });

    if (data) {
      setPlans(data);
    }
    setLoading(false);
  };

  const fetchSubscriptions = async () => {
    setLoadingSubs(true);
    const { data } = await supabase
      .from('subscriptions')
      .select(`
        *,
        tenants (name),
        subscription_plans (name)
      `)
      .order('created_at', { ascending: false });

    if (data) setSubscriptions(data);
    setLoadingSubs(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', frequency: 'monthly', description: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price) return;
    setLoading(true);

    try {
      // 1. Call Secure Edge Function to create in Stripe
      // Note: For local development, this needs supabase functions serve running,
      // or it will try to hit the deployed ID.
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('manage-plans', {
        body: {
          action: 'create_plan',
          name: newPlan.name,
          description: newPlan.description,
          price: parseFloat(newPlan.price),
          frequency: newPlan.frequency
        }
      });

      if (stripeError) throw new Error('Stripe API Error: ' + stripeError.message);
      if (!stripeData?.stripe_product_id) throw new Error('Failed to get Stripe IDs');

      // 2. Insert into Supabase with Stripe IDs
      const { error: dbError } = await supabase
        .from('subscription_plans')
        .insert([{
          ...newPlan,
          price: parseFloat(newPlan.price),
          stripe_product_id: stripeData.stripe_product_id,
          stripe_price_id: stripeData.stripe_price_id,
          stripe_payment_link: stripeData.stripe_payment_link
        }]);

      if (dbError) throw dbError;

      setIsModalOpen(false);
      setNewPlan({ name: '', price: '', frequency: 'monthly', description: '' });
      setEditingPlan(null);
      fetchPlans();

    } catch (err: any) {
      alert('Erro ao criar plano: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.name || !editingPlan.price) return;

    const { error } = await supabase
      .from('subscription_plans')
      .update({
        name: editingPlan.name,
        price: parseFloat(editingPlan.price),
        frequency: editingPlan.frequency,
        description: editingPlan.description
      })
      .eq('id', editingPlan.id);

    if (!error) {
      setIsModalOpen(false);
      setEditingPlan(null);
      fetchPlans();
    } else {
      alert('Erro ao atualizar plano: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchPlans();
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  // State for Plan Change Modal
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [selectedNewPlanId, setSelectedNewPlanId] = useState('');

  const handleOpenChangePlan = (sub: any) => {
    setSelectedSubscription(sub);
    setSelectedNewPlanId(sub.subscription_plans?.id || '');
    setIsChangePlanModalOpen(true);
  };

  const handleChangePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubscription || !selectedNewPlanId) return;

    if (!confirm('Tem certeza que deseja alterar o plano desta empresa?')) return;

    // Find price of new plan
    const newPlan = plans.find(p => p.id === selectedNewPlanId);
    const newPrice = newPlan ? newPlan.price : 0;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: selectedNewPlanId,
        plan_name: newPlan.name,
        price_at_start: newPrice // Update the locked-in price to the new plan's current price
      })
      .eq('id', selectedSubscription.id);

    if (!error) {
      alert('Plano alterado com sucesso!');
      setIsChangePlanModalOpen(false);
      setSelectedSubscription(null);
      fetchSubscriptions();
    } else {
      alert('Erro ao alterar plano: ' + error.message);
    }
  };

  // State for Coupons
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    name: '',
    type: 'percent' as 'percent' | 'amount',
    value: '',
    duration: 'once',
    months: ''
  });

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCoupon(true);
    try {
      const body: any = {
        action: 'create_coupon',
        name: newCoupon.name,
        duration: newCoupon.duration
      };

      if (newCoupon.duration === 'repeating') {
        body.duration_in_months = parseInt(newCoupon.months);
      }

      if (newCoupon.type === 'percent') {
        body.percent_off = parseFloat(newCoupon.value);
      } else {
        body.amount_off = parseFloat(newCoupon.value);
      }

      const { data, error } = await supabase.functions.invoke('manage-plans', {
        body: body
      });

      if (error) throw error;

      alert(`Cupom ${newCoupon.name} criado com sucesso!`);
      setIsCouponModalOpen(false);
      setNewCoupon({ name: '', type: 'percent', value: '', duration: 'once', months: '' });

    } catch (err: any) {
      alert('Erro ao criar cupom: ' + err.message);
    } finally {
      setLoadingCoupon(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      {/* Modal Change Plan */}
      {isChangePlanModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-8 rounded-4xl border border-white/10 animate-zoom-in">
            <h3 className="text-xl font-bold text-white mb-2">Alterar Plano</h3>
            <p className="text-sm text-text-muted mb-6">Empresa: <span className="text-white font-medium">{selectedSubscription?.tenants?.name}</span></p>

            <form onSubmit={handleChangePlan} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Selecione o Novo Plano</label>
                <div className="space-y-3">
                  {plans.map(plan => (
                    <label key={plan.id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${selectedNewPlanId === plan.id ? 'bg-primary/20 border-primary' : 'bg-black/20 border-white/5 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={selectedNewPlanId === plan.id}
                          onChange={() => setSelectedNewPlanId(plan.id)}
                          className="w-4 h-4 text-primary bg-transparent border-white/30 focus:ring-primary"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{plan.name}</p>
                          <p className="text-xs text-text-muted">{plan.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">R$ {parseFloat(plan.price).toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePlanModalOpen(false);
                    setSelectedSubscription(null);
                  }}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 transition-all"
                >
                  Confirmar Mudança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Plano */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-8 rounded-4xl border border-white/10 animate-zoom-in">
            <h3 className="text-xl font-bold text-white mb-6">{editingPlan ? 'Editar Plano' : 'Novo Plano'}</h3>
            <form onSubmit={editingPlan ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Nome do Plano</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                  placeholder="Ex: Flow Starter"
                  value={editingPlan ? editingPlan.name : newPlan.name}
                  onChange={(e) => {
                    if (editingPlan) setEditingPlan({ ...editingPlan, name: e.target.value });
                    else setNewPlan({ ...newPlan, name: e.target.value });
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Descrição</label>
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none resize-none"
                  placeholder="Descrição breve dos recursos..."
                  rows={2}
                  value={editingPlan ? editingPlan.description : newPlan.description}
                  onChange={(e) => {
                    if (editingPlan) setEditingPlan({ ...editingPlan, description: e.target.value });
                    else setNewPlan({ ...newPlan, description: e.target.value });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                    placeholder="0.00"
                    value={editingPlan ? editingPlan.price : newPlan.price}
                    onChange={(e) => {
                      if (editingPlan) setEditingPlan({ ...editingPlan, price: e.target.value });
                      else setNewPlan({ ...newPlan, price: e.target.value });
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Frequência</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none appearance-none"
                    value={editingPlan ? editingPlan.frequency : newPlan.frequency}
                    onChange={(e) => {
                      if (editingPlan) setEditingPlan({ ...editingPlan, frequency: e.target.value });
                      else setNewPlan({ ...newPlan, frequency: e.target.value });
                    }}
                  >
                    <option className="bg-surface-dark" value="monthly">Mensal</option>
                    <option className="bg-surface-dark" value="yearly">Anual</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPlan(null);
                  }}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 transition-all"
                >
                  {editingPlan ? 'Atualizar Plano' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Planos e Assinaturas</h2>
          <p className="text-text-muted text-sm font-light">Gerencie os pacotes comerciais e monitore a base de clientes ativos.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full transition-all shadow-lg shadow-primary/25 font-medium text-sm"
          >
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
                <button
                  onClick={() => {
                    setEditingPlan(plan);
                    setIsModalOpen(true);
                  }}
                  className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-rose-400 transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}

          {/* Add New Placeholder */}
          {!loading && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="glass-panel rounded-4xl p-6 flex flex-col items-center justify-center relative group border-dashed border-2 border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all duration-300 min-h-[350px]"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                <span className="material-symbols-outlined text-3xl text-text-muted group-hover:text-primary transition-colors">add</span>
              </div>
              <h3 className="text-lg font-bold text-text-muted group-hover:text-white transition-colors">Novo Plano</h3>
              <p className="text-xs text-text-muted text-center mt-2 px-4 opacity-60">Configure um novo pacote de recursos e preços.</p>
            </button>
          )}
        </div>
      </section>



      {/* -- COUPONS SECTION START -- */}
      <section className="mt-12 mb-10 border-t border-white/10 pt-10">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-orange-500 block"></span>
            Cupons de Desconto
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-full transition-all text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(234,88,12,0.2)]"
            >
              <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
              Criar Cupom
            </button>
          </div>
        </div>

        <div className="glass-panel p-8 text-center rounded-4xl border-dashed border-2 border-white/10">
          <p className="text-text-muted mb-2">Gerencie aqui os códigos promocionais para suas campanhas.</p>
          <p className="text-xs text-text-muted opacity-60">Os cupons criados são sincronizados automaticamente com o Stripe.</p>
        </div>
      </section>

      {/* Modal Create Coupon */}
      {
        isCouponModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-8 rounded-4xl border border-white/10 animate-zoom-in">
              <h3 className="text-xl font-bold text-white mb-2">Novo Cupom</h3>
              <p className="text-sm text-text-muted mb-6">Crie um código de desconto para seus clientes.</p>

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Código do Cupom</label>
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none uppercase font-mono tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
                    placeholder="Ex: BLACKFRIDAY20"
                    value={newCoupon.name}
                    onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Tipo Desconto</label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none appearance-none"
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percent' | 'amount' })}
                    >
                      <option className="bg-surface-dark" value="percent">Porcentagem (%)</option>
                      <option className="bg-surface-dark" value="amount">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Valor</label>
                    <input
                      type="number"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                      placeholder={newCoupon.type === 'percent' ? "20" : "50.00"}
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Duração</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none appearance-none"
                    value={newCoupon.duration}
                    onChange={(e) => setNewCoupon({ ...newCoupon, duration: e.target.value })}
                  >
                    <option className="bg-surface-dark" value="once">Uma vez (Primeira fatura)</option>
                    <option className="bg-surface-dark" value="forever">Para sempre (Recorrente)</option>
                    <option className="bg-surface-dark" value="repeating">Por alguns meses...</option>
                  </select>
                </div>

                {newCoupon.duration === 'repeating' && (
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Meses de Duração</label>
                    <input
                      type="number"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                      placeholder="Ex: 3"
                      value={newCoupon.months}
                      onChange={(e) => setNewCoupon({ ...newCoupon, months: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingCoupon}
                    className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                  >
                    {loadingCoupon ? 'Criando...' : 'Criar Cupom'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {/* -- COUPONS SECTION END -- */}

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
                {loadingSubs ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-text-muted uppercase text-xs font-bold">Carregando assinaturas...</td></tr>
                ) : subscriptions.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-text-muted uppercase text-xs font-bold">Nenhuma assinatura encontrada.</td></tr>
                ) : subscriptions.map((sub) => (
                  <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                          {sub.tenants?.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{sub.tenants?.name}</p>
                          <p className="text-xs text-text-muted">ID: {sub.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="font-medium text-white">{sub.subscription_plans?.name}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`}></span> {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted font-mono">{sub.price_at_start?.toLocaleString() || '---'}</td>
                    <td className="px-6 py-4 text-text-muted">{sub.next_billing ? new Date(sub.next_billing).toLocaleDateString() : '---'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenChangePlan(sub)}
                        className="px-3 py-1 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center gap-1 text-text-muted hover:text-white transition-colors text-xs font-bold border border-white/10 hover:border-primary/50"
                        title="Alterar Plano"
                      >
                        <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                        Alterar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div >
  );
};