import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const AppTutor: React.FC = () => {
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ title: '', message: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadFeatures();
    }, []);

    const loadFeatures = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('system_settings')
            .select('data')
            .eq('id', 'app_features')
            .single();

        if (data?.data) {
            setFeatures(data.data);
        } else {
            // Default features if none found
            setFeatures([
                { name: 'Carteirinha de Vacinação Digital', desc: 'Permite upload de fotos e validação', active: true },
                { name: 'Agendamento Online 2.0', desc: 'Nova interface de calendário', active: true },
                { name: 'Clube de Fidelidade', desc: 'Sistema de pontos e recompensas', active: false },
                { name: 'Telemedicina (Beta)', desc: 'Chat direto com veterinário', active: false },
                { name: 'Marketplace de Produtos', desc: 'Integração com estoque da loja', active: true },
            ]);
        }
        setLoading(false);
    };

    const toggleFeature = async (index: number) => {
        const updated = [...features];
        updated[index].active = !updated[index].active;
        setFeatures(updated);

        await supabase
            .from('system_settings')
            .upsert({ id: 'app_features', data: updated, updated_at: new Date().toISOString() });
    };

    const sendNotification = async () => {
        if (!notification.title || !notification.message) return;
        setSending(true);

        // Get all users to send to (or mock a segment)
        const { data: users } = await supabase.from('profiles').select('id').limit(10); // Limit for demo

        if (users) {
            const notifications = users.map(u => ({
                user_id: u.id,
                title: notification.title,
                message: notification.message,
                type: 'push',
                is_read: false
            }));

            const { error } = await supabase.from('notifications').insert(notifications);
            if (!error) {
                alert('Notificação enviada com sucesso para os usuários selecionados!');
                setNotification({ title: '', message: '' });
            } else {
                alert('Erro ao enviar: ' + error.message);
            }
        }
        setSending(false);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">App do Tutor</h2>
                    <p className="text-text-muted text-sm font-light">Gerencie a experiência móvel dos tutores e campanhas de engajamento.</p>
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

                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase ml-1 mb-2 block">Título da Mensagem</label>
                            <input
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary outline-none"
                                placeholder="Ex: Vacina do Thor vence amanhã!"
                                value={notification.title}
                                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase ml-1 mb-2 block">Corpo da Mensagem</label>
                            <textarea
                                rows={3}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-primary outline-none resize-none"
                                placeholder="Digite o conteúdo da notificação..."
                                value={notification.message}
                                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={sendNotification}
                                disabled={sending}
                                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">{sending ? 'sync' : 'send'}</span>
                                {sending ? 'Enviando...' : 'Enviar Agora'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customization / Feature Flags */}
                <div className="glass-panel rounded-4xl p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><span className="material-symbols-outlined">tune</span></div>
                        <h3 className="font-bold text-lg text-white">Funcionalidades do App</h3>
                    </div>

                    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                        {loading ? (
                            <div className="py-10 text-center text-text-muted uppercase text-xs font-bold">Carregando...</div>
                        ) : features.map((feat, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-black/20 border border-white/5 hover:border-primary/30 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-white">{feat.name}</p>
                                        {!feat.active && <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold uppercase">Inativo</span>}
                                    </div>
                                    <p className="text-xs text-text-muted mt-0.5">{feat.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggleFeature(i)}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${feat.active ? 'bg-primary' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${feat.active ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Banners da Home */}
            <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Banners da Home</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[16/9] rounded-2xl bg-black/40 border border-white/5 overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-all">
                            <img alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" src={`https://picsum.photos/seed/pet${i}/400/225`} />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </span>
                            </div>
                        </div>
                    ))}
                    <button className="aspect-[16/9] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-text-muted hover:text-white hover:border-primary/50 transition-all">
                        <span className="material-symbols-outlined mb-1">add</span>
                        <span className="text-[10px] uppercase font-bold">Novo</span>
                    </button>
                </div>
            </div>
        </div>
    );
};