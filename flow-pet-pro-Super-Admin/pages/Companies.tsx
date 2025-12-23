import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const Companies: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        subscriptions (
          status,
          next_billing,
          subscription_plans (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setTenants(data);
    }
    setLoading(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', slug: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.slug) return;

    const { error } = await supabase
      .from('tenants')
      .insert([newTenant]);

    if (!error) {
      setIsModalOpen(false);
      setNewTenant({ name: '', slug: '' });
      fetchTenants();
    } else {
      alert('Erro ao criar empresa: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchTenants();
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      {/* Modal Nova Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-8 rounded-4xl border border-white/10 animate-zoom-in">
            <h3 className="text-xl font-bold text-white mb-6">Nova Empresa</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Nome da Empresa</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                  placeholder="Ex: Pet Shop do Bairro"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">URL (Slug)</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                  placeholder="ex-pet-shop"
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                  required
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
                  className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 transition-all"
                >
                  Criar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Gerenciamento de Empresas</h2>
          <p className="text-text-muted text-sm font-light">Administre todas as contas de pet shops ativas no ecossistema.</p>
        </div>
        <div className="flex items-center gap-4 self-end md:self-auto">
          <button className="w-10 h-10 rounded-full bg-glass border border-glass-border flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <div className="glass-panel rounded-4xl p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <input
              className="bg-black/20 border border-glass-border text-sm rounded-full pl-10 pr-4 py-3 w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-text-muted/50 text-white"
              placeholder="Buscar por nome ou slug..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted group-focus-within:text-primary transition-colors text-[20px]">search</span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">add</span>
          Nova Empresa
        </button>
      </div>

      <div className="glass-panel rounded-4xl flex-1 flex flex-col overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-text-muted text-xs uppercase font-semibold tracking-wider sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-5 font-medium">Empresa</th>
                <th className="px-6 py-5 font-medium">Slug / Criado em</th>
                <th className="px-6 py-5 font-medium">Plano / Renovação</th>
                <th className="px-6 py-5 font-medium text-center">Status</th>
                <th className="px-6 py-5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-text-muted text-xs uppercase font-bold tracking-widest">Carregando empresas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-text-muted">
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              ) : filteredTenants.map((row, i) => {
                const sub = row.subscriptions?.[0];
                const planName = sub?.subscription_plans?.name || 'Sem plano';
                const status = sub?.status || 'inactive';
                const statusColor = status === 'active' ? 'emerald' : status === 'trialing' ? 'amber' : 'red';

                return (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg flex items-center justify-center font-bold`}>
                          {row.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold text-white`}>{row.name}</p>
                          <p className="text-xs text-text-muted">ID: {row.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4`}>
                      <p className="text-text-main font-mono text-xs">{row.slug}</p>
                      <p className="text-xs text-text-muted">{new Date(row.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className={`px-6 py-4`}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary-300 border border-primary/20 mb-1`}>
                        {planName}
                      </span>
                      <p className="text-xs text-text-muted">
                        {sub?.next_billing ? `Renova em ${new Date(sub.next_billing).toLocaleDateString()}` : 'Sem renovação'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${statusColor}-500/10 text-${statusColor}-400 border border-${statusColor}-500/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-${statusColor}-400 mr-2`}></span>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-primary transition-colors" title="Visualizar">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-white transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-rose-400 transition-colors"
                          title="Deletar"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-glass-border flex justify-between items-center bg-white/5 backdrop-blur-xl mt-auto">
          <span className="text-xs text-text-muted">Mostrando <span className="font-bold text-white">5</span> de <span className="font-bold text-white">124</span> empresas</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-glass-border bg-white/5 text-text-muted text-xs hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Anterior
            </button>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded-lg border border-glass-border hover:bg-white/5 text-text-muted text-xs font-bold flex items-center justify-center transition-colors">2</button>
              <button className="w-8 h-8 rounded-lg border border-glass-border hover:bg-white/5 text-text-muted text-xs font-bold flex items-center justify-center transition-colors">3</button>
              <span className="w-8 h-8 flex items-center justify-center text-text-muted text-xs">...</span>
              <button className="w-8 h-8 rounded-lg border border-glass-border hover:bg-white/5 text-text-muted text-xs font-bold flex items-center justify-center transition-colors">12</button>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-glass-border bg-white/5 text-text-muted text-xs hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1">
              Próxima
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};