import React from 'react';

export const AppTutor: React.FC = () => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">App do Tutor</h2>
          <p className="text-text-muted text-sm font-light">Gerencie a experiência móvel dos tutores e campanhas de engajamento.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-full border border-glass-border hover:bg-white/5 text-text-muted hover:text-white transition-all text-sm font-medium">
            Ver na App Store
          </button>
          <button className="px-5 py-2.5 rounded-full border border-glass-border hover:bg-white/5 text-text-muted hover:text-white transition-all text-sm font-medium">
            Ver na Google Play
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
            { label: 'Downloads Totais', value: '42.8k', change: '+12%', icon: 'cloud_download', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Usuários Ativos (MAU)', value: '18.2k', change: '+5%', icon: 'smartphone', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Avaliação Média', value: '4.8', change: '★', icon: 'star', color: 'text-amber-400', bg: 'bg-amber-500/10' }
        ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
                <div>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Push Notification Manager */}
        <div className="glass-panel rounded-4xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400"><span className="material-symbols-outlined">campaign</span></div>
                <h3 className="font-bold text-lg text-white">Push Notifications</h3>
            </div>
            
            <div className="space-y-4 mb-8">
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase ml-1 mb-2 block">Título da Mensagem</label>
                    <input type="text" className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:ring-0" placeholder="Ex: Vacina do Thor vence amanhã!" />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase ml-1 mb-2 block">Corpo da Mensagem</label>
                    <textarea rows={3} className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:ring-0 resize-none" placeholder="Digite o conteúdo da notificação..." />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                         <label className="text-xs font-bold text-text-muted uppercase ml-1 mb-2 block">Segmento</label>
                         <select className="w-full glass-input rounded-xl px-4 py-3 text-sm">
                             <option className="bg-surface-dark">Todos os Usuários</option>
                             <option className="bg-surface-dark">Inativos (30 dias)</option>
                             <option className="bg-surface-dark">Novos (7 dias)</option>
                         </select>
                    </div>
                    <div className="flex items-end">
                        <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">send</span>
                            Enviar
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <h4 className="text-sm font-bold text-white mb-4">Histórico Recente</h4>
                <div className="space-y-3">
                    {[
                        { title: 'Promoção Banho & Tosa', date: 'Hoje, 14:30', sent: '1.2k', click: '12%' },
                        { title: 'Lembrete de Agendamento', date: 'Ontem, 09:00', sent: '450', click: '28%' },
                        { title: 'Novidade no App!', date: '12 Out, 18:00', sent: '15k', click: '8%' },
                    ].map((push, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                            <div>
                                <p className="text-sm font-medium text-white">{push.title}</p>
                                <p className="text-xs text-text-muted">{push.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-text-muted">Enviados: <span className="text-white">{push.sent}</span></p>
                                <p className="text-xs text-text-muted">Taxa Cliques: <span className="text-emerald-400">{push.click}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Customization / Feature Flags */}
        <div className="glass-panel rounded-4xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><span className="material-symbols-outlined">tune</span></div>
                <h3 className="font-bold text-lg text-white">Funcionalidades do App</h3>
            </div>

            <div className="space-y-4">
                 {[
                     { name: 'Carteirinha de Vacinação Digital', desc: 'Permite upload de fotos e validação', active: true },
                     { name: 'Agendamento Online 2.0', desc: 'Nova interface de calendário', active: true },
                     { name: 'Clube de Fidelidade', desc: 'Sistema de pontos e recompensas', active: false },
                     { name: 'Telemedicina (Beta)', desc: 'Chat direto com veterinário', active: false },
                     { name: 'Marketplace de Produtos', desc: 'Integração com estoque da loja', active: true },
                 ].map((feat, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-black/20 border border-white/5 hover:border-primary/30 transition-colors">
                         <div className="flex-1">
                             <div className="flex items-center gap-2">
                                 <p className="text-sm font-bold text-white">{feat.name}</p>
                                 {!feat.active && <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold uppercase">Em Breve</span>}
                             </div>
                             <p className="text-xs text-text-muted mt-0.5">{feat.desc}</p>
                         </div>
                         <label className="switch ml-4">
                            <input type="checkbox" defaultChecked={feat.active} />
                            <span className="slider"></span>
                         </label>
                     </div>
                 ))}
            </div>

            <div className="mt-8 pt-6 border-t border-glass-border">
                <h4 className="text-sm font-bold text-white mb-4">Banners da Home</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden group cursor-pointer">
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="material-symbols-outlined text-white">edit</span>
                         </div>
                         <p className="absolute bottom-2 left-2 text-[10px] font-bold text-white">Promoção de Verão</p>
                    </div>
                    <div className="aspect-video rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                         <div className="text-center">
                             <span className="material-symbols-outlined text-text-muted mb-1">add_photo_alternate</span>
                             <p className="text-[10px] text-text-muted">Novo Banner</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};