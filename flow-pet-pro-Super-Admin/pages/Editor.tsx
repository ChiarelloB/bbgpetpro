import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const Editor: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [content, setContent] = useState<any>({
    hero: {
      title: 'Gestão Completa para seu Pet Shop',
      subtitle: 'Otimize agendamentos, fidelize clientes e gerencie seu faturamento em uma única plataforma intuitiva.',
      ctaText: 'Começar Teste Grátis',
      ctaLink: '/cadastro',
      imageUrl: 'https://picsum.photos/seed/pet/800/400'
    },
    benefits: {
      title: 'Por que escolher o Flow Pet?',
      items: [
        { title: 'Agendamento 24h', description: 'Seus clientes marcam horário até enquanto você dorme.', icon: 'schedule' },
        { title: 'Gestão Financeira', description: 'Controle fluxo de caixa, estoque e pagamentos em um só lugar.', icon: 'payments' },
        { title: 'Marketing Integrado', description: 'Envie cupons e lembretes automáticos para fidelizar seus clientes.', icon: 'campaign' }
      ]
    },
    testimonials: {
      title: 'O que dizem nossos parceiros',
      items: [
        { name: 'Ana Silva', role: 'Dona do Pet Charm', text: 'O Flow Pet mudou minha produtividade. Reduzi faltas em 40%!', avatar: 'https://i.pravatar.cc/150?u=ana' }
      ]
    },
    ctaFooter: {
      title: 'Pronto para transformar seu negócio?',
      subtitle: 'Junte-se a mais de 500 pet shops que já usam o Flow Pet.',
      buttonText: 'Criar Minha Conta Agora',
      buttonLink: '/cadastro'
    },
    style: {
      primaryColor: '#6366f1',
      darkMode: true
    },
    stats: [
      { label: 'Pet Shops Ativos', value: '30+', icon: 'storefront' },
      { label: 'Agendamentos/Mês', value: '150k+', icon: 'calendar_today' },
      { label: 'Economia Gerada', value: 'R$ 2M+', icon: 'savings' },
      { label: 'Satisfação', value: '4.9/5', icon: 'favorite' },
    ],
    pricing: [
      {
        name: 'Inicial',
        monthlyPrice: 89.90,
        description: 'Para quem está começando agora.',
        features: ['Até 50 clientes', 'Agenda básica', 'Histórico de vacinas', 'Suporte por email'],
        cta: 'Começar Agora',
        highlight: false,
        links: { monthly: '#', yearly: '#' }
      }
    ],
    roadmap: [
      { year: '2024 Q3', title: 'O Início', desc: 'Lançamento da Agenda Inteligente e Cadastro de Pets.', status: 'done' },
      { year: '2025 Q1', title: 'App do Cliente V1', desc: 'Lançamento oficial com Personalização de Marca (Cores/Logo).', status: 'current' }
    ],
    faqs: [
      { question: "Preciso instalar algum programa?", answer: "Não! O Flow Pet CRM é 100% online." }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('data')
        .eq('id', 'landing_page')
        .single();

      if (data?.data) {
        setContent((prev: any) => ({
          ...prev,
          ...data.data,
          // Deep merge for nested objects if needed
          hero: { ...prev.hero, ...data.data.hero },
          benefits: { ...prev.benefits, ...data.data.benefits },
          testimonials: { ...prev.testimonials, ...data.data.testimonials },
          style: { ...prev.style, ...data.data.style }
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          id: 'landing_page',
          data: content,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Página publicada com sucesso!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Erro ao salvar: ' + (err as any).message);
    } finally {
      setSaving(false);
    }
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
              { id: 'hero', name: 'Cabeçalho (Hero)', icon: 'edit' },
              { id: 'stats', name: 'Estatísticas', icon: 'bar_chart' },
              { id: 'benefits', name: 'Benefícios Principais', icon: 'star' },
              { id: 'pricing', name: 'Planos & Preços', icon: 'payments' },
              { id: 'roadmap', name: 'Roadmap', icon: 'map' },
              { id: 'testimonials', name: 'Depoimentos', icon: 'thumb_up' },
              { id: 'faq', name: 'Dúvidas (FAQ)', icon: 'quiz' },
              { id: 'ctaFooter', name: 'Chamada Final (CTA)', icon: 'ads_click' },
              { id: 'style', name: 'Estilo & Identidade', icon: 'palette' },
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => setActiveSection(item.id)}
                className={`glass-panel p-4 rounded-3xl transition-all cursor-pointer group ${activeSection === item.id ? 'border-primary/50 bg-primary/5' : 'hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${activeSection === item.id ? 'text-primary' : 'text-text-muted/30 group-hover:text-white'}`}>{item.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm ${activeSection === item.id ? 'font-bold text-white' : 'font-medium text-text-muted group-hover:text-white'}`}>{item.name}</p>
                    {activeSection === item.id && <p className="text-[10px] text-primary">Editando agora</p>}
                  </div>
                  <span className="material-symbols-outlined cursor-grab text-[20px] text-text-muted/30 group-hover:text-text-muted">drag_indicator</span>
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
                  {activeSection === 'stats' && (
                    <div className="space-y-6">
                      <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Estatísticas (Destaques)</label>
                      <div className="grid grid-cols-2 gap-4">
                        {content.stats?.map((stat: any, idx: number) => (
                          <div key={idx} className="glass-panel p-4 rounded-3xl border border-white/5 space-y-3 relative group">
                            <button
                              onClick={() => {
                                const newStats = [...content.stats];
                                newStats.splice(idx, 1);
                                setContent({ ...content, stats: newStats });
                              }}
                              className="absolute top-3 right-3 text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Valor</label>
                              <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                                value={stat.value}
                                onChange={(e) => {
                                  const newStats = [...content.stats];
                                  newStats[idx].value = e.target.value;
                                  setContent({ ...content, stats: newStats });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Rótulo</label>
                              <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-text-muted"
                                value={stat.label}
                                onChange={(e) => {
                                  const newStats = [...content.stats];
                                  newStats[idx].label = e.target.value;
                                  setContent({ ...content, stats: newStats });
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-sm">{stat.icon}</span>
                              <input
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-[10px] text-text-muted"
                                value={stat.icon}
                                onChange={(e) => {
                                  const newStats = [...content.stats];
                                  newStats[idx].icon = e.target.value;
                                  setContent({ ...content, stats: newStats });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setContent({ ...content, stats: [...(content.stats || []), { label: 'Nova Métrica', value: '0', icon: 'monitoring' }] })}
                        className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Adicionar Estatística
                      </button>
                    </div>
                  )}
                  {activeSection === 'hero' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Título Principal (H1)</label>
                          <input
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-text-muted/30"
                            type="text"
                            value={content.hero?.title}
                            onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Subtítulo</label>
                          <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-text-muted focus:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            rows={3}
                            value={content.hero?.subtitle}
                            onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
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
                              value={content.hero?.ctaText}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaText: e.target.value } })}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-text-muted uppercase mb-1 ml-1">Link</label>
                            <input
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-primary focus:border-primary outline-none"
                              type="text"
                              value={content.hero?.ctaLink}
                              onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaLink: e.target.value } })}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Imagem de Destaque (URL)</label>
                        <input
                          className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all mb-4"
                          type="text"
                          value={content.hero?.imageUrl}
                          onChange={(e) => setContent({ ...content, hero: { ...content.hero, imageUrl: e.target.value } })}
                        />
                        <div className="border border-white/10 rounded-3xl overflow-hidden h-32 relative">
                          <img alt="Preview" className="w-full h-full object-cover opacity-60" src={content.hero?.imageUrl} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'benefits' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Título da Seção</label>
                        <input
                          className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          type="text"
                          value={content.benefits?.title}
                          onChange={(e) => setContent({ ...content, benefits: { ...content.benefits, title: e.target.value } })}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Itens de Benefícios</label>
                        {content.benefits?.items?.map((item: any, idx: number) => (
                          <div key={idx} className="glass-panel p-4 rounded-3xl border border-white/5 space-y-3 relative group">
                            <button
                              onClick={() => {
                                const newItems = [...content.benefits.items];
                                newItems.splice(idx, 1);
                                setContent({ ...content, benefits: { ...content.benefits, items: newItems } });
                              }}
                              className="absolute top-4 right-4 text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <div className="flex gap-4">
                              <div className="w-12">
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Ícone</label>
                                <input
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-center text-primary"
                                  value={item.icon}
                                  onChange={(e) => {
                                    const newItems = [...content.benefits.items];
                                    newItems[idx].icon = e.target.value;
                                    setContent({ ...content, benefits: { ...content.benefits, items: newItems } });
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Título</label>
                                <input
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                  value={item.title}
                                  onChange={(e) => {
                                    const newItems = [...content.benefits.items];
                                    newItems[idx].title = e.target.value;
                                    setContent({ ...content, benefits: { ...content.benefits, items: newItems } });
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Descrição</label>
                              <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-text-muted focus:text-white outline-none resize-none"
                                rows={2}
                                value={item.description}
                                onChange={(e) => {
                                  const newItems = [...content.benefits.items];
                                  newItems[idx].description = e.target.value;
                                  setContent({ ...content, benefits: { ...content.benefits, items: newItems } });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newItems = [...(content.benefits.items || []), { title: 'Novo Benefício', description: 'Clique para editar a descrição.', icon: 'check_circle' }];
                            setContent({ ...content, benefits: { ...content.benefits, items: newItems } });
                          }}
                          className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          Adicionar Benefício
                        </button>
                      </div>
                    </div>
                  )}
                  {activeSection === 'pricing' && (
                    <div className="space-y-6">
                      <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Planos & Preços</label>
                      <div className="space-y-6">
                        {content.pricing?.map((plan: any, idx: number) => (
                          <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 relative group">
                            <button
                              onClick={() => {
                                const newPricing = [...content.pricing];
                                newPricing.splice(idx, 1);
                                setContent({ ...content, pricing: newPricing });
                              }}
                              className="absolute top-4 right-4 text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Nome do Plano</label>
                                <input
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                                  value={plan.name}
                                  onChange={(e) => {
                                    const newPricing = [...content.pricing];
                                    newPricing[idx].name = e.target.value;
                                    setContent({ ...content, pricing: newPricing });
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Preço Mensal (R$)</label>
                                <input
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
                                  type="number"
                                  value={plan.monthlyPrice}
                                  onChange={(e) => {
                                    const newPricing = [...content.pricing];
                                    newPricing[idx].monthlyPrice = parseFloat(e.target.value);
                                    setContent({ ...content, pricing: newPricing });
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Descrição</label>
                              <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-text-muted"
                                value={plan.description}
                                onChange={(e) => {
                                  const newPricing = [...content.pricing];
                                  newPricing[idx].description = e.target.value;
                                  setContent({ ...content, pricing: newPricing });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Vantagens (Features)</label>
                              {plan.features?.map((feature: string, fIdx: number) => (
                                <div key={fIdx} className="flex gap-2">
                                  <input
                                    className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-1 text-xs text-text-muted"
                                    value={feature}
                                    onChange={(e) => {
                                      const newPricing = [...content.pricing];
                                      newPricing[idx].features[fIdx] = e.target.value;
                                      setContent({ ...content, pricing: newPricing });
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      const newPricing = [...content.pricing];
                                      newPricing[idx].features.splice(fIdx, 1);
                                      setContent({ ...content, pricing: newPricing });
                                    }}
                                    className="text-text-muted hover:text-rose-400"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newPricing = [...content.pricing];
                                  newPricing[idx].features.push('Nova vantagem');
                                  setContent({ ...content, pricing: newPricing });
                                }}
                                className="text-[10px] font-bold text-primary hover:underline"
                              >
                                + Adicionar Vantagem
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setContent({ ...content, pricing: [...(content.pricing || []), { name: 'Novo Plano', monthlyPrice: 0, description: 'Descrição do plano', features: [], cta: 'Assinar Now', highlight: false, links: { monthly: '#', yearly: '#' } }] })}
                        className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Adicionar Plano
                      </button>
                    </div>
                  )}

                  {activeSection === 'roadmap' && (
                    <div className="space-y-6">
                      <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Roadmap de Evolução</label>
                      <div className="space-y-4">
                        {content.roadmap?.map((item: any, idx: number) => (
                          <div key={idx} className="glass-panel p-4 rounded-3xl border border-white/5 space-y-3 relative group">
                            <button
                              onClick={() => {
                                const newRoadmap = [...content.roadmap];
                                newRoadmap.splice(idx, 1);
                                setContent({ ...content, roadmap: newRoadmap });
                              }}
                              className="absolute top-4 right-4 text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Período (Ex: 2025 Q1)</label>
                                <input
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                                  value={item.year}
                                  onChange={(e) => {
                                    const newRoadmap = [...content.roadmap];
                                    newRoadmap[idx].year = e.target.value;
                                    setContent({ ...content, roadmap: newRoadmap });
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Status</label>
                                <select
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                  value={item.status}
                                  onChange={(e) => {
                                    const newRoadmap = [...content.roadmap];
                                    newRoadmap[idx].status = e.target.value;
                                    setContent({ ...content, roadmap: newRoadmap });
                                  }}
                                >
                                  <option value="done">Concluído</option>
                                  <option value="current">Em andamento</option>
                                  <option value="future">Futuro</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Milestone (Título)</label>
                              <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                                value={item.title}
                                onChange={(e) => {
                                  const newRoadmap = [...content.roadmap];
                                  newRoadmap[idx].title = e.target.value;
                                  setContent({ ...content, roadmap: newRoadmap });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Descrição</label>
                              <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-text-muted focus:text-white outline-none resize-none"
                                rows={2}
                                value={item.desc}
                                onChange={(e) => {
                                  const newRoadmap = [...content.roadmap];
                                  newRoadmap[idx].desc = e.target.value;
                                  setContent({ ...content, roadmap: newRoadmap });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setContent({ ...content, roadmap: [...(content.roadmap || []), { year: '2025 QX', title: 'Nova Funcionalidade', desc: 'Descrição breve.', status: 'future' }] })}
                        className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Adicionar Milestone
                      </button>
                    </div>
                  )}

                  {activeSection === 'faq' && (
                    <div className="space-y-6">
                      <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Dúvidas Frequentes (FAQ)</label>
                      <div className="space-y-4">
                        {content.faqs?.map((faq: any, idx: number) => (
                          <div key={idx} className="glass-panel p-4 rounded-3xl border border-white/5 space-y-3 relative group">
                            <button
                              onClick={() => {
                                const newFaqs = [...content.faqs];
                                newFaqs.splice(idx, 1);
                                setContent({ ...content, faqs: newFaqs });
                              }}
                              className="absolute top-4 right-4 text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Pergunta</label>
                              <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                                value={faq.question}
                                onChange={(e) => {
                                  const newFaqs = [...content.faqs];
                                  newFaqs[idx].question = e.target.value;
                                  setContent({ ...content, faqs: newFaqs });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Resposta</label>
                              <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-text-muted focus:text-white outline-none resize-none"
                                rows={2}
                                value={faq.answer}
                                onChange={(e) => {
                                  const newFaqs = [...content.faqs];
                                  newFaqs[idx].answer = e.target.value;
                                  setContent({ ...content, faqs: newFaqs });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setContent({ ...content, faqs: [...(content.faqs || []), { question: 'Nova Pergunta?', answer: 'Sua resposta aqui.' }] })}
                        className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Adicionar Pergunta
                      </button>
                    </div>
                  )}
                  {activeSection === 'testimonials' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Título da Seção</label>
                        <input
                          className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          type="text"
                          value={content.testimonials?.title}
                          onChange={(e) => setContent({ ...content, testimonials: { ...content.testimonials, title: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-4">
                        {content.testimonials?.items?.map((item: any, idx: number) => (
                          <div key={idx} className="glass-panel p-4 rounded-3xl border border-white/5 space-y-4 relative group">
                            <button
                              onClick={() => {
                                const newItems = [...content.testimonials.items];
                                newItems.splice(idx, 1);
                                setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                              }}
                              className="absolute top-4 right-4 text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <div className="flex gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 overflow-hidden shrink-0">
                                <img src={item.avatar} className="w-full h-full object-cover opacity-80" alt="Avatar" />
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Nome</label>
                                  <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                                    value={item.name}
                                    onChange={(e) => {
                                      const newItems = [...content.testimonials.items];
                                      newItems[idx].name = e.target.value;
                                      setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Cargo/Empresa</label>
                                  <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                                    value={item.role}
                                    onChange={(e) => {
                                      const newItems = [...content.testimonials.items];
                                      newItems[idx].role = e.target.value;
                                      setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">URL da Foto</label>
                              <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-primary"
                                value={item.avatar}
                                onChange={(e) => {
                                  const newItems = [...content.testimonials.items];
                                  newItems[idx].avatar = e.target.value;
                                  setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Depoimento</label>
                              <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-text-muted focus:text-white outline-none resize-none"
                                rows={3}
                                value={item.text}
                                onChange={(e) => {
                                  const newItems = [...content.testimonials.items];
                                  newItems[idx].text = e.target.value;
                                  setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newItems = [...(content.testimonials?.items || []), { name: 'Novo Cliente', role: 'Dono de Pet Shop', text: 'Depoimento incrível aqui.', avatar: 'https://i.pravatar.cc/150?u=new' }];
                            setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                          }}
                          className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          Adicionar Depoimento
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSection === 'ctaFooter' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Título de Conversão</label>
                          <input
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            type="text"
                            value={content.ctaFooter?.title}
                            onChange={(e) => setContent({ ...content, ctaFooter: { ...content.ctaFooter, title: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Subtítulo</label>
                          <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-text-muted focus:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            rows={3}
                            value={content.ctaFooter?.subtitle}
                            onChange={(e) => setContent({ ...content, ctaFooter: { ...content.ctaFooter, subtitle: e.target.value } })}
                          ></textarea>
                        </div>
                      </div>
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                        <label className="block text-xs font-bold text-white mb-2 ml-1 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">ads_click</span>
                          Configuração do Botão
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Texto</label>
                            <input
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                              value={content.ctaFooter?.buttonText}
                              onChange={(e) => setContent({ ...content, ctaFooter: { ...content.ctaFooter, buttonText: e.target.value } })}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Link</label>
                            <input
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
                              value={content.ctaFooter?.buttonLink}
                              onChange={(e) => setContent({ ...content, ctaFooter: { ...content.ctaFooter, buttonLink: e.target.value } })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'style' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-4 ml-1">Cor Primária (Brand)</label>
                        <div className="flex gap-4">
                          <input
                            type="color"
                            className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                            value={content.style?.primaryColor}
                            onChange={(e) => setContent({ ...content, style: { ...content.style, primaryColor: e.target.value } })}
                          />
                          <input
                            type="text"
                            className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white uppercase font-mono text-sm"
                            value={content.style?.primaryColor}
                            onChange={(e) => setContent({ ...content, style: { ...content.style, primaryColor: e.target.value } })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5">
                        <span className="text-sm font-bold text-white">Modo Escuro por Padrão</span>
                        <button
                          onClick={() => setContent({ ...content, style: { ...content.style, darkMode: !content.style.darkMode } })}
                          className={`w-12 h-6 rounded-full relative transition-colors ${content.style?.darkMode ? 'bg-primary' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${content.style?.darkMode ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>
                  )}
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
            <div className={`flex-1 overflow-y-auto mt-8 relative no-scrollbar transition-colors duration-500 ${content.style?.darkMode ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white' : 'bg-white text-slate-900'}`}>
              <div className={`flex items-center justify-between p-4 sticky top-0 backdrop-blur-md z-10 transition-colors ${content.style?.darkMode ? 'bg-slate-900/80' : 'bg-white/80 border-b border-black/5'}`}>
                <span className={`font-bold text-sm ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>Flow Pet</span>
                <span className={`material-symbols-outlined text-[20px] ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>menu</span>
              </div>
              <div className="px-5 py-8 text-center relative">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold mb-4 uppercase tracking-widest">Novo Sistema 2.0</span>
                <h1 className="text-2xl font-bold leading-tight mb-3" style={{ color: content.style?.primaryColor || (content.style?.darkMode ? 'white' : '#111827') }}>
                  {content.hero?.title}
                </h1>
                <p className={`text-xs mb-6 leading-relaxed ${content.style?.darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{content.hero?.subtitle}</p>
                <div className="flex flex-col gap-3">
                  <button className="w-full py-3 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25" style={{ backgroundColor: content.style?.primaryColor }}>{content.hero?.ctaText}</button>
                </div>
              </div>
              <div className="mt-2 mx-4 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/5 h-40 relative">
                <img alt="Sim" className="w-full h-full object-cover" src={content.hero?.imageUrl} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
              </div>

              {/* Stats Section Preview */}
              <div className="px-5 py-6 grid grid-cols-2 gap-3">
                {content.stats?.map((stat: any, i: number) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-colors text-center ${content.style?.darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="material-symbols-outlined text-primary text-xl mb-1" style={{ color: content.style?.primaryColor }}>{stat.icon}</span>
                    <p className={`text-sm font-bold ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                    <p className={`text-[8px] uppercase tracking-tighter ${content.style?.darkMode ? 'text-text-muted' : 'text-slate-500'}`}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Mockup Benefits Section */}
              <div className={`px-5 py-8 mt-4 transition-colors ${content.style?.darkMode ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                <h3 className={`text-center font-bold text-lg mb-6 ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{content.benefits?.title}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {content.benefits?.items?.map((item: any, i: number) => (
                    <div key={i} className={`flex gap-4 p-4 rounded-2xl border transition-colors ${content.style?.darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-primary" style={{ color: content.style?.primaryColor }}>{item.icon}</span>
                      <div>
                        <h4 className={`font-bold text-xs ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                        <p className={`text-[10px] mt-1 leading-relaxed ${content.style?.darkMode ? 'text-text-muted' : 'text-slate-500'}`}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap Section Preview */}
              <div className="px-5 py-8">
                <h3 className={`text-center font-bold text-lg mb-6 ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{content.roadmap?.title || 'Roadmap'}</h3>
                <div className="space-y-4">
                  {content.roadmap?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== content.roadmap.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-primary/20"></div>
                      )}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${item.status === 'done' ? 'bg-emerald-500' : item.status === 'current' ? 'bg-primary animate-pulse' : 'bg-white/10'}`}>
                        <span className="material-symbols-outlined text-[14px] text-white">
                          {item.status === 'done' ? 'check' : item.status === 'current' ? 'play_arrow' : 'schedule'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.year}</span>
                        <h4 className={`text-xs font-bold ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                        <p className={`text-[10px] leading-relaxed ${content.style?.darkMode ? 'text-text-muted' : 'text-slate-500'}`}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Section Preview */}
              <div className={`px-5 py-8 transition-colors ${content.style?.darkMode ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                <h3 className={`text-center font-bold text-lg mb-6 ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>Planos</h3>
                <div className="space-y-6">
                  {content.pricing?.map((plan: any, i: number) => (
                    <div key={i} className={`p-6 rounded-3xl border transition-colors relative overflow-hidden ${plan.highlight ? 'border-primary shadow-xl shadow-primary/10' : (content.style?.darkMode ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200')}`}>
                      {plan.highlight && (
                        <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Popular</div>
                      )}
                      <h4 className={`text-sm font-bold mb-1 ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>
                      <p className={`text-[10px] mb-4 ${content.style?.darkMode ? 'text-text-muted' : 'text-slate-500'}`}>{plan.description}</p>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className={`text-lg font-bold ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>R$ {plan.monthlyPrice}</span>
                        <span className="text-[10px] text-text-muted">/mês</span>
                      </div>
                      <div className="space-y-3 mb-6">
                        {plan.features?.map((f: string, fi: number) => (
                          <div key={fi} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                            <span className={`text-[10px] ${content.style?.darkMode ? 'text-gray-300' : 'text-slate-600'}`}>{f}</span>
                          </div>
                        ))}
                      </div>
                      <button className={`w-full py-3 rounded-xl text-[10px] font-bold transition-all ${plan.highlight ? 'bg-primary text-white shadow-lg shadow-primary/20' : (content.style?.darkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')}`} style={plan.highlight ? { backgroundColor: content.style?.primaryColor } : {}}>
                        {plan.cta}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup Testimonials */}
              <div className="px-5 py-8">
                <h3 className={`text-center font-bold text-lg mb-6 ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{content.testimonials?.title}</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {content.testimonials?.items?.map((item: any, i: number) => (
                    <div key={i} className={`min-w-[240px] p-4 rounded-3xl border transition-colors ${content.style?.darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <p className={`text-[10px] italic mb-4 ${content.style?.darkMode ? 'text-text-muted' : 'text-slate-600'}`}>"{item.text}"</p>
                      <div className="flex items-center gap-3">
                        <img src={item.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="Reviewer" />
                        <div>
                          <p className={`text-[10px] font-bold ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                          <p className={`text-[8px] ${content.style?.darkMode ? 'text-text-muted' : 'text-slate-500'}`}>{item.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section Preview */}
              <div className="px-5 py-8">
                <h3 className={`text-center font-bold text-lg mb-6 ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>Dúvidas</h3>
                <div className="space-y-3">
                  {content.faqs?.map((faq: any, i: number) => (
                    <div key={i} className={`p-4 rounded-2xl border transition-colors ${content.style?.darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
                      <h4 className={`text-xs font-bold mb-2 ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{faq.question}</h4>
                      <p className={`text-[10px] leading-relaxed ${content.style?.darkMode ? 'text-text-muted' : 'text-slate-500'}`}>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup Footer CTA */}
              <div className={`px-5 py-10 text-center transition-colors ${content.style?.darkMode ? 'bg-gradient-to-t from-primary/20 to-transparent' : 'bg-slate-50'}`}>
                <h3 className={`font-bold text-xl mb-2 ${content.style?.darkMode ? 'text-white' : 'text-slate-900'}`}>{content.ctaFooter?.title}</h3>
                <p className={`text-xs mb-6 px-4 ${content.style?.darkMode ? 'text-text-muted' : 'text-slate-500'}`}>{content.ctaFooter?.subtitle}</p>
                <button
                  className="w-full py-4 text-white rounded-2xl text-sm font-bold shadow-xl shadow-primary/30"
                  style={{ backgroundColor: content.style?.primaryColor }}
                >
                  {content.ctaFooter?.buttonText}
                </button>
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