import React, { useState, useEffect } from 'react';
import { useNotification } from '../NotificationContext';
import { getGeminiModel } from '../src/lib/gemini';
import { supabase } from '../src/lib/supabase';
import { useSecurity } from '../SecurityContext';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'online' | 'busy' | 'offline';
  appointments_count: number;
  image_url: string;
}

// Interface for operational employees without CRM access
interface OperationalMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
  created_at?: string;
}

// --- Add/Edit Member Modal ---
const MemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: any) => void;
  initialData?: TeamMember;
  title: string;
  saveLabel: string;
}> = ({ isOpen, onClose, onSave, initialData, title, saveLabel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Funcionário',
    specialty: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: '',
        password: '',
        role: initialData.role,
        specialty: initialData.specialty || ''
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'Funcionário', specialty: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-gray-800">
        <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
          <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            {title}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
              placeholder="Ex: João Silva"
            />
          </div>

          {!isEditing && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <p className="text-xs text-slate-400 mt-1">O usuário poderá alterar depois do primeiro login</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Cargo / Nível de Permissão</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
            >
              <option value="Administrador">👑 Administrador (Acesso Total)</option>
              <option value="Gerente">⭐ Gerente (Gestão + Relatórios)</option>
              <option value="Veterinário">🩺 Veterinário</option>
              <option value="Groomer">✂️ Groomer</option>
              <option value="Recepcionista">📋 Recepcionista</option>
              <option value="Funcionário">👤 Funcionário (Acesso Básico)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Especialidade</label>
            <input
              type="text"
              required
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
              placeholder="Ex: Dermatologia, Tosa Bebê..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all transform active:scale-95">{saveLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal for Operational Members (no CRM access) ---
const OperationalMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: any) => void;
  initialData?: OperationalMember;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Banhista',
    specialty: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        role: initialData.role || 'Banhista',
        specialty: initialData.specialty || ''
      });
    } else {
      setFormData({ name: '', role: 'Banhista', specialty: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-gray-800">
        <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600">badge</span>
            {initialData ? 'Editar Funcionário' : 'Novo Funcionário Operacional'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-0.5">info</span>
            <span>Funcionários operacionais não têm acesso ao sistema CRM. São usados para gestão de mesas e atribuição de tarefas.</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Nome Completo*</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-amber-500 focus:border-amber-500 text-sm py-2.5 px-3"
              placeholder="Ex: Maria Santos"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Função*</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-amber-500 focus:border-amber-500 text-sm py-2.5 px-3"
            >
              <option value="Banhista">🛁 Banhista</option>
              <option value="Tosador">✂️ Tosador</option>
              <option value="Auxiliar">🤝 Auxiliar</option>
              <option value="Limpeza">🧹 Limpeza</option>
              <option value="Motorista">🚗 Motorista (Leva e Traz)</option>
              <option value="Cuidador">🐕 Cuidador (Day Care)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Especialidade</label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-amber-500 focus:border-amber-500 text-sm py-2.5 px-3"
              placeholder="Ex: Tosa de raças grandes, Banho de gatos..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95">
              {initialData ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


import { ScreenType } from '../types';

export const Team: React.FC<{ onNavigate?: (screen: ScreenType) => void }> = ({ onNavigate }) => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Operational Members State (team_members table)
  const [operationalMembers, setOperationalMembers] = useState<OperationalMember[]>([]);
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [isOpEditModalOpen, setIsOpEditModalOpen] = useState(false);
  const [selectedOpMember, setSelectedOpMember] = useState<OperationalMember | null>(null);
  const [opLoading, setOpLoading] = useState(false);
  const { tenant, user: authUser } = useSecurity();

  const { showNotification } = useNotification();

  const fetchTeam = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching team:', error);
      showNotification('Erro ao carregar equipe', 'error');
      setTeam([]);
    } else {
      // Map profiles data to team member format
      const teamData = (data || []).map(profile => ({
        id: profile.id,
        name: profile.full_name || profile.email?.split('@')[0] || 'Sem nome',
        role: profile.role || 'Funcionário',
        specialty: profile.specialty || profile.position || 'Geral',
        status: profile.status || 'offline',
        appointments_count: 0, // TODO: buscar de appointments where professional_id = profile.id
        image_url: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=random`
      }));
      setTeam(teamData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
    fetchOperationalMembers();
  }, []);

  // Fetch operational members from team_members table
  const fetchOperationalMembers = async () => {
    setOpLoading(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching operational members:', error);
    } else {
      setOperationalMembers((data || []).map(m => ({
        id: m.id,
        name: m.name || '',
        role: m.role || 'Auxiliar',
        specialty: m.specialty || '',
        status: m.status || 'active',
        avatar_url: m.avatar_url,
        created_at: m.created_at
      })));
    }
    setOpLoading(false);
  };

  // CRUD for operational members
  const handleAddOpMember = async (data: any) => {
    const { error } = await supabase
      .from('team_members')
      .insert([{
        name: data.name,
        role: data.role,
        specialty: data.specialty,
        status: 'active',
        tenant_id: tenant?.id
      }]);

    if (error) {
      console.error('Error adding operational member:', error);
      showNotification('Erro ao adicionar funcionário: ' + error.message, 'error');
    } else {
      fetchOperationalMembers();
      showNotification(`${data.name} foi adicionado à equipe operacional!`, 'success');
    }
  };

  const handleUpdateOpMember = async (data: any) => {
    if (!selectedOpMember) return;

    console.log('Updating operational member:', selectedOpMember.id, 'with data:', data);

    const { error } = await supabase
      .from('team_members')
      .update({
        name: data.name,
        role: data.role,
        specialty: data.specialty
      })
      .eq('id', selectedOpMember.id);

    if (error) {
      console.error('Error updating operational member:', error);
      showNotification('Erro ao atualizar funcionário: ' + error.message, 'error');
    } else {
      fetchOperationalMembers();
      showNotification('Dados atualizados com sucesso.', 'success');
    }
  };

  const handleDeleteOpMember = async (id: string) => {
    if (confirm('Remover este funcionário operacional?')) {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) {
        showNotification('Erro ao remover funcionário', 'error');
      } else {
        fetchOperationalMembers();
        showNotification('Funcionário removido.', 'info');
      }
    }
  };

  const handleToggleOpStatus = async (member: OperationalMember) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('team_members')
      .update({ status: newStatus })
      .eq('id', member.id);

    if (!error) {
      fetchOperationalMembers();
      showNotification(`${member.name} ${newStatus === 'active' ? 'ativado' : 'desativado'}.`, 'info');
    }
  };

  const handleAddMember = async (data: any) => {
    try {
      // Check limits
      if (team.length >= (tenant?.max_users || 1)) {
        showNotification(`Você atingiu o limite de ${tenant?.max_users} usuários do seu plano. Faça upgrade para adicionar mais.`, 'error');
        return;
      }

      showNotification('Criando usuário...', 'info');

      // Step 1: Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            role: data.role
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        showNotification(`Erro ao criar usuário: ${authError.message}`, 'error');
        return;
      }

      if (!authData.user) {
        showNotification('Erro: usuário não foi criado', 'error');
        return;
      }

      // Step 2: Create profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          full_name: data.name,
          role: data.role,
          specialty: data.specialty,
          status: 'offline',
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
          tenant_id: tenant?.id
        }]);

      if (profileError) {
        console.error('Profile error:', profileError);
        showNotification(`Usuário criado, mas erro ao criar perfil: ${profileError.message}`, 'error');
        return;
      }

      // Success!
      fetchTeam();
      showNotification(`✅ ${data.name} foi adicionado à equipe!`, 'success');

    } catch (err: any) {
      console.error('Error adding member:', err);
      showNotification(`Erro ao cadastrar membro: ${err.message}`, 'error');
    }
  };

  const handleUpdateMember = async (data: any) => {
    if (!selectedMember) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.name,
        role: data.role,
        specialty: data.specialty
      })
      .eq('id', selectedMember.id);

    if (error) {
      console.error('Error updating member:', error);
      showNotification('Erro ao atualizar membro', 'error');
    } else {
      fetchTeam();
      showNotification('Dados do membro atualizados.', 'success');
    }
  };

  const handleEditClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const statuses: ('online' | 'busy' | 'offline')[] = ['online', 'busy', 'offline'];
    const nextStatus = statuses[(statuses.indexOf(member.status) + 1) % statuses.length];

    const { error } = await supabase
      .from('profiles')
      .update({ status: nextStatus })
      .eq('id', member.id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      fetchTeam();
      showNotification(`${member.name} agora está ${nextStatus}`, 'info');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este usuário? Isso não remove o usuário do Auth.')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) {
        console.error('Error deleting profile:', error);
        showNotification('Erro ao remover perfil', 'error');
      } else {
        fetchTeam();
        showNotification('Perfil removido.', 'info');
      }
    }
  };

  const handleRunAIInsights = async () => {
    setIsInsightsOpen(true);
    setAiInsights('');
    setIsAnalyzing(true);

    try {
      const model = getGeminiModel();
      const prompt = `
            Você é um gerente de RH e Operações de um Pet Shop. Analise esta equipe:
            ${JSON.stringify(team.map(t => ({ name: t.name, role: t.role, tasks: t.appointments_count })))}
            
            Gere um feedback curto em Markdown:
            1. Quem está com maior carga de trabalho?
            2. Sugira uma ação para balancear a equipe.
            3. Escreva uma mensagem curta de 'Kudos' (Parabéns) para o funcionário com mais atendimentos.
            4. Uma dica de cultura organizacional para pet shops.
        `;

      const result = await model.generateContent(prompt);
      const response = result.response;

      setAiInsights(response.text() || "Insights indisponíveis.");
    } catch (error) {
      console.error(error);
      setAiInsights("Erro ao conectar com a IA de RH.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredTeam = team.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.specialty && member.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = activeTab === 'Todos' ||
      (activeTab === 'Veterinários' && member.role.includes('Veterinário')) ||
      (activeTab === 'Groomers' && member.role.includes('Groomer')) ||
      (activeTab === 'Admin' && (member.role.includes('Gerente') || member.role.includes('Recepcionista')));

    return matchesSearch && matchesTab;
  });

  if (loading && team.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddMember}
        title="Novo Membro"
        saveLabel="Cadastrar"
      />

      {selectedMember && (
        <MemberModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateMember}
          initialData={selectedMember}
          title="Editar Membro"
          saveLabel="Atualizar"
        />
      )}

      {/* AI Insights Modal */}
      {isInsightsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsInsightsOpen(false)}></div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-100 dark:border-gray-800 flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white leading-none">Insights de Equipe</h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">Análise de Performance e Cultura</p>
                </div>
              </div>
              <button onClick={() => setIsInsightsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg mb-2">Analisando performance...</p>
                  <p className="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto">Calculando carga de trabalho e gerando recomendações.</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-gray-300 leading-relaxed">
                    {aiInsights}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222] flex justify-end gap-3">
              <button
                onClick={() => setIsInsightsOpen(false)}
                className="px-6 py-2.5 rounded-lg text-slate-500 font-bold text-sm hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                Fechar
              </button>
              <button
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                onClick={() => showNotification('Elogio enviado para o time.', 'success')}
              >
                <span className="material-symbols-outlined text-[18px]">thumb_up</span> Enviar Kudos
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Equipe</h1>
          <p className="text-slate-500 dark:text-gray-400 max-w-lg">Gerencie os colaboradores, visualize escalas e atribua tarefas para garantir o melhor atendimento.</p>

          <div className="flex items-center gap-4 mt-4">
            <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">Código: {tenant?.invite_code || '---'}</span>
              <button
                onClick={() => {
                  if (tenant?.invite_code) {
                    navigator.clipboard.writeText(tenant.invite_code);
                    showNotification('Código copiado!', 'success');
                  }
                }}
                className="size-6 rounded-md bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Plano: <span className="text-primary">{tenant?.is_pro ? 'PRO' : 'FREE'}</span></span>
              <span className="opacity-30">|</span>
              <span>Uso: {team.length} / {tenant?.max_users || 1}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
            <input
              type="text"
              placeholder="Buscar membro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm dark:text-white"
            />
          </div>
          <button
            onClick={handleRunAIInsights}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:border-blue-500 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            Insights
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/30 transition-transform active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined font-bold">person_add</span>
            <span className="hidden md:inline">Adicionar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 dark:border-gray-800 mb-8 overflow-x-auto no-scrollbar">
        {['Todos', 'Veterinários', 'Groomers', 'Admin'].map((tab) => (
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

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeam.map((member) => (
          <div key={member.id} className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-[#222] dark:to-[#333] relative">
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="w-8 h-8 rounded-full bg-white/50 hover:bg-red-500 hover:text-white dark:bg-black/30 dark:hover:bg-red-600 flex items-center justify-center text-slate-600 dark:text-gray-300 transition-colors"
                  title="Remover"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
            <div className="px-6 pb-6 relative">
              <div
                className="relative -mt-12 mb-4 w-24 h-24 mx-auto cursor-pointer"
                onClick={() => handleToggleStatus(member)}
                title="Clique para alterar status"
              >
                <img src={member.image_url} alt={member.name} className="w-full h-full rounded-full border-4 border-white dark:border-[#1a1a1a] object-cover shadow-sm" />
                <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white dark:border-[#1a1a1a] ${member.status === 'online' ? 'bg-emerald-500' :
                  member.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                  }`}></span>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-primary font-bold text-xs uppercase tracking-wide mb-1">{member.role}</p>
                <p className="text-slate-500 dark:text-gray-400 text-xs">{member.specialty || 'Geral'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-gray-800 pt-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-black text-slate-900 dark:text-white">{member.appointments_count}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Atendimentos</p>
                </div>
                <div className="text-center border-l border-slate-50 dark:border-gray-800">
                  <p className="text-lg font-black text-slate-900 dark:text-white">98%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Eficiência</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(member)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Perfil
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('communication', { type: 'team', contact: member });
                      showNotification(`Abrindo chat com ${member.name}`, 'info');
                    }
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Mensagem
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-800 flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <p className="font-bold text-sm">Adicionar Membro</p>
        </button>
      </div>

      {/* Operational Members Modal */}
      <OperationalMemberModal
        isOpen={isOpModalOpen}
        onClose={() => setIsOpModalOpen(false)}
        onSave={handleAddOpMember}
      />

      {selectedOpMember && (
        <OperationalMemberModal
          isOpen={isOpEditModalOpen}
          onClose={() => setIsOpEditModalOpen(false)}
          onSave={handleUpdateOpMember}
          initialData={selectedOpMember}
        />
      )}

      {/* Operational Employees Section - No CRM Access */}
      <div className="mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
              <span className="material-symbols-outlined text-2xl">badge</span>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Funcionários Operacionais</h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm">Equipe sem acesso ao CRM • Gestão de mesas e atribuição de tarefas</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-transform active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined font-bold">person_add</span>
            <span>Novo Operacional</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mb-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-500"></span>
            {operationalMembers.filter(m => m.status === 'active').length} Ativos
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-slate-300"></span>
            {operationalMembers.filter(m => m.status === 'inactive').length} Inativos
          </span>
          <span>Total: {operationalMembers.length}</span>
        </div>

        {/* Operational Grid */}
        {opLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : operationalMembers.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-3xl border border-amber-200/50 dark:border-amber-800/20">
            <span className="material-symbols-outlined text-6xl text-amber-300 dark:text-amber-700 mb-4">group_off</span>
            <p className="text-slate-500 dark:text-gray-400 font-bold mb-2">Nenhum funcionário operacional</p>
            <p className="text-slate-400 dark:text-gray-500 text-sm mb-4">Adicione banhistas, tosadores e auxiliares</p>
            <button
              onClick={() => setIsOpModalOpen(true)}
              className="text-amber-600 dark:text-amber-400 font-bold text-sm hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Adicionar funcionário
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {operationalMembers.map((member) => (
              <div
                key={member.id}
                className={`bg-white dark:bg-[#1a1a1a] rounded-2xl border ${member.status === 'active' ? 'border-slate-100 dark:border-gray-800' : 'border-slate-100 dark:border-gray-800 opacity-60'} shadow-sm hover:shadow-md transition-all overflow-hidden group`}
              >
                <div className="h-16 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleToggleOpStatus(member)}
                      className={`w-7 h-7 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-slate-400'} flex items-center justify-center text-white text-[10px] font-bold shadow-sm hover:scale-110 transition-transform`}
                      title={member.status === 'active' ? 'Desativar' : 'Ativar'}
                    >
                      <span className="material-symbols-outlined text-sm">{member.status === 'active' ? 'check' : 'pause'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteOpMember(member.id)}
                      className="w-7 h-7 rounded-full bg-white/80 dark:bg-black/40 hover:bg-red-500 hover:text-white flex items-center justify-center text-slate-500 transition-colors"
                      title="Remover"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>

                <div className="px-5 pb-5 relative">
                  <div className="relative -mt-8 mb-3 w-16 h-16 mx-auto">
                    <div className="w-full h-full rounded-full border-4 border-white dark:border-[#1a1a1a] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-xl font-black">{member.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-0.5">{member.name}</h3>
                    <p className="text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">{member.role}</p>
                    {member.specialty && (
                      <p className="text-slate-400 text-[10px] mt-1">{member.specialty}</p>
                    )}
                  </div>

                  {member.phone && (
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-4">
                      <span className="material-symbols-outlined text-sm">phone</span>
                      {member.phone}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedOpMember(member);
                      setIsOpEditModalOpen(true);
                    }}
                    className="w-full py-2 rounded-xl border border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setIsOpModalOpen(true)}
              className="rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-800/30 flex flex-col items-center justify-center p-6 text-amber-400 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all group min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-2 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">add</span>
              </div>
              <p className="font-bold text-xs">Adicionar</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};