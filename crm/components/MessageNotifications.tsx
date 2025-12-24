import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { useSecurity } from '../SecurityContext';

interface MessageNotification {
    id: string;
    senderName: string;
    senderAvatar?: string;
    text: string;
    chatName: string;
    timestamp: Date;
}

export const MessageNotifications: React.FC<{ onNavigate?: (screen: string, state?: any) => void }> = ({ onNavigate }) => {
    const [notifications, setNotifications] = useState<MessageNotification[]>([]);
    const { user } = useSecurity();

    useEffect(() => {
        if (!user) return;

        // Subscribe to new messages in all chats
        const channel = supabase
            .channel('global-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages'
                },
                async (payload) => {
                    const newMessage = payload.new as any;

                    // Don't notify for own messages (messages without sender_id are from current user)
                    if (!newMessage.sender_id) return;

                    try {
                        // Get chat info
                        const { data: chatData } = await supabase
                            .from('chats')
                            .select('name, type')
                            .eq('id', newMessage.chat_id)
                            .single();

                        // Get sender info if we have sender_profile_id
                        let senderName = 'Novo contato';
                        let senderAvatar = undefined;

                        if (newMessage.sender_profile_id) {
                            const { data: profileData } = await supabase
                                .from('profiles')
                                .select('full_name, name, avatar_url')
                                .eq('id', newMessage.sender_profile_id)
                                .single();

                            if (profileData) {
                                senderName = profileData.full_name || profileData.name || 'Usuário';
                                senderAvatar = profileData.avatar_url;
                            }
                        } else if (newMessage.sender_id) {
                            senderName = newMessage.sender_id;
                        }

                        const notification: MessageNotification = {
                            id: newMessage.id,
                            senderName,
                            senderAvatar,
                            text: newMessage.text || 'Nova mensagem',
                            chatName: chatData?.name || 'Chat',
                            timestamp: new Date(newMessage.created_at)
                        };

                        setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep max 5 notifications

                        // Auto-dismiss after 8 seconds
                        setTimeout(() => {
                            setNotifications(prev => prev.filter(n => n.id !== notification.id));
                        }, 8000);

                        // Play notification sound (optional)
                        try {
                            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+XhXNjWVBKR0dKUFpjc4WXn56ObH1dX2GKj5STkYqBeHJqZF9dXF1gZWx4gYqTk4+KfHVsZ2JeXl1dXl9jZ2x0fISKj5COiH50bGdiX11cXV5fYmVpbnV8goeKi4mFfndwamZiX15dXV5fYWRobHJ4fYKGiIiFgXt2b2pkYV5dXV1eYGNmaW1ydnp+gYOCgH14dHBsaWZjYWBfYGFjZWdpbG5xc3V2dnZ1dHJwbmxqaGZlZGRjY2NjZGRlZWZnaGlqa2xtbm5ub25tbGtqaWhnZmVlZGRjY2NjY2RkZWVmZ2doaWprbG1ubm9vb25tbWxramlpZ2dmZWVkZGNjZA==');
                            audio.volume = 0.3;
                            audio.play().catch(() => { }); // Ignore errors if audio can't play
                        } catch (e) { }

                    } catch (err) {
                        console.error('Error fetching notification data:', err);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleNotificationClick = (notification: MessageNotification) => {
        dismissNotification(notification.id);
        if (onNavigate) {
            onNavigate('communication');
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {notifications.map((notification, index) => (
                <div
                    key={notification.id}
                    className="pointer-events-auto bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 p-4 animate-in slide-in-from-right duration-300 cursor-pointer hover:scale-[1.02] transition-transform group"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleNotificationClick(notification)}
                >
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            {notification.senderAvatar ? (
                                <img
                                    src={notification.senderAvatar}
                                    alt={notification.senderName}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                    {notification.senderName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1f1f1f] animate-pulse" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate">
                                    {notification.senderName}
                                </h4>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dismissNotification(notification.id);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-gray-300 line-clamp-2">
                                {notification.text}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <span className="material-symbols-outlined text-primary text-sm">chat</span>
                                <span className="text-xs text-slate-500 dark:text-gray-400">
                                    {notification.chatName}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-gray-500">•</span>
                                <span className="text-xs text-slate-400 dark:text-gray-500">
                                    {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action hint */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            Clique para responder
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-emerald-500 text-lg animate-bounce">notifications_active</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageNotifications;
