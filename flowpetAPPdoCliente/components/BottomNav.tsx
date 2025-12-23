import React from 'react';
import { Home, PawPrint, CalendarDays, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onAddClick }) => {
  const getTabClass = (tabName: string) => {
    return activeTab === tabName 
      ? "text-indigo-400" 
      : "text-white/40 hover:text-white group";
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-dark-900/90 backdrop-blur-xl border-t border-white/5 pb-8 pt-2 px-6 z-50 rounded-t-3xl">
      <div className="flex justify-between items-end">
        
        {/* Home */}
        <button 
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${getTabClass('home')}`}
        >
          <Home size={24} className={activeTab !== 'home' ? "group-hover:-translate-y-1 transition-transform" : ""} fill={activeTab === 'home' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Pets */}
        <button 
          onClick={() => onTabChange('pets')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${getTabClass('pets')}`}
        >
          <PawPrint size={24} className={activeTab !== 'pets' ? "group-hover:-translate-y-1 transition-transform" : ""} fill={activeTab === 'pets' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Pets</span>
        </button>

        {/* Add Button (Floating) */}
        <div className="relative -top-6">
          <button 
            onClick={onAddClick}
            className="bg-indigo-500 text-white w-14 h-14 rounded-full shadow-neon shadow-indigo-500/40 border-4 border-dark-900 flex items-center justify-center transform active:scale-95 transition-all hover:bg-indigo-400 hover:scale-105"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {/* Agenda */}
        <button 
          onClick={() => onTabChange('agenda')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${getTabClass('agenda')}`}
        >
          <CalendarDays size={24} className={activeTab !== 'agenda' ? "group-hover:-translate-y-1 transition-transform" : ""} fill={activeTab === 'agenda' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>

        {/* Perfil */}
        <button 
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${getTabClass('profile')}`}
        >
          <User size={24} className={activeTab !== 'profile' ? "group-hover:-translate-y-1 transition-transform" : ""} fill={activeTab === 'profile' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>

      </div>
    </nav>
  );
};