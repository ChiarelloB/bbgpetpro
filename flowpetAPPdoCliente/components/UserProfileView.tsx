import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, MapPin, Phone, Mail, Edit2, Check, X, Store, Calendar, PawPrint, Loader2 } from 'lucide-react';
import { SubscriptionSection } from './SubscriptionSection';

interface UserProfileViewProps {
  onLogout: () => void;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

interface PetShop {
  id: string;
  name: string;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onLogout }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'subscriptions'>('profile');

  const [user, setUser] = useState<any>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [petShop, setPetShop] = useState<PetShop | null>(null);
  const [petsCount, setPetsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);


  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setUser(session.user);

    // Get pet shop from localStorage
    const savedPetShop = localStorage.getItem('flowpet_petshop');
    if (savedPetShop) {
      const shop = JSON.parse(savedPetShop);
      setPetShop(shop);

      // Get client data
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('tenant_id', shop.id)
        .eq('email', session.user.email)
        .single();

      if (client) {
        setClientData(client);
        setFormName(client.name || '');
        setFormPhone(client.phone || '');

        // Get pets count
        const { count: pCount } = await supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);
        setPetsCount(pCount || 0);

        // Get appointments count
        const { count: aCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);
        setAppointmentsCount(aCount || 0);
      }
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!clientData || !petShop) return;

    setSaving(true);

    await supabase
      .from('clients')
      .update({
        name: formName,
        phone: formPhone
      })
      .eq('id', clientData.id);

    // Update local state
    setClientData({
      ...clientData,
      name: formName,
      phone: formPhone
    });

    setEditing(false);
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setFormName(clientData?.name || '');
    setFormPhone(clientData?.phone || '');
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] mb-4 shadow-neon">
          <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center text-4xl font-black text-white">
            {clientData?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
        </div>

        {editing ? (
          <div className="w-full max-w-xs space-y-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Seu nome"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-indigo-500"
            />
            <input
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="flex-1 py-2 rounded-xl bg-white/5 text-white/60 font-bold flex items-center justify-center gap-1"
              >
                <X size={16} /> Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-1"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white">{clientData?.name || 'Usuário'}</h2>
            <p className="text-white/40 text-sm">{user?.email}</p>
            {clientData?.phone && (
              <p className="text-white/30 text-xs flex items-center gap-1 mt-1">
                <Phone size={12} /> {clientData.phone}
              </p>
            )}
            <button
              onClick={() => setEditing(true)}
              className="mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold flex items-center gap-1 hover:bg-white/10"
            >
              <Edit2 size={12} /> Editar Perfil
            </button>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <PawPrint size={20} className="mx-auto mb-1 text-indigo-400" />
          <p className="text-xl font-black text-white">{petsCount}</p>
          <p className="text-[10px] font-bold uppercase text-white/40">Pets</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <Calendar size={20} className="mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-black text-white">{appointmentsCount}</p>
          <p className="text-[10px] font-bold uppercase text-white/40">Agendamentos</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <Store size={20} className="mx-auto mb-1 text-cyan-400" />
          <p className="text-xs font-black text-white truncate">{petShop?.name?.split(' ')[0] || '-'}</p>
          <p className="text-[10px] font-bold uppercase text-white/40">Pet Shop</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white/5 rounded-2xl p-1">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'profile'
              ? 'bg-indigo-500 text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
            }`}
        >
          Configurações
        </button>
        <button
          onClick={() => setActiveSection('subscriptions')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'subscriptions'
              ? 'bg-indigo-500 text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
            }`}
        >
          Assinaturas
        </button>
      </div>

      {activeSection === 'profile' ? (
        <>
          {/* Menu Groups */}
          <div className="space-y-4">
            {/* Settings Group */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div
                className="p-4 border-b border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer select-none"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/80">
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Notificações</p>
                  <p className="text-xs text-white/40">Receber lembretes de agendamentos</p>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-indigo-600 shadow-neon' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>

              <div className="p-4 border-b border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/80 group-hover:text-indigo-400 transition-colors">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Alterar Senha</p>
                  <p className="text-xs text-white/40">Atualizar credenciais de acesso</p>
                </div>
                <ChevronRight size={20} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
              </div>

              <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/80 group-hover:text-indigo-400 transition-colors">
                  <Settings size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Trocar Pet Shop</p>
                  <p className="text-xs text-white/40">Acessar outro estabelecimento</p>
                </div>
                <ChevronRight size={20} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-full p-4 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 text-red-400 font-bold hover:bg-red-500/20 transition-colors active:scale-95"
            >
              <LogOut size={20} />
              Sair da Conta
            </button>
          </div>
        </>
      ) : (
        <SubscriptionSection
          clientId={clientData?.id || null}
          petShopId={petShop?.id || ''}
        />
      )}
    </div>
  );
};