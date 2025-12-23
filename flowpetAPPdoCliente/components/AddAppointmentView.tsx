import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Stethoscope, ShowerHead, Scissors, Syringe, Check, Loader2, AlertCircle } from 'lucide-react';
import { PetProfile } from '../types';

interface AddAppointmentViewProps {
  pets: PetProfile[];
  onCancel: () => void;
  onSave: (data: any) => void;
}

interface Service {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const AddAppointmentView: React.FC<AddAppointmentViewProps> = ({ pets, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    petId: pets[0]?.id || '',
    date: '',
    time: '',
    type: 'grooming' as 'vet' | 'bath' | 'grooming' | 'vaccine',
    notes: ''
  });

  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Get pet shop ID from localStorage
  const petShop = JSON.parse(localStorage.getItem('flowpet_petshop') || '{}');

  useEffect(() => {
    const fetchServices = async () => {
      if (!petShop.id) return;

      const { data } = await supabase
        .from('services')
        .select('id, name, category, duration_minutes')
        .eq('tenant_id', petShop.id)
        .eq('is_active', true)
        .order('name');

      if (data) {
        setServices(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, title: data[0].name }));
        }
      }
      setLoadingServices(false);
    };

    fetchServices();
  }, []);

  // Check availability when date changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || !petShop.id) return;

      setLoadingSlots(true);

      // Get existing appointments for this date
      const { data: existingApts } = await supabase
        .from('appointments')
        .select('start_time')
        .eq('tenant_id', petShop.id)
        .eq('date', selectedDate)
        .not('status', 'eq', 'cancelled');

      const bookedTimes = existingApts?.map(a => a.start_time) || [];

      // Generate time slots (8:00 to 18:00)
      const slots: TimeSlot[] = [];
      for (let hour = 8; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          slots.push({
            time,
            available: !bookedTimes.includes(time)
          });
        }
      }

      setAvailableSlots(slots);
      setLoadingSlots(false);
    };

    checkAvailability();
  }, [selectedDate]);

  const handleSubmit = () => {
    if (!formData.title || !selectedDate || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    onSave({
      ...formData,
      date: selectedDate
    });
  };

  const types = [
    { id: 'grooming', label: 'Banho & Tosa', icon: <Scissors size={24} />, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { id: 'bath', label: 'Banho', icon: <ShowerHead size={24} />, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { id: 'vet', label: 'Veterinário', icon: <Stethoscope size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { id: 'vaccine', label: 'Vacina', icon: <Syringe size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  ];

  // Generate next 14 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      // Skip Sundays (0)
      if (dayOfWeek !== 0) {
        days.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          dayNumber: date.getDate(),
          month: date.toLocaleDateString('pt-BR', { month: 'short' })
        });
      }
    }
    return days;
  };

  const nextDays = getNextDays();

  return (
    <div className="animate-[slideUp_0.3s_ease-out] h-full flex flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto pb-4">

        {/* Pet Selection */}
        <div className="space-y-2 mt-4">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Para qual pet?</label>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
            {pets.map(pet => (
              <button
                key={pet.id}
                onClick={() => setFormData({ ...formData, petId: pet.id })}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all whitespace-nowrap ${formData.petId === pet.id
                  ? 'bg-indigo-600 border-indigo-500 shadow-neon text-white'
                  : 'bg-white/5 border-white/10 text-white/40'
                  }`}
              >
                <img src={pet.imageUrl} className="w-6 h-6 rounded-full object-cover border border-white/20" alt="" />
                <span className="font-bold text-sm">{pet.name}</span>
                {formData.petId === pet.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Service/Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Tipo de Serviço</label>
          {loadingServices ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          ) : services.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {services.slice(0, 8).map(service => (
                <button
                  key={service.id}
                  onClick={() => setFormData({ ...formData, title: service.name })}
                  className={`px-4 py-2 rounded-xl border whitespace-nowrap transition-all ${formData.title === service.name
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                >
                  <span className="font-bold text-sm">{service.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {types.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormData({ ...formData, type: type.id as any, title: type.label })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${formData.type === type.id
                    ? `${type.bg} ${type.border} ring-2 ring-white/20`
                    : 'bg-white/5 border-white/10 opacity-50 hover:opacity-100'
                    }`}
                >
                  <div className={type.color}>{type.icon}</div>
                  <span className={`text-sm font-bold ${formData.type === type.id ? 'text-white' : 'text-white/60'}`}>{type.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Escolha o dia</label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {nextDays.map(day => (
              <button
                key={day.date}
                onClick={() => {
                  setSelectedDate(day.date);
                  setFormData({ ...formData, time: '' });
                }}
                className={`flex flex-col items-center px-4 py-3 rounded-2xl border transition-all min-w-[70px] ${selectedDate === day.date
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60'
                  }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-60">{day.dayName}</span>
                <span className="text-xl font-black">{day.dayNumber}</span>
                <span className="text-[10px] uppercase">{day.month}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Horários Disponíveis</label>
            {loadingSlots ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.filter(s => s.available).length === 0 ? (
                  <div className="col-span-4 text-center py-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <AlertCircle className="mx-auto mb-2 text-red-400" size={24} />
                    <p className="text-red-400 text-sm font-bold">Sem horários disponíveis</p>
                    <p className="text-white/40 text-xs">Escolha outra data</p>
                  </div>
                ) : (
                  availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setFormData({ ...formData, time: slot.time })}
                      className={`py-3 rounded-xl border transition-all font-bold text-sm ${formData.time === slot.time
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : slot.available
                          ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                        }`}
                    >
                      {slot.time}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Observações (opcional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ex: Meu pet tem medo de barulhos altos..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all resize-none"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="pt-6 flex gap-4 border-t border-white/10">
        <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-transparent border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-colors">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.time || !selectedDate}
          className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-wide hover:bg-indigo-500 transition-colors shadow-lg active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agendar
        </button>
      </div>
    </div>
  );
};