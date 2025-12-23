import React, { useState, useEffect } from 'react';
import { useNotification } from '../NotificationContext';
import { getGeminiModel } from '../src/lib/gemini';
import { supabase } from '../src/lib/supabase';
import { useSecurity } from '../SecurityContext';

interface Subscription {
  id: string;
  clientName: string;
  petName: string;
  planName: string;
  value: string; // Formatted R$
  valueNumeric: number;
  frequency: 'Semanal' | 'Quinzenal' | 'Mensal';
  nextBilling: string;
  status: 'active' | 'paused' | 'cancelled' | 'payment_failed';
  paymentMethod: string;
  startDate: string;
  maxUsage: number;
  currentUsage: number;
  usageUnit: string;
}

// Types of subscription plans offered by the pet shop
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: 'Semanal' | 'Quinzenal' | 'Mensal';
  maxUsage: number;
  usageUnit: string;
  services: string[];
  isActive: boolean;
  color: string;
}

const SubscriptionFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: any) => void;
  initialData?: Subscription | null;
  planTypes?: SubscriptionPlan[];
}> = ({ isOpen, onClose, onSave, initialData, planTypes = [] }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    petName: '',
    planName: '',
    value: '',
    frequency: 'Mensal',
    nextBilling: new Date().toISOString().split('T')[0],
    status: 'active',
    paymentMethod: 'Cartão de Crédito',
    maxUsage: 4,
    currentUsage: 0,
    usageUnit: 'Serviços'
  });

  // Fetch clients when modal opens
  useEffect(() => {
    if (isOpen && !initialData) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    setLoadingClients(true);
    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .order('name', { ascending: true });
    if (!error && data) {
      setClients(data);
    }
    setLoadingClients(false);
  };

  // Fetch pets when client is selected
  useEffect(() => {
    if (selectedClientId) {
      fetchPets(selectedClientId);
    } else {
      setPets([]);
      setSelectedPetId('');
    }
  }, [selectedClientId]);

  const fetchPets = async (clientId: string) => {
    setLoadingPets(true);
    const { data, error } = await supabase
      .from('pets')
      .select('id, name')
      .eq('client_id', clientId)
      .order('name', { ascending: true });
    if (!error && data) {
      setPets(data);
    }
    setLoadingPets(false);
  };

  // Update form when plan is selected
  useEffect(() => {
    if (selectedPlanId && planTypes.length > 0) {
      const plan = planTypes.find(p => p.id === selectedPlanId);
      if (plan) {
        setFormData(prev => ({
          ...prev,
          planName: plan.name,
          value: plan.price.toString(),
          frequency: plan.frequency,
          maxUsage: plan.maxUsage,
          usageUnit: plan.usageUnit
        }));
      }
    }
  }, [selectedPlanId, planTypes]);

  // Update form when client/pet is selected
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setFormData(prev => ({ ...prev, clientName: client.name }));
      }
    }
  }, [selectedClientId, clients]);

  useEffect(() => {
    if (selectedPetId) {
      const pet = pets.find(p => p.id === selectedPetId);
      if (pet) {
        setFormData(prev => ({ ...prev, petName: pet.name }));
      }
    }
  }, [selectedPetId, pets]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName,
        petName: initialData.petName,
        planName: initialData.planName,
        value: initialData.valueNumeric.toString(),
        frequency: initialData.frequency,
        nextBilling: initialData.nextBilling,
        status: initialData.status,
        paymentMethod: initialData.paymentMethod,
        maxUsage: initialData.maxUsage,
        currentUsage: initialData.currentUsage,
        usageUnit: initialData.usageUnit
      });
    } else {
      setFormData({
        clientName: '',
        petName: '',
        planName: '',
        value: '',
        frequency: 'Mensal',
        nextBilling: new Date().toISOString().split('T')[0],
        status: 'active',
        paymentMethod: 'Cartão de Crédito',
        maxUsage: 4,
        currentUsage: 0,
        usageUnit: 'Serviços'
      });
      setSelectedClientId('');
      setSelectedPetId('');
      setSelectedPlanId('');
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg relative z-10 p-6 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">
          {initialData ? 'Editar Assinatura' : 'Nova Assinatura'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing ? (
            <>
              {/* Client Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cliente*</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm"
                >
                  <option value="">Selecione um cliente...</option>
                  {loadingClients ? (
                    <option disabled>Carregando...</option>
                  ) : (
                    clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Pet Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pet*</label>
                <select
                  required
                  value={selectedPetId}
                  onChange={e => setSelectedPetId(e.target.value)}
                  disabled={!selectedClientId}
                  className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm disabled:opacity-50"
                >
                  <option value="">{selectedClientId ? 'Selecione um pet...' : 'Primeiro selecione o cliente'}</option>
                  {loadingPets ? (
                    <option disabled>Carregando...</option>
                  ) : (
                    pets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Plan Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipo de Plano*</label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={e => setSelectedPlanId(e.target.value)}
                  className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm"
                >
                  <option value="">Selecione um plano...</option>
                  {planTypes.filter(p => p.isActive).map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.price.toFixed(2)}/{plan.frequency}
                    </option>
                  ))}
                </select>
                {planTypes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ Nenhum plano cadastrado. Crie primeiro na aba "Tipos de Plano".</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cliente</label>
                  <input disabled type="text" value={formData.clientName} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-[#333] dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pet</label>
                  <input disabled type="text" value={formData.petName} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-[#333] dark:text-white text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Plano</label>
                <input disabled type="text" value={formData.planName} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-[#333] dark:text-white text-sm" />
              </div>
            </>
          )}

          {/* Plan Details - Auto-filled but editable */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
            <h3 className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">loyalty</span> Detalhes do Plano
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Valor (R$)</label>
                <input required type="number" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Frequência</label>
                <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value as any })} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm">
                  <option>Semanal</option>
                  <option>Quinzenal</option>
                  <option>Mensal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl border border-slate-100 dark:border-gray-700">
            <h3 className="text-xs font-bold uppercase text-primary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">tune</span> Configuração de Uso
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Limite</label>
                <input type="number" required value={formData.maxUsage} onChange={e => setFormData({ ...formData, maxUsage: parseInt(e.target.value) })} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Usado</label>
                <input type="number" required value={formData.currentUsage} onChange={e => setFormData({ ...formData, currentUsage: parseInt(e.target.value) })} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Unidade</label>
                <input type="text" required value={formData.usageUnit} onChange={e => setFormData({ ...formData, usageUnit: e.target.value })} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm" placeholder="Ex: Banhos" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Próx. Cobrança</label>
              <input required type="date" value={formData.nextBilling} onChange={e => setFormData({ ...formData, nextBilling: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pagamento</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm">
                <option>Cartão de Crédito</option>
                <option>Pix Recorrente</option>
                <option>Boleto</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg">{initialData ? 'Atualizar' : 'Criar Assinatura'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for Creating/Editing Subscription Plan Types
const PlanTypeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: any) => void;
  initialData?: SubscriptionPlan | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    frequency: 'Mensal',
    maxUsage: 4,
    usageUnit: 'Banhos',
    services: '',
    color: 'primary',
    is_pro: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price.toString(),
        frequency: initialData.frequency,
        maxUsage: initialData.maxUsage,
        usageUnit: initialData.usageUnit,
        services: initialData.services.join(', '),
        color: initialData.color,
        is_pro: (initialData as any).isPro || false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        frequency: 'Mensal',
        maxUsage: 4,
        usageUnit: 'Banhos',
        services: '',
        color: 'primary'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      services: formData.services.split(',').map(s => s.trim()).filter(Boolean)
    });
    onClose();
  };

  const colorOptions = [
    { id: 'primary', label: 'Sistema', useCssVar: true },
    { id: 'purple', hex: '#7c3aed' },
    { id: 'violet', hex: '#8b5cf6' },
    { id: 'fuchsia', hex: '#d946ef' },
    { id: 'pink', hex: '#db2777' },
    { id: 'rose', hex: '#e11d48' },
    { id: 'blue', hex: '#2563eb' },
    { id: 'indigo', hex: '#4f46e5' },
    { id: 'sky', hex: '#0ea5e9' },
    { id: 'cyan', hex: '#06b6d4' },
    { id: 'teal', hex: '#0d9488' },
    { id: 'emerald', hex: '#10b981' },
    { id: 'green', hex: '#059669' },
    { id: 'lime', hex: '#84cc16' },
    { id: 'amber', hex: '#f59e0b' },
    { id: 'orange', hex: '#f97316' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg relative z-10 p-6 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
            <span className="material-symbols-outlined">loyalty</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {initialData ? 'Editar Plano' : 'Novo Tipo de Plano'}
            </h2>
            <p className="text-xs text-slate-500">Crie modelos de assinatura para oferecer aos clientes</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Plano*</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Ex: Clube Premium, Plano Básico..." />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" rows={2} placeholder="Descreva os benefícios do plano..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Preço (R$)*</label>
              <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Frequência*</label>
              <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value as any })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm">
                <option>Semanal</option>
                <option>Quinzenal</option>
                <option>Mensal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Limite de Uso*</label>
              <input required type="number" value={formData.maxUsage} onChange={e => setFormData({ ...formData, maxUsage: parseInt(e.target.value) })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Unidade*</label>
              <input required type="text" value={formData.usageUnit} onChange={e => setFormData({ ...formData, usageUnit: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Ex: Banhos, Tosas..." />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Serviços Incluídos</label>
            <input type="text" value={formData.services} onChange={e => setFormData({ ...formData, services: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Banho, Tosa, Hidratação (separados por vírgula)" />
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg text-white">
                <span className="material-symbols-outlined text-sm">verified</span>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Acesso PRO / Academy</p>
                <p className="text-[10px] text-slate-500 font-bold">Libera cursos e setores exclusivos</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_pro}
                onChange={e => setFormData({ ...formData, is_pro: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Cor do Plano</label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.id })}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${formData.color === c.id ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: (c as any).useCssVar ? 'var(--color-primary)' : (c as any).hex }}
                  title={(c as any).label || c.id}
                >
                  {(c as any).useCssVar && (
                    <span className="material-symbols-outlined text-white text-[14px]">auto_fix_high</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">A primeira opção segue a cor de destaque do sistema</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-lg">{initialData ? 'Atualizar' : 'Criar Plano'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const { showNotification } = useNotification();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Plan Types State
  const [activeView, setActiveView] = useState<'subscriptions' | 'plans'>('subscriptions');
  const [planTypes, setPlanTypes] = useState<SubscriptionPlan[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const { tenantId } = useSecurity();

  const fetchSubscriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .not('client_name', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      showNotification('Erro ao carregar assinaturas', 'error');
    } else {
      setSubscriptions((data || []).map(s => ({
        id: s.id,
        clientName: s.client_name,
        petName: s.pet_name,
        planName: s.plan_name,
        value: s.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        valueNumeric: s.value,
        frequency: s.frequency as any,
        nextBilling: s.next_billing,
        status: s.status as any,
        paymentMethod: s.payment_method,
        startDate: s.start_date,
        maxUsage: s.max_usage,
        currentUsage: s.current_usage,
        usageUnit: s.usage_unit
      })));
    }
    setLoading(false);
  };

  // Fetch plan types from subscription_plans table
  const fetchPlanTypes = async () => {
    setPlansLoading(true);
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plan types:', error);
      // If table doesn't exist, use empty array
      setPlanTypes([]);
    } else {
      setPlanTypes((data || []).map(p => ({
        id: p.id,
        name: p.name || '',
        description: p.description || '',
        price: p.price || 0,
        frequency: p.frequency || 'Mensal',
        maxUsage: p.max_usage || 4,
        usageUnit: p.usage_unit || 'Serviços',
        services: p.services || [],
        isActive: p.is_active ?? true,
        color: p.color || 'purple',
        isPro: p.is_pro || false
      })));
    }
    setPlansLoading(false);
  };

  const handleSavePlan = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      frequency: data.frequency,
      max_usage: data.maxUsage,
      usage_unit: data.usageUnit,
      services: data.services.split(',').map((s: string) => s.trim()),
      color: data.color,
      is_active: true,
      is_pro: data.is_pro,
      tenant_id: tenantId
    };

    if (selectedPlan) {
      const { error } = await supabase.from('subscription_plans').update(payload).eq('id', selectedPlan.id);
      if (error) {
        console.error('Error updating plan:', error);
        showNotification('Erro ao atualizar plano: ' + error.message, 'error');
      } else {
        fetchPlanTypes();
        showNotification('Plano atualizado!', 'success');
      }
    } else {
      const { error } = await supabase.from('subscription_plans').insert([payload]);
      if (error) {
        console.error('Error creating plan:', error);
        showNotification('Erro ao criar plano: ' + error.message, 'error');
      } else {
        fetchPlanTypes();
        showNotification('Novo tipo de plano criado!', 'success');
      }
    }
    setSelectedPlan(null);
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm('Remover este tipo de plano?')) {
      const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
      if (error) {
        showNotification('Erro ao remover plano', 'error');
      } else {
        fetchPlanTypes();
        showNotification('Plano removido.', 'info');
      }
    }
  };

  const handleTogglePlanStatus = async (plan: SubscriptionPlan) => {
    const { error } = await supabase
      .from('subscription_plans')
      .update({ is_active: !plan.isActive })
      .eq('id', plan.id);
    if (!error) {
      fetchPlanTypes();
      showNotification(`Plano ${!plan.isActive ? 'ativado' : 'desativado'}.`, 'info');
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchPlanTypes();
  }, []);

  const handleSave = async (data: any) => {
    const payload = {
      client_name: data.clientName,
      pet_name: data.petName,
      plan_name: data.planName,
      value: parseFloat(data.value),
      frequency: data.frequency,
      next_billing: data.nextBilling,
      status: data.status,
      payment_method: data.paymentMethod,
      max_usage: data.maxUsage,
      current_usage: data.currentUsage,
      usage_unit: data.usageUnit,
      start_date: new Date().toISOString().split('T')[0],
      tenant_id: tenantId
    };

    if (selectedSub) {
      const { error } = await supabase.from('subscriptions').update(payload).eq('id', selectedSub.id);
      if (error) {
        console.error('Error updating subscription:', error);
        showNotification('Erro ao atualizar assinatura', 'error');
      } else {
        fetchSubscriptions();
        showNotification('Assinatura atualizada!', 'success');
      }
    } else {
      const { data: subData, error } = await supabase.from('subscriptions').insert([payload]).select();
      if (error) {
        console.error('Error creating subscription:', error);
        showNotification('Erro ao criar assinatura: ' + error.message, 'error');
      } else {
        // Register subscription payment in financial transactions
        const subscriptionId = subData?.[0]?.id;
        console.log('Creating financial transaction for subscription:', subscriptionId, data.value);

        const { error: finError } = await supabase.from('financial_transactions').insert([{
          type: 'income',
          amount: parseFloat(data.value),
          description: `Assinatura: ${data.planName} - ${data.petName} (${data.clientName})`,
          status: 'paid',
          tenant_id: tenantId
        }]);

        if (finError) {
          console.error('Error creating financial transaction:', finError);
          showNotification('Assinatura criada, mas erro ao registrar no financeiro: ' + finError.message, 'warning');
        } else {
          showNotification('Nova assinatura criada e registrada no financeiro!', 'success');
        }

        fetchSubscriptions();
      }
    }
    setSelectedSub(null);
  };

  const handleEdit = (sub: Subscription) => {
    setSelectedSub(sub);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('subscriptions').update({ status: newStatus }).eq('id', id);
    if (!error) {
      fetchSubscriptions();
      showNotification(`Assinatura ${newStatus === 'active' ? 'ativada' : 'pausada'}.`, 'info');
    }
  };

  const handleRecommendPlan = async () => {
    setIsAIOpen(true);
    setAiSuggestion('');
    setIsGenerating(true);

    try {
      const model = getGeminiModel();
      const prompt = `
            Atue como um estrategista de retenção para Pet Shops.
            Análise os planos atuais: ${JSON.stringify(subscriptions.map(s => s.planName))}.
            Sugira estratégias para aumentar o MRR e reduzir churn.
            Responda em formato Markdown curto.
        `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      setAiSuggestion(response.text() || "Sem sugestões.");
    } catch (e) {
      console.error(e);
      setAiSuggestion("Erro ao gerar sugestões.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.petName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'Todos' ||
      (filter === 'Ativos' && sub.status === 'active') ||
      (filter === 'Problemas' && sub.status === 'payment_failed');
    return matchesSearch && matchesFilter;
  });

  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, curr) => acc + curr.valueNumeric, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-tight">Ativo</span>;
      case 'paused': return <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-tight">Pausado</span>;
      case 'cancelled': return <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-tight">Cancelado</span>;
      case 'payment_failed': return <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-tight">Falha Pagto</span>;
      default: return null;
    }
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      <SubscriptionFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSub(null); }}
        onSave={handleSave}
        initialData={selectedSub}
        planTypes={planTypes}
      />

      {isAIOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAIOpen(false)}></div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-100 dark:border-gray-800 flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white leading-none">Estrategista de Planos IA</h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">Sugestões para aumentar o MRR</p>
                </div>
              </div>
              <button onClick={() => setIsAIOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg mb-2">Analisando base de clientes...</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-gray-300 leading-relaxed">
                    {aiSuggestion}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PlanTypeModal
        isOpen={isPlanModalOpen}
        onClose={() => { setIsPlanModalOpen(false); setSelectedPlan(null); }}
        onSave={handleSavePlan}
        initialData={selectedPlan}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase italic">Assinaturas</h1>
          <p className="text-slate-500 dark:text-gray-400">Gerencie planos recorrentes e clube de benefícios.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecommendPlan}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-primary/30 text-primary rounded-lg font-bold text-sm hover:bg-primary/5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span> Sugerir Planos
          </button>
          {activeView === 'subscriptions' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/30 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> Nova Assinatura
            </button>
          ) : (
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/30 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">loyalty</span> Novo Tipo de Plano
            </button>
          )}
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('subscriptions')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeView === 'subscriptions'
            ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg'
            : 'bg-white dark:bg-[#1a1a1a] text-slate-500 border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-white/5'}`}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            Assinaturas Ativas
          </span>
        </button>
        <button
          onClick={() => setActiveView('plans')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeView === 'plans'
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'bg-white dark:bg-[#1a1a1a] text-slate-500 border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-white/5'}`}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">loyalty</span>
            Tipos de Plano
            <span className="bg-primary/20 text-white px-1.5 py-0.5 rounded text-[10px]">{planTypes.length}</span>
          </span>
        </button>
      </div>

      {/* Subscriptions View */}
      {activeView === 'subscriptions' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">MRR (Recorrente Mensal)</p>
                <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                  <span className="material-symbols-outlined">attach_money</span>
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {mrr.toFixed(2)}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> Estimado
              </span>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Assinantes Ativos</p>
                <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <span className="material-symbols-outlined">groups</span>
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{subscriptions.filter(s => s.status === 'active').length}</p>
              <p className="text-xs text-slate-500 mt-2">Total de {subscriptions.length} registros</p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Churn Rate</p>
                <span className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  <span className="material-symbols-outlined">trending_down</span>
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">2.4%</p>
              <p className="text-xs text-slate-500 mt-2">Estabilidade Alta</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex gap-4 border-b border-slate-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
                {['Todos', 'Ativos', 'Problemas'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`pb-3 border-b-4 font-bold text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${filter === tab
                      ? 'border-primary text-black dark:text-white'
                      : 'border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative w-full lg:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Buscar cliente ou pet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#1a1a1a] dark:text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-[#111] text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Cliente / Pet</th>
                      <th className="px-6 py-4">Plano</th>
                      <th className="px-6 py-4">Consumo</th>
                      <th className="px-6 py-4 text-right">Valor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    {filteredSubs.map((sub) => {
                      const usagePercent = Math.min(100, Math.round((sub.currentUsage / sub.maxUsage) * 100)) || 0;
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{sub.clientName}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">pets</span> {sub.petName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700 dark:text-gray-200 text-sm">{sub.planName}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold">{sub.frequency}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 w-32">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                <span>{sub.currentUsage}/{sub.maxUsage} {sub.usageUnit}</span>
                                <span>{usagePercent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${usagePercent}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">{sub.value}</td>
                          <td className="px-6 py-4">
                            {getStatusBadge(sub.status)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggleStatus(sub.id, sub.status)}
                                className={`p-1.5 rounded-lg transition-colors ${sub.status === 'active' ? 'text-slate-400 hover:text-yellow-600 hover:bg-yellow-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                              >
                                <span className="material-symbols-outlined text-[18px]">{sub.status === 'active' ? 'pause' : 'play_arrow'}</span>
                              </button>
                              <button
                                onClick={() => handleEdit(sub)}
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )
      }

      {/* Plan Types View */}
      {
        activeView === 'plans' && (
          <div className="animate-in fade-in duration-300">
            {plansLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : planTypes.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-3xl border border-purple-200/50 dark:border-purple-800/20">
                <span className="material-symbols-outlined text-6xl text-purple-300 dark:text-purple-700 mb-4">loyalty</span>
                <p className="text-slate-500 dark:text-gray-400 font-bold mb-2">Nenhum tipo de plano cadastrado</p>
                <p className="text-slate-400 dark:text-gray-500 text-sm mb-4">Crie modelos de assinatura para oferecer aos seus clientes</p>
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="text-purple-600 dark:text-purple-400 font-bold text-sm hover:underline inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Criar primeiro plano
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planTypes.map((plan) => {
                  // Color map matching Settings accent colors
                  const colorHexMap: Record<string, string> = {
                    primary: '', // Uses CSS variable
                    purple: '#7c3aed',
                    violet: '#8b5cf6',
                    fuchsia: '#d946ef',
                    pink: '#db2777',
                    rose: '#e11d48',
                    blue: '#2563eb',
                    indigo: '#4f46e5',
                    sky: '#0ea5e9',
                    cyan: '#06b6d4',
                    teal: '#0d9488',
                    emerald: '#10b981',
                    green: '#059669',
                    lime: '#84cc16',
                    amber: '#f59e0b',
                    orange: '#f97316'
                  };
                  const isPrimaryColor = plan.color === 'primary';
                  const bgColor = isPrimaryColor ? 'var(--color-primary)' : (colorHexMap[plan.color] || '#7c3aed');
                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white dark:bg-[#1a1a1a] rounded-2xl border ${plan.isActive ? 'border-slate-200 dark:border-gray-800' : 'border-slate-100 dark:border-gray-800 opacity-60'} shadow-sm hover:shadow-lg transition-all overflow-hidden group`}
                    >
                      {/* Color Header */}
                      <div
                        className="h-24 relative"
                        style={{ background: bgColor }}
                      >
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-4 left-6">
                          <h3 className="text-xl font-black text-white drop-shadow-lg">{plan.name}</h3>
                        </div>
                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleTogglePlanStatus(plan)}
                            className={`w-8 h-8 rounded-full ${plan.isActive ? 'bg-white/90 text-green-600' : 'bg-white/90 text-slate-400'} flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
                            title={plan.isActive ? 'Desativar' : 'Ativar'}
                          >
                            <span className="material-symbols-outlined text-sm">{plan.isActive ? 'check_circle' : 'pause_circle'}</span>
                          </button>
                          <button
                            onClick={() => { setSelectedPlan(plan); setIsPlanModalOpen(true); }}
                            className="w-8 h-8 rounded-full bg-white/90 text-slate-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            title="Remover"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                        {plan.description && (
                          <p className="text-slate-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{plan.description}</p>
                        )}

                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">R$ {plan.price.toFixed(2)}</span>
                          <span className="text-xs text-slate-400 font-bold uppercase">/{plan.frequency}</span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                            <span className="text-slate-600 dark:text-gray-300">{plan.maxUsage} {plan.usageUnit} por período</span>
                          </div>
                          {plan.services.slice(0, 3).map((service, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                              <span className="text-slate-600 dark:text-gray-300">{service}</span>
                            </div>
                          ))}
                          {plan.services.length > 3 && (
                            <p className="text-xs text-slate-400 ml-6">+{plan.services.length - 3} mais serviços</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-gray-800">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${plan.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {plan.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                          <button
                            onClick={() => { setSelectedPlan(plan); setIsPlanModalOpen(true); }}
                            className="text-primary font-bold text-xs hover:underline"
                          >
                            Editar Plano
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Plan Card */}
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center p-8 text-primary/60 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group min-h-[280px]"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">add</span>
                  </div>
                  <p className="font-bold text-sm">Criar Novo Plano</p>
                  <p className="text-xs text-slate-400 mt-1">Defina um modelo de assinatura</p>
                </button>
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};