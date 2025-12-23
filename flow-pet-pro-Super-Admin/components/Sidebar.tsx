import React from 'react';
import { ViewState, MenuItem } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}

const MENU_ITEMS: MenuItem[] = [
  { id: ViewState.DASHBOARD, label: 'Visão Geral', icon: 'dashboard', section: 'Geral' },
  { id: ViewState.CRM, label: 'Pipeline CRM', icon: 'view_kanban', section: 'Geral' },
  { id: ViewState.COMPANIES, label: 'Empresas', icon: 'storefront', section: 'Geral' },
  { id: ViewState.APP_TUTOR, label: 'App do Tutor', icon: 'smartphone', section: 'Geral' },
  { id: ViewState.EDITOR, label: 'Landing Page', icon: 'web', section: 'Geral' },
  { id: ViewState.USERS, label: 'Usuários Admin', icon: 'group', section: 'Sistema' },
  { id: ViewState.PLANS, label: 'Planos & Assinaturas', icon: 'loyalty', section: 'Sistema' },
  { id: ViewState.REPORTS, label: 'Relatórios', icon: 'analytics', section: 'Sistema' },
  { id: ViewState.SETTINGS, label: 'Configurações', icon: 'settings', section: 'Sistema' },
];

interface NavItemProps {
  item: MenuItem;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, currentView, onNavigate }) => {
  const isActive = currentView === item.id;
  return (
    <button
      onClick={() => onNavigate(item.id)}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-4xl transition-all group ${isActive
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
        : 'text-text-muted hover:text-white hover:bg-white/5'
        }`}
    >
      <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : 'group-hover:text-primary transition-colors'}`}>
        {item.icon}
      </span>
      <span className="font-medium">{item.label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, user, onLogout }) => {
  const geralItems = MENU_ITEMS.filter(i => i.section === 'Geral');
  const sistemaItems = MENU_ITEMS.filter(i => i.section === 'Sistema');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 h-full
        bg-surface-dark lg:bg-transparent 
        border-r border-glass-border lg:border-none 
        shadow-2xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col p-6
      `}>
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined text-white !font-bold">pets</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none text-white">Flow Pet <span className="text-primary font-black">PRO</span></h1>
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Super Admin</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          <div className="px-4 mt-2 mb-2">
            <span className="text-xs font-semibold text-text-muted/60 uppercase tracking-wider">Geral</span>
          </div>
          {geralItems.map(item => <NavItem key={item.id} item={item} currentView={currentView} onNavigate={onNavigate} />)}

          <div className="px-4 mt-8 mb-2">
            <span className="text-xs font-semibold text-text-muted/60 uppercase tracking-wider">Sistema</span>
          </div>
          {sistemaItems.map(item => <NavItem key={item.id} item={item} currentView={currentView} onNavigate={onNavigate} />)}
        </nav>

        <div className="mt-6 pt-6 border-t border-glass-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-surface-dark border border-glass-border flex items-center justify-center overflow-hidden">
              <span className="font-bold text-xs text-text-muted">SA</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Administrador</p>
              <p className="text-xs text-text-muted">{user?.email || 'admin@flowpet.pro'}</p>
            </div>
            <button
              onClick={onLogout}
              className="text-text-muted hover:text-white transition-colors"
              title="Sair"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};