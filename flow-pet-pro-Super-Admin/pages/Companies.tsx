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
    console.log('COMPANIES DEBUG: Starting fetch...');
    try {
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

      if (error) {
        console.error('COMPANIES DEBUG: Error:', error);
        alert('Erro ao buscar empresas: ' + error.message);
      } else {
        console.log('COMPANIES DEBUG: Success! Found', data?.length, 'tenants');
        setTenants(data || []);
      }
    } catch (err: any) {
      console.error('COMPANIES DEBUG: Fatal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [newTenant, setNewTenant] = useState({ name: '', slug: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.slug) return;
    setLoading(true);
    const { error } = await supabase.from('tenants').insert([newTenant]);
    if (!error) {
      setIsModalOpen(false);
      setNewTenant({ name: '', slug: '' });
      fetchTenants();
    } else {
      alert('Erro ao criar empresa: ' + error.message);
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setLoading(true);
    const { error } = await supabase
      .from('tenants')
      .update({ name: editingTenant.name, slug: editingTenant.slug })
      .eq('id', editingTenant.id);
    if (!error) {
      setIsModalOpen(false);
      setEditingTenant(null);
      fetchTenants();
    } else {
      alert('Erro ao atualizar empresa: ' + error.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
    setLoading(true);
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (!error) {
      fetchTenants();
    } else {
      alert('Erro ao excluir: ' + error.message);
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      {/* Modal Nova Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-8 rounded-4xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">{editingTenant ? 'Editar Empresa' : 'Nova Empresa'}</h3>
            <form onSubmit={editingTenant ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Nome da Empresa</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                  value={editingTenant ? editingTenant.name : newTenant.name}
                  onChange={(e) => {
                    if (editingTenant) {
                      setEditingTenant({ ...editingTenant, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                    } else {
                      setNewTenant({ ...newTenant, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                    }
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Slug (URL)</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
                  value={editingTenant ? editingTenant.slug : newTenant.slug}
                  onChange={(e) => editingTenant ? setEditingTenant({ ...editingTenant, slug: e.target.value }) : setNewTenant({ ...newTenant, slug: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-text-muted hover:text-white">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Gerenciamento de Empresas</h2>
        <p className="text-text-muted text-sm italic">Status: {loading ? 'Carregando...' : `${tenants.length} empresas encontradas`}</p>
      </header>

      <div className="glass-panel rounded-4xl p-4 mb-6 flex justify-between items-center gap-4">
        <input
          className="bg-black/20 border border-white/10 rounded-full px-10 py-3 w-64 text-sm text-white outline-none"
          placeholder="Buscar empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => { setEditingTenant(null); setIsModalOpen(true); }} className="px-6 py-3 bg-primary text-white rounded-full font-bold">+ Nova Empresa</button>
      </div>

      <div className="glass-panel rounded-4xl flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-text-muted uppercase text-xs font-bold sticky top-0">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Slug / Criado</th>
              <th className="px-6 py-4">Plano</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && tenants.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted">Carregando dados...</td></tr>
            ) : filteredTenants.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted">Nenhuma empresa encontrada.</td></tr>
            ) : filteredTenants.map((row) => {
              const sub = row.subscriptions?.[0];
              const planName = sub?.subscription_plans?.name || 'S/ Plano';
              const status = sub?.status || 'inactive';
              const color = status === 'active' ? 'emerald' : 'rose';

              return (
                <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white">{row.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-text-muted font-mono">{row.slug}</div>
                    <div className="text-[10px] opacity-50">{new Date(row.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-primary/10 text-primary-300 px-2 py-0.5 rounded text-[10px] border border-primary/20">{planName}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-${color}-400 text-[10px] uppercase font-bold`}>{status}</span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingTenant(row); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-full text-text-muted"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDelete(row.id)} className="p-2 hover:bg-white/10 rounded-full text-rose-400"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};