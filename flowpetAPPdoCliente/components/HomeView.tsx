import React from 'react';
import { Sun, CloudRain, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import { PetProfile, Appointment } from '../types';

interface HomeViewProps {
  pets: PetProfile[];
  appointments: Appointment[];
  userName?: string;
  onSelectPet: (petId: string) => void;
  onAddPet: () => void;
  onToggleAppointment: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ pets, appointments, userName, onSelectPet, onAddPet, onToggleAppointment }) => {
  // Filter for upcoming tasks (simulating "Today/Next few days")
  const upcomingTasks = appointments.filter(a => !a.completed && a.status === 'upcoming').slice(0, 3);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Greeting Section */}
      <div className="mt-2">
        <h2 className="text-3xl font-light text-white/80">{getGreeting()},</h2>
        <h1 className="text-4xl font-black text-indigo-500">
          {userName || 'Usuário'}
        </h1>
      </div>

      {/* Weather Widget (Static Mock) */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-3xl p-5 flex items-center justify-between backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sun className="text-amber-400" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">Clima de hoje</span>
          </div>
          <p className="text-2xl font-bold text-white">24°C <span className="text-sm font-normal text-white/50">Ensolarado</span></p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
          <CloudRain size={24} className="text-indigo-300" />
        </div>
      </div>

      {/* Pets Carousel */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-white">Meus Pets</h3>
          <button className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300">
            Gerenciar
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => onSelectPet(pet.id)}
              className="flex flex-col items-center gap-2 min-w-[80px] group transition-transform hover:scale-105"
            >
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg group-active:scale-95 transition-all">
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-full h-full rounded-full object-cover border-2 border-dark-900"
                />
              </div>
              <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{pet.name}</span>
            </button>
          ))}

          {/* Add New Pet Button */}
          <button
            onClick={onAddPet}
            className="flex flex-col items-center gap-2 min-w-[80px] group opacity-70 hover:opacity-100 transition-opacity"
          >
            <div className="w-20 h-20 rounded-full p-1 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:bg-white/5 transition-colors">
              <span className="text-2xl text-white/40 font-light group-hover:text-white/80 transition-colors">+</span>
            </div>
            <span className="text-sm font-medium text-white/40 group-hover:text-white/60">Adicionar</span>
          </button>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-glass-bg border border-glass-border rounded-3xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-4">Próximas Atividades</h3>

        <div className="space-y-4">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => onToggleAppointment(task.id)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${task.completed
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 group-hover:bg-indigo-500/20'
                  }`}>
                  {task.completed ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold text-white transition-opacity ${task.completed ? 'opacity-50 line-through' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-white/40">
                    {task.petName} • {task.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-white/40 flex flex-col items-center gap-2">
              <CalendarDays size={32} className="opacity-50" />
              <p className="text-sm">Tudo tranquilo por hoje!</p>
            </div>
          )}

          {/* Example completed visual just to show functionality if list is empty */}
          <div className="flex items-center gap-4 opacity-40">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white line-through">Passeio da Manhã</p>
              <p className="text-xs text-white/40">08:00 • Concluído</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};