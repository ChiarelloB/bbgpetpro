import React, { useState } from 'react';
import { MapPin, Clock, Trash2 } from 'lucide-react';
import { Appointment } from '../types';

interface AgendaViewProps {
  appointments: Appointment[];
  onDelete?: (id: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ appointments, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'upcoming') {
        return apt.status === 'upcoming' && !apt.completed;
    } else {
        return apt.status === 'completed' || apt.completed;
    }
  });

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-glass-bg border border-glass-border rounded-3xl p-2 backdrop-blur-md mb-6 flex items-center justify-between">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === 'upcoming' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            Próximos
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === 'history' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            Histórico
          </button>
      </div>

      <div className="space-y-6 relative pl-4">
        {/* Timeline Line */}
        <div className="absolute left-[27px] top-4 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/50 to-transparent"></div>

        {filteredAppointments.length > 0 ? (
            filteredAppointments.map((apt) => (
            <div key={apt.id} className="relative flex items-start gap-4 group animate-[slideUp_0.3s_ease-out]">
                
                {/* Timeline Dot */}
                <div className={`relative z-10 w-6 h-6 rounded-full mt-1 border-4 transition-transform group-hover:scale-110 ${
                    activeTab === 'upcoming' 
                    ? 'bg-dark-900 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                    : 'bg-dark-900 border-white/20'
                }`}></div>
                
                {/* Card */}
                <div className="flex-1 bg-dark-800/80 border border-white/5 rounded-2xl p-4 hover:bg-dark-800 transition-colors shadow-lg relative group/card">
                    {onDelete && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(confirm('Excluir este agendamento?')) onDelete(apt.id);
                            }}
                            className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover/card:opacity-100 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}

                    <div className="flex justify-between items-start mb-2 pr-6">
                        <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 block">
                            {apt.date}
                        </span>
                        <h3 className="font-bold text-lg text-white leading-tight">{apt.title}</h3>
                        </div>
                        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-xs font-bold text-white/70">{apt.petName}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-white/40 text-xs">
                            <Clock size={14} />
                            <span>{apt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs">
                            <MapPin size={14} />
                            <span>PetShop Central</span>
                        </div>
                    </div>
                </div>
            </div>
            ))
        ) : (
            <div className="text-center py-10 text-white/30 italic">
                {activeTab === 'upcoming' ? 'Nenhum agendamento futuro.' : 'Nenhum histórico encontrado.'}
            </div>
        )}

        {filteredAppointments.length > 0 && activeTab === 'upcoming' && (
            <div className="relative flex items-center gap-4 opacity-50">
                <div className="relative z-10 w-6 h-6 rounded-full bg-dark-800 border-2 border-white/10 mt-1"></div>
                <p className="text-xs text-white/30 italic">Fim dos agendamentos futuros</p>
            </div>
        )}

      </div>
    </div>
  );
};