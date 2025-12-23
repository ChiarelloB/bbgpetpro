import React, { useState } from 'react';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, CreditCard, Star } from 'lucide-react';

interface UserProfileViewProps {
    onLogout: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onLogout }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] mb-4 shadow-neon">
          <img 
            src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" 
            alt="User" 
            className="w-full h-full rounded-full object-cover border-4 border-dark-900"
          />
        </div>
        <h2 className="text-2xl font-bold text-white">Gabriel Silva</h2>
        <p className="text-white/40 text-sm">gabriel.silva@email.com</p>
        
        <div className="mt-4 flex gap-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center gap-1">
            <Star size={12} fill="currentColor" /> PREMIUM
          </span>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="space-y-4">
        {/* Account Group */}
        <div className="bg-glass-bg border border-glass-border rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="p-4 border-b border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/80 group-hover:text-indigo-400 transition-colors">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Dados Pessoais</p>
              <p className="text-xs text-white/40">Alterar nome, telefone</p>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
          </div>
          
          <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/80 group-hover:text-indigo-400 transition-colors">
              <CreditCard size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Assinatura</p>
              <p className="text-xs text-white/40">Gerenciar plano Pro</p>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>

        {/* Settings Group */}
        <div className="bg-glass-bg border border-glass-border rounded-3xl overflow-hidden backdrop-blur-md">
          <div 
            className="p-4 border-b border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer select-none"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/80">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Notificações</p>
              <p className="text-xs text-white/40">Vacinas, Consultas</p>
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
              <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Segurança</p>
              <p className="text-xs text-white/40">FaceID, Senha</p>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
          </div>
          
           <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/80 group-hover:text-indigo-400 transition-colors">
              <Settings size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Preferências</p>
              <p className="text-xs text-white/40">Tema, Idioma</p>
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
    </div>
  );
};