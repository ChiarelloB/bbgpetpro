import React, { useState, useEffect, useRef } from 'react';
import { ScreenType } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenType) => void;
}

type CommandGroup = {
  title: string;
  commands: {
    id: string;
    label: string;
    icon: string;
    action: () => void;
    shortcut?: string;
  }[];
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const groups: CommandGroup[] = [
    {
      title: 'Navegação',
      commands: [
        { id: 'nav-dashboard', label: 'Ir para Painel', icon: 'dashboard', action: () => onNavigate('dashboard') },
        { id: 'nav-schedule', label: 'Ir para Agenda', icon: 'calendar_month', action: () => onNavigate('schedule') },
        { id: 'nav-clients', label: 'Ir para Clientes', icon: 'group', action: () => onNavigate('clients') },
        { id: 'nav-inventory', label: 'Ir para Estoque', icon: 'inventory_2', action: () => onNavigate('inventory') },
        { id: 'nav-finance', label: 'Ir para Financeiro', icon: 'payments', action: () => onNavigate('finance') },
      ]
    },
    {
      title: 'Ações Rápidas',
      commands: [
        { id: 'act-new-client', label: 'Novo Cliente', icon: 'person_add', action: () => onNavigate('clients') },
        { id: 'act-new-appt', label: 'Novo Agendamento', icon: 'add_circle', action: () => onNavigate('schedule') },
        { id: 'act-new-sale', label: 'Nova Venda', icon: 'point_of_sale', action: () => onNavigate('finance') },
      ]
    },
    {
      title: 'Sistema',
      commands: [
        { id: 'sys-theme', label: 'Alternar Tema', icon: 'dark_mode', action: () => { /* Handled globally/context */ onClose(); } },
        { id: 'sys-settings', label: 'Configurações', icon: 'settings', action: () => onNavigate('settings') },
        { id: 'sys-help', label: 'Ajuda & Suporte', icon: 'help', action: () => window.open('https://help.petmanager.com', '_blank') },
      ]
    }
  ];

  const filteredGroups = groups.map(group => ({
    ...group,
    commands: group.commands.filter(cmd =>
      cmd.label.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(group => group.commands.length > 0);

  const flatCommands = filteredGroups.flatMap(g => g.commands);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = flatCommands[selectedIndex];
      if (cmd) {
        cmd.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-gray-800 flex flex-col max-h-[60vh]">
        <div className="border-b border-slate-100 dark:border-gray-800 flex items-center px-4 py-3 gap-3">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="O que você procura?"
            className="flex-1 bg-transparent border-none text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-0 text-base"
          />
          <div className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">ESC</div>
        </div>

        <div className="overflow-y-auto p-2">
          {filteredGroups.map((group) => (
            <div key={group.title} className="mb-2">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.title}</div>
              {group.commands.map((cmd) => {
                const isSelected = flatCommands[selectedIndex]?.id === cmd.id;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(flatCommands.findIndex(c => c.id === cmd.id))}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${isSelected
                      ? 'bg-primary text-white'
                      : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-white' : 'text-slate-400'}`}>{cmd.icon}</span>
                    <span className="flex-1 font-medium text-sm">{cmd.label}</span>
                    {isSelected && <span className="material-symbols-outlined text-[16px]">subdirectory_arrow_left</span>}
                  </button>
                );
              })}
            </div>
          ))}
          {flatCommands.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Nenhum resultado encontrado para "{search}"
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-[#111] px-4 py-2 border-t border-slate-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">arrow_drop_up</span> <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span> Navegar</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">keyboard_return</span> Selecionar</span>
          </div>
          <span>FLOW PET PRO</span>
        </div>
      </div>
    </div>
  );
};