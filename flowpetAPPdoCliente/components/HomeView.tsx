import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Cloud, CloudSun, CloudSnow, Wind, Droplets, CheckCircle2, Clock, CalendarDays, Loader2, Sparkles, MapPin, ArrowRight, Plus } from 'lucide-react';
import { PetProfile, Appointment } from '../types';

interface WeatherDay {
  day: string;
  date: string;
  temp: number;
  tempMin: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partlyCloudy' | 'stormy';
  humidity: number;
}

interface HomeViewProps {
  pets: PetProfile[];
  appointments: Appointment[];
  userName?: string;
  onSelectPet: (petId: string) => void;
  onAddPet: () => void;
  onToggleAppointment: (id: string) => void;
  onOpenAiChat: () => void;
  onNavigate: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ pets, appointments, userName, onSelectPet, onAddPet, onToggleAppointment, onOpenAiChat, onNavigate }) => {
  const [weekWeather, setWeekWeather] = useState<WeatherDay[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [cityName, setCityName] = useState('Sua Localização');

  // Filter for upcoming tasks
  const upcomingTasks = appointments.filter(a => !a.completed && a.status === 'upcoming').slice(0, 3);

  // Detect if there is a service currently in progress
  const liveTask = appointments.find(a => !a.completed && a.status === 'in-progress');

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const formatUsername = (name: string) => {
    if (!name) return 'Pet Lover';
    // Handle cases like "brunochiarellolaw" or emails
    const displayName = name.split(/[. @]/)[0];
    return displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
  };

  const getConditionName = (condition: WeatherDay['condition']) => {
    switch (condition) {
      case 'sunny': return 'Ensol.';
      case 'cloudy': return 'Nublado';
      case 'rainy': return 'Chuvoso';
      case 'partlyCloudy': return 'Parcial';
      default: return 'Bom';
    }
  };

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`)
                .then(res => res.json())
                .then(geoData => {
                  const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.suburb || 'Sua Localização';
                  setCityName(city);
                })
                .catch(() => setCityName('Sua Localização'));

              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode,relative_humidity_2m_mean&timezone=America/Sao_Paulo`
              );
              const data = await response.json();

              if (data.daily) {
                const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                const weather: WeatherDay[] = data.daily.time.slice(0, 7).map((date: string, i: number) => {
                  const d = new Date(date);
                  return {
                    day: i === 0 ? 'Hoje' : days[d.getDay()],
                    date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    temp: Math.round(data.daily.temperature_2m_max[i]),
                    tempMin: Math.round(data.daily.temperature_2m_min[i]),
                    condition: getConditionFromCode(data.daily.weathercode[i]),
                    humidity: data.daily.relative_humidity_2m_mean?.[i] || 50
                  };
                });
                setWeekWeather(weather);
              }
            } catch (error) {
              console.error('Error fetching weather:', error);
              setMockWeather();
            }
            setLoadingWeather(false);
          },
          () => {
            setMockWeather();
            setLoadingWeather(false);
          }
        );
      } else {
        setMockWeather();
        setLoadingWeather(false);
      }
    };

    const setMockWeather = () => {
      const days = ['Hoje', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const conditions: WeatherDay['condition'][] = ['sunny', 'partlyCloudy', 'cloudy', 'rainy', 'partlyCloudy', 'sunny', 'sunny'];
      const temps = [28, 26, 24, 22, 25, 27, 29];
      const tempsMin = [18, 17, 16, 15, 16, 17, 19];

      const weather: WeatherDay[] = days.map((day, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          day,
          date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          temp: temps[i],
          tempMin: tempsMin[i],
          condition: conditions[i],
          humidity: 60 + Math.floor(Math.random() * 30)
        };
      });
      setWeekWeather(weather);
    };

    const getConditionFromCode = (code: number): WeatherDay['condition'] => {
      if (code === 0 || code === 1) return 'sunny';
      if (code === 2) return 'partlyCloudy';
      if (code === 3) return 'cloudy';
      if (code >= 51 && code <= 99) return 'rainy';
      return 'partlyCloudy';
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: WeatherDay['condition'], size = 24) => {
    switch (condition) {
      case 'sunny': return <Sun size={size} className="text-amber-400" />;
      case 'cloudy': return <Cloud size={size} className="text-slate-400" />;
      case 'rainy': return <CloudRain size={size} className="text-blue-400" />;
      case 'partlyCloudy': return <CloudSun size={size} className="text-amber-300" />;
      case 'stormy': return <CloudSnow size={size} className="text-purple-400" />;
      default: return <Sun size={size} className="text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] pb-24">
      {/* Greeting Section */}
      <div className="mt-2 text-left px-1">
        <h2 className="text-3xl font-light text-white/70 tracking-tight">{getGreeting()},</h2>
        <h1 className="text-4xl font-black text-white tracking-tighter -mt-1 uppercase">
          {formatUsername(userName || '')}
        </h1>
      </div>

      {/* Live Service Status */}
      {liveTask && (
        <div className="relative overflow-hidden rounded-[2.5rem] p-7 bg-emerald-500/10 border border-emerald-500/30 group animate-pulse shadow-xl shadow-emerald-500/5">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-emerald-500 leading-tight uppercase tracking-tighter">Em Atendimento</h3>
              <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">{liveTask.petName} • {liveTask.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-tighter italic">Ao Vivo</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tracking')}
              className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Card: Next Appointment or CTA */}
      <div>
        {upcomingTasks.length > 0 ? (
          <div className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] p-7 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 shadow-2xl shadow-indigo-600/30" onClick={() => onToggleAppointment(upcomingTasks[0].id)}>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Próxima Atividade</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                  <ArrowRight size={20} />
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-[1.8rem] bg-white/10 backdrop-blur-md p-1 border border-white/20 ring-4 ring-white/5">
                  <img
                    src={pets.find(p => p.name === upcomingTasks[0].petName)?.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150"}
                    alt=""
                    className="w-full h-full object-cover rounded-[1.4rem]"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white leading-none">{upcomingTasks[0].title}</h3>
                  <p className="text-white/70 text-sm font-bold">{upcomingTasks[0].petName} • <span className="text-white">{upcomingTasks[0].time}</span></p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative group cursor-pointer overflow-hidden rounded-[2.2rem] p-8 bg-[#111] border border-white/10 hover:border-indigo-500/50 transition-all shadow-xl" onClick={onAddPet}>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/10">
                <CalendarDays size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-white leading-tight">Mime seu amigão</h3>
                <p className="text-white/40 text-sm font-bold mt-1 uppercase tracking-wider">Agende agora</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:rotate-90 transition-transform">
                <Plus size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weather Widget */}
      <div className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/10">
              <Sun className="text-amber-400" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-white/40">Clima & Passeios</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Ótimo para banho</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 shrink-0 whitespace-nowrap shadow-inner">
            <MapPin size={12} className="text-indigo-400" />
            <span className="text-[11px] font-black text-white/70 uppercase tracking-widest italic">{cityName}</span>
          </div>
        </div>

        <div className="p-6">
          {loadingWeather ? (
            <div className="flex justify-center py-6">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-2 px-2 pb-2">
              {weekWeather.map((day, i) => (
                <div
                  key={day.date}
                  className={`flex flex-col items-center min-w-[75px] py-5 px-1 rounded-[2.2rem] transition-all border ${i === 0
                    ? 'bg-indigo-600 border-indigo-500 scale-105 shadow-2xl shadow-indigo-600/40 z-10'
                    : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10'
                    }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-tighter mb-4 ${i === 0 ? 'text-white' : 'text-white/40'}`}>
                    {day.day}
                  </span>
                  <div className="mb-4 transition-transform hover:scale-110">
                    {getWeatherIcon(day.condition, i === 0 ? 36 : 28)}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-xl font-black leading-none ${i === 0 ? 'text-white' : 'text-white'}`}>{day.temp}°</span>
                    <span className={`text-[9px] font-black mt-2 uppercase opacity-60 tracking-tighter ${i === 0 ? 'text-white' : 'text-white'}`}>
                      {getConditionName(day.condition)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-4 px-1">
        {[
          { icon: <CheckCircle2 size={22} />, label: 'Vacinas', color: 'bg-emerald-500', action: () => onNavigate('pets') },
          { icon: <Sparkles size={22} />, label: 'Spa', color: 'bg-purple-500', action: () => onNavigate('add-appointment') },
          { icon: <CalendarDays size={22} />, label: 'Serviços', color: 'bg-blue-500', action: () => onNavigate('agenda') },
          { icon: <MapPin size={22} />, label: 'Lojas', color: 'bg-amber-500', action: () => onNavigate('profile') }, // Assuming profile has shop info or settings
        ].map((action, i) => (
          <div key={action.label} className="flex flex-col items-center gap-3 group cursor-pointer" onClick={action.action}>
            <div className={`w-16 h-16 rounded-3xl ${action.color}/10 flex items-center justify-center text-white border border-white/5 group-hover:scale-110 group-active:scale-95 transition-all shadow-xl`}>
              {React.cloneElement(action.icon as React.ReactElement, { className: i === 0 ? 'text-emerald-400' : i === 1 ? 'text-purple-400' : i === 2 ? 'text-blue-400' : 'text-amber-400' })}
            </div>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Pets Carousel */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Meus Pets</h3>
            <div className="bg-indigo-500 text-white text-[10px] px-2.5 py-1 rounded-full font-black shadow-lg shadow-indigo-500/20">{pets.length}</div>
          </div>
          <button
            onClick={() => onNavigate('pets')}
            className="text-[11px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
          >
            Ver Todos
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-6 px-6">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => onSelectPet(pet.id)}
              className="flex flex-col items-center gap-4 min-w-[105px] group"
            >
              <div className="w-24 h-24 rounded-[2.8rem] p-1.5 bg-gradient-to-tr from-white/10 to-transparent border border-white/5 shadow-2xl group-active:scale-95 transition-all relative overflow-hidden ring-4 ring-transparent group-hover:ring-indigo-500/30">
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-full h-full rounded-[2.4rem] object-cover shadow-inner"
                />
                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col items-center space-y-0.5">
                <span className="text-xs font-black text-white uppercase tracking-wider">{pet.name}</span>
                <span className="text-[9px] font-bold text-white/20 truncate max-w-[90px] uppercase tracking-tighter">{pet.breed}</span>
              </div>
            </button>
          ))}

          {/* Add New Pet Button */}
          <button
            onClick={onAddPet}
            className="flex flex-col items-center gap-4 min-w-[105px] group"
          >
            <div className="w-24 h-24 rounded-[2.8rem] border-2 border-dashed border-white/10 flex items-center justify-center group-hover:bg-white/5 group-hover:border-indigo-500/50 transition-all shadow-xl group-active:scale-95">
              <Plus size={36} className="text-white/10 group-hover:text-indigo-400 transition-colors" />
            </div>
            <span className="text-xs font-black text-white/20 group-hover:text-white/40 uppercase tracking-widest">Adicionar</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-5 px-1">
        <div className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-7 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden shadow-2xl">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform border border-emerald-500/10 shadow-lg">
            <CheckCircle2 size={28} />
          </div>
          <div className="flex flex-col">
            <p className="text-4xl font-black text-white leading-none mb-2">{appointments.filter(a => a.completed).length}</p>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Serviços Concluídos</p>
          </div>
        </div>
        <div className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-7 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden shadow-2xl">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform border border-indigo-500/10 shadow-lg">
            <CalendarDays size={28} />
          </div>
          <div className="flex flex-col">
            <p className="text-4xl font-black text-white leading-none mb-2">{appointments.filter(a => !a.completed).length}</p>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Próximos Agendados</p>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="px-1 pt-4">
        <div className="relative overflow-hidden rounded-[2.8rem] p-8 bg-gradient-to-r from-gray-900 to-black border border-white/10 shadow-2xl group cursor-pointer" onClick={onOpenAiChat}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] group-hover:bg-indigo-500/20 transition-all duration-700" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={40} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">Assistente IA</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest italic">Personalizado para seu pet</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:translate-x-2 transition-transform shadow-white/10">
              <ArrowRight size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};