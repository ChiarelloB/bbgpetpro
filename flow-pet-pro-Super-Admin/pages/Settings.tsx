import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex justify-between items-start lg:items-center mb-8 gap-4 flex-col lg:flex-row">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-bold tracking-tight text-white">Configurações Globais</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[10px] text-primary font-bold uppercase tracking-wider">Super Admin</span>
          </div>
          <p className="text-text-muted text-sm font-light max-w-2xl">Ajuste os parâmetros fundamentais do ecossistema Flow Pet. As alterações aqui afetam o CRM, App do Tutor e Landing Page.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-4xl border border-glass-border bg-glass hover:bg-white/5 text-text-muted text-sm font-semibold transition-all">Cancelar</button>
          <button className="px-6 py-2.5 rounded-4xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Salvar Alterações
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-20">
        <div className="space-y-6">
          <div className="glass-panel rounded-4xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400"><span className="material-symbols-outlined">shield</span></div>
              <h3 className="font-bold text-lg text-white">Sistema & Segurança</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-3xl bg-black/20 border border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">Modo Manutenção</p>
                  <p className="text-xs text-text-muted mt-0.5">Bloqueia acesso externo temporariamente</p>
                </div>
                <label className="switch">
                  <input type="checkbox"/>
                  <span className="slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 rounded-3xl bg-black/20 border border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">Autenticação 2FA</p>
                  <p className="text-xs text-text-muted mt-0.5">Forçar para todos os Admins</p>
                </div>
                <label className="switch">
                  <input defaultChecked type="checkbox"/>
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-4xl p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400"><span className="material-symbols-outlined">hub</span></div>
              <h3 className="font-bold text-lg text-white">Integrações & APIs</h3>
            </div>
            <div className="space-y-8">
              <div>
                 <div className="flex items-center gap-2 mb-3">
                   <span className="material-symbols-outlined text-text-muted text-sm">map</span>
                   <label className="text-sm font-semibold text-white">Google Maps API</label>
                 </div>
                 <input className="w-full glass-input rounded-2xl px-4 py-3 text-sm focus:ring-0 text-text-muted tracking-widest font-mono" type="password" defaultValue="AIzaSyB************************"/>
              </div>
              <div className="pt-4 border-t border-glass-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-text-muted text-sm">payments</span>
                  <label className="text-sm font-semibold text-white">Gateway de Pagamento</label>
                </div>
                <select className="w-full glass-input rounded-2xl px-4 py-3 text-sm mb-3">
                  <option className="bg-surface-dark">Stripe</option>
                  <option className="bg-surface-dark">Mercado Pago</option>
                </select>
                <div className="grid grid-cols-1 gap-3">
                  <input className="w-full glass-input rounded-2xl px-4 py-3 text-sm focus:ring-0" placeholder="Public Key" type="text"/>
                  <input className="w-full glass-input rounded-2xl px-4 py-3 text-sm focus:ring-0" placeholder="Secret Key" type="password"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-4xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><span className="material-symbols-outlined">palette</span></div>
              <h3 className="font-bold text-lg text-white">Customização</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 ml-1">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6366f1] border-2 border-white shadow-lg cursor-pointer"></div>
                  <input className="flex-1 glass-input rounded-2xl px-4 py-2.5 text-sm uppercase font-mono" type="text" defaultValue="#6366F1"/>
                </div>
              </div>
              <div>
                 <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 ml-1">Tema Padrão</label>
                 <div className="grid grid-cols-3 gap-2">
                   <button className="bg-surface-dark border-2 border-primary text-primary rounded-xl py-2 text-xs font-bold">Dark</button>
                   <button className="bg-black/20 border border-white/5 text-text-muted hover:text-white rounded-xl py-2 text-xs font-medium">Light</button>
                   <button className="bg-black/20 border border-white/5 text-text-muted hover:text-white rounded-xl py-2 text-xs font-medium">Auto</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};