import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { useNotification } from '../NotificationContext';
import { getGeminiModel } from '../src/lib/gemini';
import { supabase } from '../src/lib/supabase';

interface ClientPet {
  id: string;
  name: string;
  breed: string;
  type: string;
  age: string;
  weight: string;
  status: 'healthy' | 'alert' | 'critical';
  img: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  img: string;
  since: string;
  totalSpent: string;
  visits: number;
  lastVisit: string;
  credits: string;
  pets: ClientPet[];
}

const NewClientModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (c: any) => void }> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', pet: '', breed: '', phone: '', email: '', img: `https://i.pravatar.cc/150?u=${Math.random()}`
  });

  const handleShuffle = () => {
    setFormData(prev => ({ ...prev, img: `https://i.pravatar.cc/150?u=${Math.random()}` }));
  };


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', pet: '', breed: '', phone: '', email: '', img: `https://i.pravatar.cc/150?u=${Math.random()}` });
    onClose();

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-6 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Novo Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-gray-700">
            <img src={formData.img} alt="Preview" className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-lg object-cover mb-2" />
            <button type="button" onClick={handleShuffle} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[14px]">refresh</span> Sortear Foto
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Completo</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Ex: João Silva" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Telefone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="(11) 9..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="joao@ex..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Pet</label>
            <input type="text" required value={formData.pet} onChange={e => setFormData({ ...formData, pet: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Ex: Bob" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Raça</label>
            <input type="text" required value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Ex: Poodle" />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditClientModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (c: Client) => void; client: Client }> = ({ isOpen, onClose, onSave, client }) => {
  const [formData, setFormData] = useState(client);

  useEffect(() => {
    setFormData(client);
  }, [client]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-6 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Editar Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-gray-700">
            <img src={formData.img} alt="Preview" className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-lg object-cover mb-2" />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, img: `https://i.pravatar.cc/150?u=${Math.random()}` })}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span> Sortear Nova Foto
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Completo</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Telefone</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm"
            >
              <option value="Ativo">Ativo</option>
              <option value="VIP">VIP</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg">Atualizar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ClientsProps {
  onNavigate?: (screen: ScreenType) => void;
}

export const Clients: React.FC<ClientsProps> = ({ onNavigate }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { showNotification } = useNotification();

  const fetchClients = async () => {
    setLoading(true);
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*, pets(*)');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      showNotification('Erro ao carregar clientes', 'error');
    } else {
      const mappedClients: Client[] = (clientsData || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        status: (c as any).status || 'Ativo',
        img: c.img || `https://i.pravatar.cc/150?u=${encodeURIComponent(c.id)}`,

        since: new Date(c.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        totalSpent: 'R$ 0',
        visits: 0,
        lastVisit: '-',
        credits: 'R$ 0',
        pets: (c.pets || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          breed: p.breed || '-',
          type: p.species || 'Cão',
          age: p.birth_date ? `${new Date().getFullYear() - new Date(p.birth_date).getFullYear()} Anos` : '-',
          weight: p.weight ? `${p.weight}kg` : '-',
          status: p.status || 'healthy',
          img: p.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`
        }))
      }));
      setClients(mappedClients);
      if (mappedClients.length > 0 && !selectedClientId) {
        setSelectedClientId(mappedClients[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    const { error } = await supabase
      .from('clients')
      .update({
        name: updatedClient.name,
        phone: updatedClient.phone,
        email: updatedClient.email,
        img: updatedClient.img,
      })

      .eq('id', updatedClient.id);

    if (error) {
      console.error('Error updating client:', error);
      showNotification('Erro ao atualizar cliente', 'error');
    } else {
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
      showNotification('Dados do cliente atualizados!', 'success');
    }
  };

  const handleSchedule = () => {
    showNotification('Redirecionando para agenda...', 'success');
    if (onNavigate) onNavigate('schedule');
  };

  const handleOpenPet = (pet: ClientPet) => {
    localStorage.setItem('petmanager_target_pet_id', pet.id);
    if (onNavigate) onNavigate('petProfile');
  };

  const handleAddClient = async (data: any) => {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([{
        name: data.name,
        phone: data.phone,
        email: data.email,
        img: data.img
      }])

      .select();

    if (clientError) {
      console.error('Error adding client:', clientError);
      showNotification('Erro ao cadastrar cliente', 'error');
      return;
    }

    const clientId = clientData[0].id;

    const { error: petError } = await supabase
      .from('pets')
      .insert([{
        client_id: clientId,
        name: data.pet,
        breed: data.breed,
        species: 'Cão'
      }]);

    if (petError) {
      console.error('Error adding pet:', petError);
    }

    fetchClients();
    setSelectedClientId(clientId);
    showNotification('Cliente cadastrado com sucesso!', 'success');
  };

  const handleAIAnalysis = async () => {
    if (!selectedClient) return;
    setIsAIModalOpen(true);
    setAiAnalysis('');
    setIsAnalyzing(true);

    try {
      const model = getGeminiModel();
      const prompt = `
            Atue como um especialista em Customer Success para Pet Shops.
            Analise este perfil de cliente:
            Nome: ${selectedClient.name}
            Pets: ${selectedClient.pets.map(p => `${p.name} (${p.breed})`).join(', ')}
            Status: ${selectedClient.status}
            Gasto Total: ${selectedClient.totalSpent}
            
            Gere um perfil comportamental curto em Markdown:
            1. Risco de Churn (Baixo/Médio/Alto) com justificativa.
            2. Potencial de Upsell: Que serviço premium oferecer?
            3. Lifetime Value (LTV) estimado (Alto/Médio/Baixo).
            4. Uma dica de abordagem personalizada para a próxima visita.
        `;

      const result = await model.generateContent(prompt);
      const response = result.response;

      setAiAnalysis(response.text() || "Análise indisponível.");
    } catch (error) {
      console.error(error);
      setAiAnalysis("Erro ao conectar com a IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.pets.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'Todos' || client.status === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading && clients.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#111]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#111] flex-col md:flex-row">
      <NewClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddClient} />
      {selectedClient && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateClient}
          client={selectedClient}
        />
      )}

      {/* AI Analysis Modal */}
      {isAIModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAIModalOpen(false)}></div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-100 dark:border-gray-800 flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white leading-none">Perfil Comportamental IA</h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">Análise de {selectedClient.name}</p>
                </div>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg mb-2">Analisando dados do cliente...</p>
                  <p className="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto">Calculando métricas de retenção e oportunidades de venda.</p>
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
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                onClick={() => showNotification('Notas salvas no perfil.', 'success')}
              >
                <span className="material-symbols-outlined text-[18px]">save</span> Salvar Notas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client List Sidebar */}
      <div className="w-full md:w-[400px] flex flex-col border-r border-slate-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] h-[300px] md:h-full shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-gray-800 pb-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black tracking-tight text-primary">CLIENTES</h1>
            <button onClick={() => setIsModalOpen(true)} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
          <div className="relative mb-6">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Buscar por nome, pet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
            />
          </div>
          <div className="flex gap-6 border-b border-slate-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
            {['Todos', 'Ativos', 'VIP', 'Pendentes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-4 font-bold text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${activeTab === tab
                  ? 'border-primary text-black dark:text-white'
                  : 'border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${selectedClientId === client.id
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-[#1a1a1a] border-transparent hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-gray-700'
                }`}
            >
              <img src={client.img} alt={client.name} className={`w-12 h-12 rounded-full object-cover border-2 ${selectedClientId === client.id ? 'border-white/50' : 'border-slate-100 dark:border-gray-700'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className={`font-bold truncate ${selectedClientId === client.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{client.name}</h3>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${selectedClientId === client.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400'}`}>{client.status}</span>
                </div>
                <p className={`text-xs truncate ${selectedClientId === client.id ? 'text-white/80' : 'text-slate-500 dark:text-gray-400'}`}>
                  {client.pets.length > 0 ? `${client.pets.length} Pets: ${client.pets.map(p => p.name).join(', ')}` : 'Nenhum pet'}
                </p>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
              <p className="text-sm font-medium">Nenhum cliente encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Client Detail View */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-[#111] p-8 md:p-12">
        {selectedClient ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300" key={selectedClient.id}>
            {/* Header Card */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 dark:border-gray-800 pb-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={selectedClient.img}
                    alt={selectedClient.name}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-xl object-cover"
                  />
                  <span className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-4 border-slate-50 dark:border-[#111] material-symbols-outlined text-sm">verified</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">{selectedClient.status} MEMBER</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-gray-400">Desde {selectedClient.since}</span>
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 uppercase">{selectedClient.name}</h1>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600 dark:text-gray-400">
                    <div className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[18px]">call</span> {selectedClient.phone || '(Não informado)'}
                    </div>
                    <div className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[18px]">mail</span> {selectedClient.email || '(Não informado)'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-3">
                <button
                  onClick={handleAIAnalysis}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-purple-200 dark:border-purple-900 bg-white dark:bg-[#1a1a1a] font-bold text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">psychology</span> Análise IA
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] font-bold text-sm dark:text-white hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span> Editar
                </button>
                <button
                  onClick={handleSchedule}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span> Agendar
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border-l-4 border-primary">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Gasto</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedClient.totalSpent}</p>
              </div>
              <div className="p-5 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-slate-100 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Visitas</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedClient.visits}</p>
              </div>
              <div className="p-5 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-slate-100 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Última Compra</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedClient.lastVisit}</p>
              </div>
              <div className="p-5 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-slate-100 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Créditos</p>
                <p className="text-2xl font-black text-primary">{selectedClient.credits}</p>
              </div>
            </div>

            {/* Pets Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Meus Pets</h2>
                <button
                  onClick={() => {
                    if (selectedClient && onNavigate) {
                      localStorage.setItem('petmanager_initial_client_id', selectedClient.id);
                      localStorage.setItem('petmanager_trigger_add_pet', 'true');
                      onNavigate('petProfile');
                    }
                  }}
                  className="text-primary font-bold text-sm uppercase flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Novo Pet
                </button>
              </div>

              {/* Dynamic Pet Grid based on Client's Pets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedClient.pets.map(pet => (
                  <div
                    key={pet.id}
                    onClick={() => handleOpenPet(pet)}
                    className="group relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden cursor-pointer"
                  >
                    <div className={`absolute top-4 right-4 z-10 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${pet.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' :
                      pet.status === 'alert' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-400' :
                        'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pet.status === 'healthy' ? 'bg-green-500' :
                        pet.status === 'alert' ? 'bg-orange-500' : 'bg-red-500'
                        }`}></span>
                      {pet.status === 'healthy' ? 'Saudável' : pet.status === 'alert' ? 'Atenção' : 'Crítico'}
                    </div>
                    <div className="flex h-full">
                      <div className="w-2/5 relative">
                        <img src={pet.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={pet.name} />
                      </div>
                      <div className="w-3/5 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">{pet.name}</h3>
                            <span className="material-symbols-outlined text-slate-300 dark:text-gray-600 text-sm">
                              {pet.type === 'Gato' ? 'pets' : 'cruelty_free'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-4">{pet.breed}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Idade</p>
                              <p className="font-bold text-slate-800 dark:text-gray-200">{pet.age}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Peso</p>
                              <p className="font-bold text-slate-800 dark:text-gray-200">{pet.weight}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-xs font-medium text-primary group-hover:underline">Ver Prontuário</span>
                          <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors dark:text-gray-400">
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-4">person_search</span>
            <p className="text-xl font-bold italic">Selecione um cliente para ver detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
};