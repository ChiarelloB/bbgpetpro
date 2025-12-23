import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const Editor: React.FC = () => {
  const [content, setContent] = useState({
    title: 'Gestão Completa para seu Pet Shop',
    subtitle: 'Otimize agendamentos, fidelize clientes e gerencie seu faturamento em uma única plataforma intuitiva.',
    ctaText: 'Começar Teste Grátis',
    ctaLink: '/cadastro',
    imageUrl: 'https://picsum.photos/seed/pet/800/400'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('system_settings')
      .select('data')
      .eq('id', 'landing_page')
      .single();

    if (data?.data) {
      setContent(data.data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 'landing_page', data: content, updated_at: new Date().toISOString() });

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Página publicada com sucesso!');
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Editor Visual LP</h2>
          <div className="flex items-center gap-2 text-sm text-text-muted font-light">
            <span>Landing Page</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-white font-medium">Versão Atual</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            {saving ? 'Salvando...' : 'Status: Publicado'}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            {saving ? 'Publicando...' : 'Publicar Página'}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Panel: Structure */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1 pb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Estrutura da Página</h3>
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
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Carregando conteúdo...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Título Principal (H1)</label>
                      <input
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-text-muted/30"
                        type="text"
                        value={content.title}
                        onChange={(e) => setContent({ ...content, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Subtítulo</label>
                      <textarea
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-text-muted focus:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        rows={3}
                        value={content.subtitle}
                        onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">touch_app</span>
                        Botão de Ação (CTA)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase mb-1 ml-1">Texto do Botão</label>
                        <input
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary outline-none"
                          type="text"
                          value={content.ctaText}
                          onChange={(e) => setContent({ ...content, ctaText: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase mb-1 ml-1">Link de Destino</label>
                        <input
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-primary focus:border-primary outline-none"
                          type="text"
                          value={content.ctaLink}
                          onChange={(e) => setContent({ ...content, ctaLink: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Imagem de Destaque (URL)</label>
                    <div className="space-y-4">
                      <input
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="text"
                        value={content.imageUrl}
                        onChange={(e) => setContent({ ...content, imageUrl: e.target.value })}
                      />
                      <div className="border-2 border-dashed border-white/10 rounded-3xl overflow-hidden h-32 relative group">
                        <img alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all" src={content.imageUrl} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Pré-visualização</h3>
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
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-primary font-bold mb-4">NOVO SISTEMA 2.0</span>
                <h1 className="text-2xl font-bold text-white leading-tight mb-3">{content.title}</h1>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">{content.subtitle}</p>
                <div className="flex flex-col gap-3">
                  <button className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25">{content.ctaText}</button>
                </div>
              </div>
              <div className="mt-2 mx-4 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/5 h-40 relative">
                <img alt="Sim" className="w-full h-full object-cover" src={content.imageUrl} />
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