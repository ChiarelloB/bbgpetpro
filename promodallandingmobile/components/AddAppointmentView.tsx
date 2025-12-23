import React, { useState } from 'react';
import { Calendar, Clock, Stethoscope, ShowerHead, Scissors, Syringe, Check } from 'lucide-react';
import { PetProfile } from '../types';

interface AddAppointmentViewProps {
  pets: PetProfile[];
  onCancel: () => void;
  onSave: (data: any) => void;
}

export const AddAppointmentView: React.FC<AddAppointmentViewProps> = ({ pets, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    petId: pets[0]?.id || '',
    date: '',
    time: '',
    type: 'vet' as 'vet' | 'bath' | 'grooming' | 'vaccine'
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    onSave(formData);
  };

  const types = [
    { id: 'vet', label: 'Veterinário', icon: <Stethoscope size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { id: 'bath', label: 'Banho', icon: <ShowerHead size={24} />, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { id: 'grooming', label: 'Tosa', icon: <Scissors size={24} />, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { id: 'vaccine', label: 'Vacina', icon: <Syringe size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  ];

  return (
    <div className="animate-[slideUp_0.3s_ease-out] h-full flex flex-col">
      <div className="flex-1 space-y-6">
        
        {/* Pet Selection */}
        <div className="space-y-2 mt-4">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Para quem é?</label>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                {pets.map(pet => (
                    <button
                        key={pet.id}
                        onClick={() => setFormData({...formData, petId: pet.id})}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all whitespace-nowrap ${
                            formData.petId === pet.id 
                            ? 'bg-indigo-600 border-indigo-500 shadow-neon text-white' 
                            : 'bg-glass-bg border-glass-border text-white/40'
                        }`}
                    >
                        <img src={pet.imageUrl} className="w-6 h-6 rounded-full object-cover border border-white/20" alt="" />
                        <span className="font-bold text-sm">{pet.name}</span>
                        {formData.petId === pet.id && <Check size={14} />}
                    </button>
                ))}
            </div>
        </div>

        {/* Appointment Type */}
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Tipo de Agendamento</label>
            <div className="grid grid-cols-2 gap-3">
                {types.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setFormData({...formData, type: type.id as any, title: type.label})}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                            formData.type === type.id 
                            ? `${type.bg} ${type.border} ring-2 ring-white/20` 
                            : 'bg-glass-bg border-glass-border opacity-50 hover:opacity-100'
                        }`}
                    >
                        <div className={type.color}>{type.icon}</div>
                        <span className={`text-sm font-bold ${formData.type === type.id ? 'text-white' : 'text-white/60'}`}>{type.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Título</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Consulta de Rotina" 
                  className="w-full bg-glass-bg border border-glass-border rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all" 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Data</label>
                    <div className="relative">
                        <input 
                        type="text" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        placeholder="DD/MM" 
                        className="w-full bg-glass-bg border border-glass-border rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all" 
                        />
                        <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Horário</label>
                    <div className="relative">
                        <input 
                        type="text" 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        placeholder="HH:MM" 
                        className="w-full bg-glass-bg border border-glass-border rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all" 
                        />
                         <Clock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-6 flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-transparent border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} className="flex-[2] py-4 rounded-2xl bg-white text-dark-950 font-black uppercase tracking-wide hover:bg-white/90 transition-colors shadow-lg active:scale-95 transform">
              Agendar
          </button>
      </div>
    </div>
  );
};