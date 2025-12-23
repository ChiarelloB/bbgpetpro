import React from 'react';
import { ShowerHead, Calendar, Clock } from 'lucide-react';
import { PetProfile } from '../types';

interface AppointmentCardProps {
  appointment: PetProfile['nextAppointment'];
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  if (!appointment) return null;

  return (
    <div className="relative bg-indigo-600 rounded-3xl p-6 shadow-neon overflow-hidden group cursor-pointer transition-transform active:scale-[0.98]">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-900"></div>
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/10 mb-2">
              Próximo
            </span>
            <h3 className="text-2xl font-black italic uppercase tracking-tight leading-none">
              {appointment.title.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
              ))}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-white shadow-lg">
            <ShowerHead size={24} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Date */}
          <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 border border-white/5 hover:bg-black/30 transition-colors">
            <Calendar size={20} className="text-indigo-200" />
            <div>
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Data</p>
              <p className="text-sm font-bold">{appointment.date}</p>
            </div>
          </div>
          
          {/* Time */}
          <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 border border-white/5 hover:bg-black/30 transition-colors">
            <Clock size={20} className="text-indigo-200" />
            <div>
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Horário</p>
              <p className="text-sm font-bold">{appointment.time}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};