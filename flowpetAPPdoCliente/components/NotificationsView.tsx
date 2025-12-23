import React, { useState, useEffect } from 'react';
import { Bell, Syringe, ShowerHead, AlertTriangle, CheckCircle2, Loader2, Info, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

interface NotificationsViewProps {
  onClose: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data as Notification[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase.channel('user_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const clearAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setNotifications([]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={20} />;
      case 'success': return <CheckCircle2 size={20} />;
      case 'error': return <X size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
        <p className="text-white/40">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="h-full animate-[slideInRight_0.3s_ease-out] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-white">Notificações</h2>
        {notifications.length > 0 && (
          <button onClick={clearAll} className="text-sm font-bold text-red-400/80 hover:text-red-400 transition-colors uppercase tracking-widest">
            Limpar tudo
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-10">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`bg-white/5 border border-white/5 p-4 rounded-3xl flex gap-4 transition-all cursor-pointer relative group ${!notif.is_read ? 'border-indigo-500/30 bg-indigo-500/5' : 'opacity-60 hover:opacity-100'
                }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                  notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                    notif.type === 'error' ? 'bg-red-500/10 text-red-500' :
                      'bg-indigo-500/10 text-indigo-500'
                }`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-white text-sm">{notif.title}</h3>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{notif.message}</p>
                <p className="text-white/20 text-[10px] mt-2 font-black uppercase tracking-widest">{formatTime(notif.created_at)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10">
              <Bell size={40} />
            </div>
            <p className="text-white/20 text-sm font-bold uppercase tracking-widest">Nenhuma notificação</p>
          </div>
        )}
      </div>
    </div>
  );
};