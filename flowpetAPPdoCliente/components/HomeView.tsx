import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Cloud, CloudSun, CloudSnow, Wind, Droplets, CheckCircle2, Clock, CalendarDays, Loader2 } from 'lucide-react';
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
}

export const HomeView: React.FC<HomeViewProps> = ({ pets, appointments, userName, onSelectPet, onAddPet, onToggleAppointment }) => {
  const [weekWeather, setWeekWeather] = useState<WeatherDay[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Filter for upcoming tasks (simulating "Today/Next few days")
  const upcomingTasks = appointments.filter(a => !a.completed && a.status === 'upcoming').slice(0, 3);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);

      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Using Open-Meteo free API (no key required)
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
            // Location denied, use mock data
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
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Greeting Section */}
      <div className="mt-2">
        <h2 className="text-3xl font-light text-white/80">{getGreeting()},</h2>
        <h1 className="text-4xl font-black text-indigo-500">
          {userName || 'Usuário'}
        </h1>
      </div>

      {/* Weekly Weather Widget */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-3xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="text-amber-400" size={18} />
          <span className="text-xs font-bold uppercase tracking-wider text-white/60">Previsão da Semana</span>
        </div>

        {loadingWeather ? (
          <div className="flex justify-center py-4">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {weekWeather.map((day, i) => (
              <div
                key={day.date}
                className={`flex flex-col items-center min-w-[60px] py-2 px-3 rounded-2xl transition-all ${i === 0 ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'
                  }`}
              >
                <span className={`text-[10px] font-bold uppercase ${i === 0 ? 'text-indigo-400' : 'text-white/40'}`}>
                  {day.day}
                </span>
                <div className="my-2">
                  {getWeatherIcon(day.condition, i === 0 ? 28 : 22)}
                </div>
                <span className="text-sm font-black text-white">{day.temp}°</span>
                <span className="text-[10px] text-white/40">{day.tempMin}°</span>
                {i === 0 && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-white/40">
                    <Droplets size={10} />
                    <span>{day.humidity}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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