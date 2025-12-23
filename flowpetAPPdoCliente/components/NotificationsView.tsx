import React from 'react';
import { Bell, Syringe, ShowerHead, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NotificationsViewProps {
  onClose: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      title: 'Vacina V10 Vencendo',
      message: 'A vacina do Thor vence em 15 dias. Agende o reforço.',
      time: '2 horas atrás',
      icon: <Syringe size={20} />,
      type: 'warning'
    },
    {
      id: 2,
      title: 'Banho Concluído',
      message: 'O banho do Thor no PetShop Central foi finalizado.',
      time: 'Ontem, 16:30',
      icon: <ShowerHead size={20} />,
      type: 'success'
    },
    {
      id: 3,
      title: 'Consulta Agendada',
      message: 'Lembrete: Consulta da Luna amanhã às 10:00.',
      time: 'Ontem, 09:00',
      icon: <Bell size={20} />,
      type: 'info'
    }
  ];

  return (
    <div className="h-full animate-[slideInRight_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Notificações</h2>
        <button onClick={onClose} className="text-sm font-bold text-indigo-400">
            Limpar
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
            <div key={notif.id} className="bg-glass-bg border border-glass-border p-4 rounded-2xl flex gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                    notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-indigo-500/10 text-indigo-500'
                }`}>
                    {notif.icon}
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">{notif.title}</h3>
                    <p className="text-white/60 text-xs mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-white/20 text-[10px] mt-2 font-medium uppercase tracking-wide">{notif.time}</p>
                </div>
                {notif.type === 'warning' && (
                    <div className="shrink-0 pt-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    </div>
                )}
            </div>
        ))}

        <div className="py-8 text-center">
            <p className="text-white/20 text-xs">Fim das notificações</p>
        </div>
      </div>
    </div>
  );
};