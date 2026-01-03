import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../NotificationContext';
import { useSecurity } from '../SecurityContext';

import { getGeminiModel } from '../src/lib/gemini';
import { supabase } from '../src/lib/supabase';

// --- Interfaces ---
interface Chat {
    id: string;
    name: string;
    petName?: string;
    role?: string;
    lastMsg: string;
    time: string;
    unread: number;
    active: boolean;
    status?: 'online' | 'busy' | 'offline';
    img: string;
    type: 'client' | 'team';
    department?: string;
}

interface Message {
    id: string;
    chatId: string;
    sender: string;
    text: string;
    time: string;
    isMe: boolean;
    type?: 'text' | 'file' | 'task';
    meta?: any;
}

interface Campaign {
    id: string;
    title: string;
    type: string;
    status: string;
    sent: number;
    openRate: string;
    date: string;
}

interface Suggestion {
    id: string;
    created_at: string;
    user_name: string;
    title: string;
    content: string;
    status: 'pending' | 'approved' | 'dismissed' | 'implemented';
    admin_notes?: string;
}

const CreateCampaignModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (camp: any) => void }> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [audience, setAudience] = useState('Todos os Clientes');
    const [channel, setChannel] = useState('WhatsApp');
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleAIWrite = async () => {
        setIsGenerating(true);
        try {
            const model = getGeminiModel();
            const prompt = `
                Escreva uma mensagem curta de marketing para um Pet Shop.
                Canal: ${channel} (se WhatsApp, use emojis. se SMS, seja muito breve).
                Público Alvo: ${audience}.
                Objetivo da Campanha: ${title}.
                Tom de voz: Amigável e convidativo.
                Inclua um Call to Action claro.
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            if (response.text()) {
                setContent(response.text().trim());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, audience, channel, content });
        onClose();
        setTitle('');
        setAudience('Todos os Clientes');
        setContent('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg relative z-10 p-6 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Nova Campanha</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1 tracking-wider">Nome da Campanha</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Promoção de Natal" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1 tracking-wider">Canal</label>
                            <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm focus:ring-1 focus:ring-primary outline-none">
                                <option>WhatsApp</option>
                                <option>Email</option>
                                <option>SMS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1 tracking-wider">Público Alvo</label>
                            <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm focus:ring-1 focus:ring-primary outline-none">
                                <option>Todos os Clientes</option>
                                <option>Clientes VIP</option>
                                <option>Inativos (30+ dias)</option>
                                <option>Aniversariantes do Mês</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Conteúdo da Mensagem</label>
                            <button type="button" onClick={handleAIWrite} disabled={!title || isGenerating} className="text-[10px] font-black uppercase text-primary flex items-center gap-1 hover:underline disabled:opacity-50 tracking-tight">
                                {isGenerating ? <span className="animate-spin material-symbols-outlined text-xs">sync</span> : <span className="material-symbols-outlined text-xs">auto_awesome</span>}
                                Gerar Sugestão IA
                            </button>
                        </div>
                        <textarea required rows={5} value={content} onChange={e => setContent(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm resize-none focus:ring-1 focus:ring-primary outline-none" placeholder="Digite sua mensagem..."></textarea>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <span className="material-symbols-outlined text-lg">send</span> Agendar Campanha
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const NewChatModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (contact: any) => void; type: 'client' | 'team' }> = ({ isOpen, onClose, onSelect, type }) => {
    const [search, setSearch] = useState('');
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchPotentialContacts = async () => {
                setLoading(true);
                if (type === 'team') {
                    const { data } = await supabase.from('profiles').select('id, full_name, role, avatar_url').limit(20);
                    setContacts(data?.map(p => ({
                        id: p.id,
                        name: p.full_name,
                        role: p.role,
                        image_url: p.avatar_url
                    })) || []);
                } else {
                    const { data } = await supabase.from('clients').select('id, name, pet_name, image_url').limit(20);
                    setContacts(data || []);
                }
                setLoading(false);
            };
            fetchPotentialContacts();
        }
    }, [isOpen, type]);

    if (!isOpen) return null;

    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.pet_name && c.pet_name.toLowerCase().includes(search.toLowerCase())));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-0 overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-gray-800">
                <div className="p-4 border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222]">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 uppercase italic text-xs tracking-wider">Nova Conversa</h3>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Buscar cliente ou colaborador..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm focus:ring-1 focus:ring-primary outline-none dark:text-white"
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
                    ) : (
                        filteredContacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => onSelect(contact)}
                                className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-slate-50 dark:border-gray-800 last:border-0"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center text-slate-500 font-bold text-xs uppercase overflow-hidden border border-slate-100 dark:border-gray-700">
                                    {contact.image_url ? <img src={contact.image_url} className="w-full h-full object-cover" alt="" /> : contact.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{contact.name}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">
                                        {type === 'team' ? (contact.role || 'Membro') : (`Pet: ${contact.pet_name || 'N/A'}`)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export const Communication: React.FC<{ initialType?: 'client' | 'team'; initialContact?: any; userProfile?: any }> = ({ initialType = 'client', initialContact = null, userProfile }) => {
    const [viewMode, setViewMode] = useState<'messages' | 'campaigns' | 'suggestions'>('messages');
    const [chatType, setChatType] = useState<'client' | 'team'>(initialType);
    const [chats, setChats] = useState<Chat[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState('Todas');
    const [chatSearch, setChatSearch] = useState('');
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { showNotification } = useNotification();
    const { user, tenant } = useSecurity();


    // Unified initialization logic
    useEffect(() => {
        const init = async () => {
            if (initialContact) {
                setChatType(initialType as 'client' | 'team');
                // Ensure chats are fetched for the correct type before opening new one
                const chats = await fetchChats(initialType as 'client' | 'team');
                await handleNewChat(initialContact, initialType as 'client' | 'team', chats);
            } else {
                fetchChats();
            }
        };
        init();
    }, [initialContact, initialType]);

    useEffect(() => {
        if (!initialContact) {
            fetchChats();
        }
    }, [chatType]);

    const fetchMessages = async (chatId: string) => {
        setLoadingMessages(true);
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
        } else {
            console.log('Fetched messages:', data); // Debug log
            setMessages(data.map(m => ({
                id: m.id,
                chatId: m.chat_id,
                sender: m.sender_id || 'Sistema',
                text: m.text || '',
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: (user?.id && (m.sender_id === user.id || m.sender_profile_id === user.id)) || (!m.sender_id && !m.sender_profile_id),
                type: m.type || 'text',
                meta: m.meta,
                senderProfileId: m.sender_profile_id
            })));

        }
        setLoadingMessages(false);
    };

    const fetchCampaigns = async () => {
        const { data, error } = await supabase
            .from('marketing_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setCampaigns(data.map(c => ({
                id: c.id,
                title: c.title,
                type: c.channel,
                status: c.status,
                sent: c.sent_count,
                openRate: c.open_rate ? `${c.open_rate}%` : '-',
                date: new Date(c.created_at).toLocaleDateString()
            })));
        }
    };

    const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        const { data, error } = await supabase
            .from('user_suggestions')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setSuggestions(data as Suggestion[]);
        }
        setLoadingSuggestions(false);
    };

    const handleUpdateSuggestionStatus = async (id: string, status: Suggestion['status']) => {
        const { error } = await supabase
            .from('user_suggestions')
            .update({ status })
            .eq('id', id);

        if (error) {
            showNotification('Erro ao atualizar status', 'error');
        } else {
            setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
            showNotification('Status atualizado!', 'success');
        }
    };

    const fetchChats = async (overrideType?: 'client' | 'team') => {
        const targetType = overrideType || chatType;
        setLoadingChats(true);
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('type', targetType)
            .order('updated_at', { ascending: false });

        let mappedChats: Chat[] = [];
        if (error) {
            console.error('Error fetching chats:', error);
        } else {
            mappedChats = data.map(c => ({
                id: c.id,
                name: c.name,
                petName: c.pet_name || '',
                role: c.role || '',
                lastMsg: c.last_msg || 'Sem mensagens',
                time: new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: c.unread_count || 0,
                active: true,
                status: c.status || 'offline',
                img: c.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
                type: c.type,
                department: c.department || ''
            }));
            setChats(mappedChats);

            // Special selection logic:
            // 1. If we have an initialContact, don't auto-select the first one unless it matches
            // 2. If no initialContact and no selectedChat, pick the first
            if (mappedChats.length > 0) {
                if (!initialContact && !selectedChat) {
                    setSelectedChat(mappedChats[0]);
                }
            }
        }
        setLoadingChats(false);
        return mappedChats;
    };

    useEffect(() => {
        if (viewMode === 'campaigns') fetchCampaigns();
    }, [viewMode]); // Added viewMode to dependencies

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);

            // Subscribe to real-time messages
            const channel = supabase
                .channel(`chat-${selectedChat.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `chat_id=eq.${selectedChat.id}`
                }, async (payload) => {
                    const newMessage = payload.new;

                    // Fetch sender profile if not current user
                    let senderName = newMessage.sender;
                    let senderImg = null;

                    if (newMessage.sender_profile_id) {
                        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', newMessage.sender_profile_id).single();
                        if (profile) {
                            senderName = profile.full_name;
                            senderImg = profile.avatar_url;
                        }
                    }

                    setMessages(prev => [...prev, {
                        id: newMessage.id,
                        chatId: newMessage.chat_id,
                        sender: senderName || newMessage.sender_id,
                        text: newMessage.text || '',
                        time: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: (user?.id && (newMessage.sender_id === user.id || newMessage.sender_profile_id === user.id)) || (!newMessage.sender_id && !newMessage.sender_profile_id),
                        type: newMessage.type || 'text',
                        meta: newMessage.meta,
                        senderImg: senderImg
                    }]);
                    scrollToBottom();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedChat, user]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputText.trim() === '' || !selectedChat) return;

        const messageText = inputText;
        setInputText(''); // Clear input immediately for better UX

        try {
            const { data, error } = await supabase.from('chat_messages').insert([{
                chat_id: selectedChat.id,
                text: messageText,
                type: 'text',
                sender_id: user?.id, // Use authentication ID
                sender_profile_id: user?.id,
                tenant_id: tenant?.id
            }]).select();


            if (error) {
                console.error('Error sending message:', error);
                showNotification(`Erro ao enviar: ${error.message}`, 'error');
                setInputText(messageText); // Restore input on error
            } else if (data && data[0]) {
                console.log('Message sent successfully:', data);

                // Add message to state immediately
                const newMsg = data[0];
                setMessages(prev => [...prev, {
                    id: newMsg.id,
                    chatId: newMsg.chat_id,
                    sender: 'Eu',
                    text: newMsg.text || messageText,
                    time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    type: newMsg.type || 'text',
                    meta: newMsg.meta
                }]);

                // Update last_msg in the chat table
                await supabase.from('chats').update({ last_msg: messageText, updated_at: new Date().toISOString() }).eq('id', selectedChat.id);

                scrollToBottom();
            }
        } catch (err: any) {
            console.error('Unexpected error sending message:', err);
            showNotification(`Erro inesperado: ${err.message}`, 'error');
            setInputText(messageText); // Restore input on error
        }
    };

    const handleGenerateReply = async () => {
        if (isGenerating || !selectedChat) return;
        setIsGenerating(true);
        try {
            const model = getGeminiModel();
            const history = messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
            const prompt = `Gere uma resposta curta (máximo 2 frases) para este chat: \n${history}`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) setInputText(text.trim());
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNewChat = async (contact: any, overrideType?: 'client' | 'team', existingChats?: Chat[]) => {
        const targetType = overrideType || chatType;
        const currentChats = existingChats || chats;

        // Check if chat is already in current local list
        const internalExisting = currentChats.find(c => c.name === contact.name && c.type === targetType);

        if (internalExisting) {
            setSelectedChat(internalExisting);
        } else {
            // Check DB
            const { data: existing } = await supabase.from('chats')
                .select('*')
                .eq('name', contact.name)
                .eq('type', targetType)
                .maybeSingle();

            if (existing) {
                const mapped = {
                    id: existing.id,
                    name: existing.name,
                    petName: existing.pet_name || '',
                    role: existing.role || '',
                    lastMsg: existing.last_msg || '',
                    time: '',
                    unread: 0,
                    active: true,
                    img: existing.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(existing.name)}`,
                    type: existing.type as 'client' | 'team',
                    status: existing.status || 'offline'
                };
                setSelectedChat(mapped);
                setChats(prev => [mapped, ...prev]);
            } else {
                const { data: newChat, error } = await supabase.from('chats').insert([{
                    name: contact.name,
                    type: targetType,
                    img: contact.image_url || null,
                    last_msg: '',
                    tenant_id: tenant?.id
                }]).select().single();

                if (!error && newChat) {
                    fetchChats(targetType);
                    const mapped = {
                        id: newChat.id,
                        name: newChat.name,
                        petName: '',
                        role: '',
                        lastMsg: '',
                        time: '',
                        unread: 0,
                        active: true,
                        img: newChat.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(newChat.name)}`,
                        type: newChat.type as 'client' | 'team',
                        status: 'offline'
                    };
                    setSelectedChat(mapped);
                }
            }
        }
        setIsNewChatOpen(false);
    };

    const handleCreateCampaign = async (campData: any) => {
        const { error } = await supabase.from('marketing_campaigns').insert([{
            title: campData.title,
            channel: campData.channel,
            audience: campData.audience,
            content: campData.content,
            status: 'Scheduled',
            tenant_id: tenant?.id
        }]);

        if (error) {
            showNotification('Erro ao agendar campanha', 'error');
        } else {
            fetchCampaigns();
            showNotification(`Campanha "${campData.title}" agendada!`, 'success');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredChats = chats.filter(chat => {
        const matchesTab = activeTab === 'Todas' ? true : chat.unread > 0;
        const matchesSearch = chat.name.toLowerCase().includes(chatSearch.toLowerCase()) || (chat.petName && chat.petName.toLowerCase().includes(chatSearch.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const renderMessageContent = (msg: Message) => {
        if (msg.type === 'file' && msg.meta) {
            return (
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-gray-800">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                        <span className="material-symbols-outlined text-2xl">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{msg.meta.name}</p>
                        <p className="text-[10px] text-slate-500">{msg.meta.size}</p>
                    </div>
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">download</span></button>
                </div>
            );
        }
        if (msg.type === 'task' && msg.meta) {
            return (
                <div className="bg-white dark:bg-[#222] border-l-4 border-yellow-500 rounded-r-lg p-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-yellow-600 mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">assignment</span> Tarefa
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{msg.meta.title}</p>
                    <span className="text-xs text-slate-500">{msg.text}</span>
                </div>
            );
        }
        return <p className="text-sm leading-relaxed">{msg.text}</p>;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#111] overflow-hidden animate-in fade-in duration-500">
            <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} onSelect={handleNewChat} type={chatType} />
            <CreateCampaignModal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} onSave={handleCreateCampaign} />

            <div className="flex items-center gap-8 px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shrink-0">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Mensageira</h1>
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setViewMode('messages')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'messages' ? 'bg-white dark:bg-[#333] text-primary shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'}`}>Chat</button>
                    <button onClick={() => setViewMode('campaigns')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'campaigns' ? 'bg-white dark:bg-[#333] text-primary shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'}`}>Marketing</button>
                    {userProfile?.role === 'Administrador' && (
                        <button onClick={() => { setViewMode('suggestions'); fetchSuggestions(); }} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'suggestions' ? 'bg-white dark:bg-[#333] text-primary shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'}`}>Sugestões</button>
                    )}
                </div>
            </div>

            {viewMode === 'messages' ? (
                <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                    <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-[#1a1a1a] border-r border-slate-200 dark:border-gray-800 h-[400px] md:h-auto shrink-0">
                        <div className="p-6 pb-2">
                            <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-50 dark:bg-[#222] p-1 rounded-xl">
                                <button onClick={() => setChatType('client')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${chatType === 'client' ? 'bg-white dark:bg-[#333] shadow-sm text-primary' : 'text-slate-500 dark:text-gray-400'}`}>Clientes</button>
                                <button onClick={() => setChatType('team')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${chatType === 'team' ? 'bg-white dark:bg-[#333] shadow-sm text-indigo-500' : 'text-slate-500 dark:text-gray-400'}`}>Equipe</button>
                            </div>
                            <div className="relative mb-6">
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                                <input type="text" value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Buscar conversa..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-white" />
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-4 border-b border-slate-200 dark:border-gray-800 flex-1">
                                    {['Todas', 'Não Lidas'].map((tab) => (
                                        <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 border-b-2 font-black text-[10px] uppercase tracking-widest flex-1 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setIsNewChatOpen(true)} className="ml-4 w-9 h-9 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 transition-transform shrink-0"><span className="material-symbols-outlined text-lg font-black">add</span></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loadingChats ? (
                                <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
                            ) : (
                                filteredChats.map(chat => (
                                    <div key={chat.id} onClick={() => setSelectedChat(chat)} className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-l-4 transition-all ${selectedChat?.id === chat.id ? 'border-primary bg-slate-50 dark:bg-white/5' : 'border-transparent'}`}>
                                        <div className="relative shrink-0">
                                            <img src={chat.img} alt={chat.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-gray-700" />
                                            {chat.type === 'team' && <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-[#1a1a1a] rounded-full ${chat.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`}></span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 className="font-bold text-sm truncate text-slate-900 dark:text-white">{chat.name}</h3>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{chat.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate leading-tight mb-1">{chat.lastMsg}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-slate-500 tracking-tighter">
                                                    {chat.petName ? `Pet: ${chat.petName}` : chat.role || 'Chat'}
                                                </span>
                                                {chat.unread > 0 && <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">{chat.unread}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[#0d0d0d] overflow-hidden">
                        {selectedChat ? (
                            <>
                                <div className="h-20 bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <img src={selectedChat.img} className="w-10 h-10 rounded-full object-cover" alt="" />
                                        <div>
                                            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2 italic">
                                                {selectedChat.name}
                                                {selectedChat.role && <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded uppercase font-black">{selectedChat.role}</span>}
                                            </h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedChat.status === 'online' ? 'Online' : 'Visto recentemente'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><span className="material-symbols-outlined text-[20px]">call</span></button>
                                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><span className="material-symbols-outlined text-[20px]">videocam</span></button>
                                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                    {loadingMessages ? (
                                        <div className="h-full flex items-center justify-center flex-col text-slate-400">
                                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Carregando histórico...</span>
                                        </div>
                                    ) : messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} items-end gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                                            {!msg.isMe && (
                                                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-100 dark:border-gray-800">
                                                    <img src={msg.senderImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender)}`} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${msg.isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-gray-200 rounded-bl-none border border-slate-100 dark:border-gray-800'}`}>
                                                {!msg.isMe && <p className="text-[10px] font-black uppercase text-primary mb-1 tracking-tighter">{msg.sender}</p>}
                                                {renderMessageContent(msg)}
                                                <div className={`text-[10px] font-black mt-1 flex items-center justify-end gap-1 ${msg.isMe ? 'text-primary-foreground/60' : 'text-slate-400'}`}>
                                                    {msg.time}
                                                    {msg.isMe && <span className="material-symbols-outlined text-[14px]">done_all</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-4 bg-white dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-gray-800">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="flex items-center gap-2 mb-3 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-gray-800 focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
                                            <button onClick={handleGenerateReply} disabled={isGenerating} className="absolute -top-12 right-0 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-2 rounded-full text-[10px] font-black uppercase text-primary shadow-lg flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
                                                {isGenerating ? <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                                                Gere com IA
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">add</span></button>
                                            <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 dark:text-white" placeholder="Mensagem..." />
                                            {inputText ? (
                                                <button onClick={handleSendMessage} className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-95"><span className="material-symbols-outlined">send</span></button>
                                            ) : (
                                                <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">mic</span></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-[#0a0a0a]">
                                <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-100 dark:border-white/5 animate-pulse">
                                    <span className="material-symbols-outlined text-4xl text-primary">forum</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-widest mb-2">Canal de Atendimento</h3>
                                <p className="text-sm font-bold opacity-60">Selecione uma conversa para começar</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : viewMode === 'campaigns' ? (
                <div className="flex-1 overflow-y-auto p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">Campanhas</h2>
                                <p className="text-slate-500 font-bold">Engajamento multicanal automático</p>
                            </div>
                            <button onClick={() => setIsCampaignModalOpen(true)} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/30 flex items-center gap-2 hover:bg-primary-hover transition-all active:scale-95 uppercase italic">
                                <span className="material-symbols-outlined">rocket_launch</span> Criar Campanha
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {[
                                { label: 'Envios Totais', value: campaigns.reduce((a, b) => a + b.sent, 0), icon: 'send', color: 'blue' },
                                { label: 'Abertura Média', value: '42%', icon: 'visibility', color: 'purple' },
                                { label: 'ROI Estimado', value: '4.8x', icon: 'trending_up', color: 'emerald' }
                            ].map((kpi, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                                    <div className={`absolute top-0 right-0 p-3 bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 text-${kpi.color}-500 rounded-bl-3xl opacity-50 group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined text-4xl">{kpi.icon}</span>
                                    </div>
                                    <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">{kpi.value}</p>
                                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest italic">{kpi.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase italic">Histórico</h3>
                                <button className="text-[10px] font-black uppercase text-primary hover:underline">Ver relatório completo</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-[#111] text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <tr>
                                            <th className="px-8 py-5">Campanha</th>
                                            <th className="px-8 py-5">Canal</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5 text-center">Envios</th>
                                            <th className="px-8 py-5 text-center">Abertura</th>
                                            <th className="px-8 py-5 text-right">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                        {campaigns.map(camp => (
                                            <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-slate-900 dark:text-white italic group-hover:text-primary transition-colors">{camp.title}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${camp.type === 'WhatsApp' ? 'bg-green-100 text-green-700' : camp.type === 'Email' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{camp.type}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black uppercase ${camp.status === 'Sent' ? 'text-emerald-500' : 'text-slate-400'}`}>{camp.status}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center font-bold text-slate-600 dark:text-slate-400">{camp.sent}</td>
                                                <td className="px-8 py-6 text-center font-black text-slate-900 dark:text-white">{camp.openRate}</td>
                                                <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">{camp.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-10">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">Sugestões dos Usuários</h2>
                            <p className="text-slate-500 font-bold">Ideias e feedbacks enviados pela equipe através do Roadmap</p>
                        </div>

                        {loadingSuggestions ? (
                            <div className="flex justify-center py-20">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="bg-white dark:bg-[#1a1a1a] p-20 rounded-[3rem] text-center border border-slate-100 dark:border-gray-800">
                                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 font-light">tips_and_updates</span>
                                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Nenhuma sugestão ainda</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {suggestions.map(sug => (
                                    <div key={sug.id} className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-slate-50 dark:bg-black flex items-center justify-center text-primary border border-slate-100 dark:border-gray-800">
                                                    <span className="material-symbols-outlined">person</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white uppercase italic">{sug.user_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(sug.created_at).toLocaleDateString()} às {new Date(sug.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={sug.status}
                                                    onChange={(e) => handleUpdateSuggestionStatus(sug.id, e.target.value as any)}
                                                    className={`text-[10px] font-black uppercase rounded-full px-4 py-2 border-none ring-1 ring-slate-200 dark:ring-gray-800 bg-white dark:bg-black focus:ring-primary ${sug.status === 'pending' ? 'text-orange-500' : sug.status === 'approved' ? 'text-blue-500' : sug.status === 'implemented' ? 'text-emerald-500' : 'text-slate-400'} transition-all cursor-pointer`}
                                                >
                                                    <option value="pending">Pendente</option>
                                                    <option value="approved">Aprovada</option>
                                                    <option value="implemented">Implementada</option>
                                                    <option value="dismissed">Recusada</option>
                                                </select>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-3">{sug.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium whitespace-pre-wrap">{sug.content}</p>
                                        <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-gray-800">
                                            <button onClick={() => showNotification('Funcionalidade em desenvolvimento', 'info')} className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">reply</span> Responder ao Usuário
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};