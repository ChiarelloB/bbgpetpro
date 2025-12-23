import React from 'react';

export const Editor: React.FC = () => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Editor Visual LP</h2>
          <div className="flex items-center gap-2 text-sm text-text-muted font-light">
            <span>Landing Page</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-white font-medium">Versão 2.1 (Rascunho)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Salvo automaticamente
          </span>
          <button className="px-5 py-2.5 rounded-full border border-glass-border hover:bg-white/5 text-text-muted hover:text-white transition-all text-sm font-medium">
            Descartar
          </button>
          <button className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Publicar Página
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Panel: Structure */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1 pb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Estrutura da Página</h3>
            <button className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white">
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Cabeçalho (Hero)', active: true, icon: 'edit' },
              { name: 'Vídeo Demo', active: false, icon: 'visibility' },
              { name: 'Benefícios Principais', active: false, icon: 'visibility' },
              { name: 'Depoimentos', active: false, icon: 'visibility' },
              { name: 'Planos & Preços', active: false, icon: 'visibility' },
              { name: 'CTA Rodapé', active: false, icon: 'visibility' },
            ].map((item, i) => (
              <div key={i} className={`glass-panel p-4 rounded-3xl transition-all cursor-pointer group ${item.active ? 'border-primary/50 bg-primary/5' : 'hover:bg-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined cursor-grab text-[20px] ${item.active ? 'text-text-muted' : 'text-text-muted/50 group-hover:text-text-muted'}`}>drag_indicator</span>
                  <div className="flex-1">
                    <p className={`text-sm ${item.active ? 'font-bold text-white' : 'font-medium text-text-muted group-hover:text-white'}`}>{item.name}</p>
                    {item.active && <p className="text-[10px] text-primary">Editando agora</p>}
                  </div>
                  <span className={`material-symbols-outlined text-[20px] ${item.active ? 'text-primary' : 'text-text-muted/30 group-hover:text-white'}`}>{item.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Panel: Content Editor */}
        <div className="col-span-12 lg:col-span-5 flex flex-col min-h-0">
          <div className="glass-panel rounded-4xl flex-1 flex flex-col overflow-hidden relative">
            <div className="flex items-center border-b border-glass-border px-6 pt-6 pb-2 gap-6">
              <button className="text-sm font-bold text-primary border-b-2 border-primary pb-2">Conteúdo</button>
              <button className="text-sm font-medium text-text-muted hover:text-white pb-2 transition-colors">Estilo</button>
              <button className="text-sm font-medium text-text-muted hover:text-white pb-2 transition-colors">Configurações</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Título Principal (H1)</label>
                  <input className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-text-muted/30" type="text" defaultValue="Gestão Completa para seu Pet Shop"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Subtítulo</label>
                  <textarea className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-text-muted focus:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none" rows={3} defaultValue="Otimize agendamentos, fidelize clientes e gerencie seu faturamento em uma única plataforma intuitiva."></textarea>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">touch_app</span>
                    Botão de Ação (CTA)
                  </span>
                  <div className="w-10 h-6 bg-primary/20 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1 ml-1">Texto do Botão</label>
                    <input className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary outline-none" type="text" defaultValue="Começar Teste Grátis"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1 ml-1">Link de Destino</label>
                    <input className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-primary focus:border-primary outline-none" type="text" defaultValue="/cadastro"/>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Imagem de Destaque</label>
                <div className="border-2 border-dashed border-white/10 rounded-3xl p-6 text-center hover:bg-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                  <div className="w-full h-32 bg-black/40 rounded-xl mb-3 overflow-hidden relative group-hover:shadow-lg transition-all">
                    <img alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all" src="https://picsum.photos/seed/pet/800/400"/>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">edit</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white">Clique para substituir</p>
                  <p className="text-xs text-text-muted">JPG, PNG ou WEBP (Max 2MB)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Pré-visualização</h3>
            <div className="flex bg-glass border border-glass-border rounded-lg p-0.5">
              <button className="p-1 rounded hover:bg-white/10 text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">smartphone</span>
              </button>
              <button className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
              </button>
            </div>
          </div>
          <div className="glass-panel rounded-[2.5rem] flex-1 relative overflow-hidden flex flex-col border-[8px] border-surface-dark shadow-2xl device-mockup bg-black">
             {/* Mockup Top Bar */}
             <div className="h-8 w-full bg-black flex justify-between items-center px-6 pt-2 z-20 absolute top-0">
               <span className="text-[10px] font-medium text-white">9:41</span>
               <div className="flex gap-1.5">
                 <span className="material-symbols-outlined text-[12px] text-white">signal_cellular_alt</span>
                 <span className="material-symbols-outlined text-[12px] text-white">wifi</span>
                 <span className="material-symbols-outlined text-[12px] text-white">battery_full</span>
               </div>
             </div>
             {/* Preview Content */}
             <div className="flex-1 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-y-auto mt-8 relative no-scrollbar">
                <div className="flex items-center justify-between p-4 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
                  <span className="font-bold text-sm text-white">Flow Pet</span>
                  <span className="material-symbols-outlined text-white text-[20px]">menu</span>
                </div>
                <div className="px-5 py-8 text-center relative">
                  <div className="absolute inset-0 border-2 border-primary/50 bg-primary/5 pointer-events-none rounded-xl">
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-[8px] font-bold text-white rounded uppercase tracking-wider">Editando</span>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-primary font-bold mb-4">NOVO SISTEMA 2.0</span>
                  <h1 className="text-2xl font-bold text-white leading-tight mb-3">Gestão Completa para seu Pet Shop</h1>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">Otimize agendamentos, fidelize clientes e gerencie seu faturamento em uma única plataforma intuitiva.</p>
                  <div className="flex flex-col gap-3">
                    <button className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25">Começar Teste Grátis</button>
                    <button className="w-full py-3 bg-transparent border border-white/10 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                       <span className="material-symbols-outlined text-[16px]">play_circle</span>
                       Ver Demonstração
                    </button>
                  </div>
                </div>
                <div className="mt-2 mx-4 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/5 h-40 relative">
                  <img alt="Sim" className="w-full h-full object-cover" src="https://picsum.photos/seed/pet/600/300"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                </div>
                <div className="h-10"></div>
             </div>
             {/* Mockup Home Bar */}
             <div className="h-1 w-24 bg-white/20 rounded-full mx-auto mb-2 absolute bottom-2 left-0 right-0"></div>
          </div>
          <div className="text-center mt-3">
            <p className="text-[10px] text-text-muted uppercase tracking-widest">iPhone 14 Pro • Mobile View</p>
          </div>
        </div>
      </div>
    </div>
  );
};