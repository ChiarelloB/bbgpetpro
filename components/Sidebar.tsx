import React, { useState } from 'react';
import { ScreenType, NavItem } from '../types';
import { DEFAULT_ROLES } from '../constants';
import { useTheme, SidebarTheme } from '../ThemeContext';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
  userProfile?: { name: string; email: string; avatar: string; role: string };
}

// Define the structure for grouped navigation
type NavGroup = {
  title: string;
  items: NavItem[];
};

// Mapeamento de estilos baseados no tema da sidebar
const sidebarStyles: Record<SidebarTheme, {
  container: string;
  text: string;
  muted: string;
  border: string;
  hover: string;
  sectionBg: string;
  activeItem: string;
}> = {
  default: {
    container: 'bg-[#1e293b] dark:bg-[#0f172a]', // Slate 800/900 - distinct standard
    text: 'text-slate-300',
    muted: 'text-slate-500',
    border: 'border-slate-700/50',
    hover: 'hover:bg-white/5 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-primary text-white shadow-md shadow-primary/20'
  },
  light: {
    container: 'bg-white dark:bg-[#111]',
    text: 'text-slate-600 dark:text-slate-300',
    muted: 'text-slate-400',
    border: 'border-slate-200 dark:border-gray-800',
    hover: 'hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white',
    sectionBg: 'bg-slate-50 dark:bg-black/20',
    activeItem: 'bg-primary text-white shadow-md shadow-primary/20'
  },
  navy: {
    container: 'bg-[#1e3a8a] dark:bg-[#172554]', // Blue 900
    text: 'text-blue-100',
    muted: 'text-blue-300/60',
    border: 'border-blue-800/50',
    hover: 'hover:bg-blue-800/40 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-white text-blue-900 shadow-md'
  },
  forest: {
    container: 'bg-[#064e3b] dark:bg-[#022c22]', // Emerald 900
    text: 'text-emerald-50',
    muted: 'text-emerald-200/60',
    border: 'border-emerald-800/50',
    hover: 'hover:bg-emerald-800/40 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
  },
  black: {
    container: 'bg-black',
    text: 'text-gray-300',
    muted: 'text-gray-600',
    border: 'border-gray-800',
    hover: 'hover:bg-white/10 hover:text-white',
    sectionBg: 'bg-white/5',
    activeItem: 'bg-white text-black shadow-md shadow-white/10'
  },
  purple: {
    container: 'bg-[#4c1d95] dark:bg-[#2e1065]', // Violet 900
    text: 'text-violet-100',
    muted: 'text-violet-300/60',
    border: 'border-violet-800/50',
    hover: 'hover:bg-violet-800/40 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-white text-violet-900 shadow-md'
  },
  // New Themes
  slate: {
    container: 'bg-slate-900 dark:bg-slate-950',
    text: 'text-slate-300',
    muted: 'text-slate-500',
    border: 'border-slate-800',
    hover: 'hover:bg-white/5 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-primary text-white shadow-md'
  },
  zinc: {
    container: 'bg-zinc-900 dark:bg-zinc-950',
    text: 'text-zinc-300',
    muted: 'text-zinc-500',
    border: 'border-zinc-800',
    hover: 'hover:bg-white/5 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-white text-zinc-900 shadow-md'
  },
  stone: {
    container: 'bg-stone-900 dark:bg-stone-950',
    text: 'text-stone-300',
    muted: 'text-stone-500',
    border: 'border-stone-800',
    hover: 'hover:bg-white/5 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-[#d6d3d1] text-stone-900 shadow-md'
  },
  ruby: {
    container: 'bg-[#881337] dark:bg-[#4c0519]', // Rose 900
    text: 'text-rose-100',
    muted: 'text-rose-300/60',
    border: 'border-rose-800/50',
    hover: 'hover:bg-rose-800/40 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-white text-rose-900 shadow-md'
  },
  chocolate: {
    container: 'bg-[#451a03] dark:bg-[#451a03]', // Amber 950
    text: 'text-orange-100',
    muted: 'text-orange-300/50',
    border: 'border-orange-900/30',
    hover: 'hover:bg-orange-900/40 hover:text-white',
    sectionBg: 'bg-black/20',
    activeItem: 'bg-orange-500 text-white shadow-md'
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, isOpen = false, onClose, onLogout, userProfile }) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const { sidebarTheme } = useTheme();

  // Get current styles based on theme
  const styles = sidebarStyles[sidebarTheme];

  const handleNavClick = (screen: ScreenType) => {
    onNavigate(screen);
    if (onClose) onClose();
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const defaultUser = {
    name: 'Usuário',
    role: 'Staff',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM3kjadQTjMTHl9YC-OrGR8wbZYUqoOrwId5WQ7c2eyZomiQk05HuotL6zwyo6Z9Tr5P-wLbqRkvXJ4tfqjiuIyIJRMtI60gAaGhsmDbYvURZIWtzVvmBHOZTA-JhfziZkJiaZsO3kiG-01SxOfOajsZqvE8qPHg8m0ijjIFfFyzwhP-y1iG2BhKcEaK44Gpg2MMxv_x_m5TEoqZnmVJGCnHaw4ZCwyyusgRRLNTU8tgNXStlKIvVM24O-x_t-2WnpW99rwAs7oI'
  };

  const user = userProfile || defaultUser;

  // Determine user permissions based on role
  const getUserPermissions = () => {
    const roleName = user.role.toLowerCase();
    const roleConfig = DEFAULT_ROLES.find(r => r.name.toLowerCase() === roleName) ||
      DEFAULT_ROLES.find(r => roleName.includes(r.name.toLowerCase()) || r.id === roleName);

    return roleConfig?.permissions || {
      dashboard: true, userDashboard: false, schedule: true, execution: false, pos: false,
      clients: true, inventory: false, finance: false, team: false,
      communication: false, services: false, subscriptions: false, reports: false, settings: false, database: false, delivery: false
    };
  };

  const permissions = getUserPermissions();

  const navGroups: NavGroup[] = [
    {
      title: 'Visão Geral',
      items: [
        // Conditionally show Main Dashboard OR User Dashboard based on permissions
        ...(permissions.dashboard ? [{ id: 'dashboard' as ScreenType, label: 'Painel', icon: 'dashboard' }] : []),
        ...(permissions.userDashboard ? [{ id: 'userDashboard' as ScreenType, label: 'Meu Painel', icon: 'dashboard_customize' }] : []),
        { id: 'roadmap', label: 'Roadmap', icon: 'map' },
      ]
    },
    {
      title: 'Atendimento',
      items: [
        { id: 'schedule', label: 'Agenda', icon: 'calendar_clock' },
        { id: 'execution', label: 'Execução', icon: 'playlist_play' },
        { id: 'delivery', label: 'Entrega', icon: 'local_shipping' },
        { id: 'pos', label: 'Caixa / PDV', icon: 'point_of_sale' },
        { id: 'clients', label: 'Clientes', icon: 'groups' },
        { id: 'petProfile', label: 'Pets', icon: 'pets' },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { id: 'finance', label: 'Financeiro', icon: 'payments' },
        { id: 'subscriptions', label: 'Assinaturas', icon: 'loyalty' },
        { id: 'inventory', label: 'Estoque', icon: 'inventory_2' },
        { id: 'services', label: 'Serviços', icon: 'medical_services' },
        { id: 'team', label: 'Equipe', icon: 'badge' },
        { id: 'reports', label: 'Relatórios', icon: 'bar_chart' },
        { id: 'database', label: 'Banco de Dados', icon: 'database' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { id: 'communication', label: 'Comunicação', icon: 'chat' },
      ]
    }
  ];

  // Filter groups based on permissions
  const visibleGroups = navGroups.map(group => {
    const visibleItems = group.items.filter(item => {
      if (item.id === 'petProfile') return permissions.clients;
      if (item.id === 'roadmap') return permissions.dashboard || permissions.userDashboard;
      const permissionKey = item.id as keyof typeof permissions;
      return permissions[permissionKey];
    });
    return { ...group, items: visibleItems };
  }).filter(group => group.items.length > 0);

  const canSeeSettings = permissions.settings;

  const sidebarContent = (
    <div className={`flex flex-col h-full ${styles.container} ${styles.text} transition-colors duration-300 border-r ${styles.border}`}>

      {/* Brand Header */}
      <div className={`p-6 flex items-center justify-between shrink-0 ${styles.sectionBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/40">
            <span className="material-symbols-outlined">pets</span>
          </div>
          <div>
            <h1 className={`font-black text-xl tracking-tight italic uppercase ${sidebarTheme === 'light' ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
              FLOW PET <span className="text-primary">PRO</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <p className={`text-[10px] font-bold tracking-widest uppercase ${styles.muted}`}>{user.role}</p>
            </div>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button onClick={onClose} className={`md:hidden p-2 hover:bg-white/10 rounded-full transition-colors ${styles.muted}`}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto nike-scroll">
        {visibleGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <button
              onClick={() => toggleGroup(group.title)}
              className={`w-full flex items-center justify-between px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors group ${styles.muted} hover:text-opacity-80`}
            >
              {group.title}
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${expandedGroups.includes(group.title) ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedGroups.includes(group.title) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${currentScreen === item.id
                    ? styles.activeItem
                    : `${styles.muted} ${styles.hover}`
                    }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${currentScreen === item.id ? 'material-symbols-filled' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>

                  {currentScreen === item.id && (
                    <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {canSeeSettings && (
          <div className={`pt-4 mt-2 border-t ${styles.border}`}>
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${currentScreen === 'settings'
                ? styles.activeItem
                : `${styles.muted} ${styles.hover}`
                }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${currentScreen === 'settings' ? 'material-symbols-filled' : ''}`}>
                settings
              </span>
              <span className="font-medium text-sm">Configurações</span>
            </button>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className={`p-4 border-t ${styles.border} ${styles.sectionBg} space-y-3 shrink-0`}>
        <div className={`hidden md:flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider ${styles.muted}`}>
          <span>Busca Rápida</span>
          <span className={`px-1.5 py-0.5 rounded border ${styles.border} opacity-70`}>⌘ K</span>
        </div>
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group text-left ${styles.hover}`}
        >
          <div className="relative">
            <img
              src={user.avatar}
              alt="User"
              className={`w-9 h-9 rounded-lg object-cover border ${styles.border} group-hover:border-opacity-50 transition-colors`}
            />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-transparent rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${sidebarTheme === 'light' ? 'text-slate-800 dark:text-white' : 'text-white'}`}>{user.name}</p>
            <p className={`text-xs truncate transition-colors ${styles.muted} group-hover:text-red-400`}>Sair da conta</p>
          </div>
          <span className={`material-symbols-outlined ${styles.muted} group-hover:text-red-400 transition-colors`}>logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] h-full shrink-0 transform transition-transform duration-300 md:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};