import React, { useState } from 'react';

const MobileApp: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<'home' | 'calendar' | 'add' | 'pets' | 'profile'>('home');

  // Content for the "Home" screen
  const HomeScreen = () => (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4 animate-[fadeIn_0.3s_ease-out]">
        <div className="size-10 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
          <span className="material-symbols-outlined">calendar_today</span>
        </div>
        <div>
          <p className="font-bold text-sm text-black dark:text-white">14 Agendamentos</p>
          <p className="text-xs text-gray-400">3 aguardando confirmação</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 animate-[fadeIn_0.3s_ease-out_0.1s_both]">
        <p className="font-bold text-sm text-black dark:text-white mb-3">Próximo Cliente</p>
        <div className="flex items-center gap-3">
          <div className="size-10 bg-gray-200 rounded-full overflow-hidden shrink-0">
            <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=100" alt="Dog" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-black dark:text-white truncate">Thor (Golden)</p>
            <p className="text-xs text-gray-400 truncate">Banho e Tosa • 14:00</p>
          </div>
          <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase shrink-0">Confirmado</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 h-32 flex items-end justify-between px-2 pb-2 animate-[fadeIn_0.3s_ease-out_0.2s_both]">
        {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
          <div key={i} style={{ height: `${h}%` }} className="w-4 md:w-6 bg-primary/20 rounded-t-sm hover:bg-primary transition-colors"></div>
        ))}
      </div>
    </>
  );

  // Content for the "Calendar" screen
  const CalendarScreen = () => (
    <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
      <p className="text-xs font-bold uppercase text-gray-400 mb-2">Hoje, 24 Out</p>
      {[
        { time: '09:00', name: 'Luna', service: 'Banho', status: 'Concluído', color: 'text-gray-400' },
        { time: '10:30', name: 'Bob', service: 'Tosa', status: 'Em andamento', color: 'text-blue-500' },
        { time: '14:00', name: 'Thor', service: 'Completo', status: 'Confirmado', color: 'text-green-500' },
        { time: '16:00', name: 'Mel', service: 'Vacina', status: 'Pendente', color: 'text-orange-500' },
      ].map((apt, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg border-l-4 border-primary shadow-sm flex justify-between items-center">
          <div>
            <p className="font-bold text-sm text-black dark:text-white">{apt.time} - {apt.name}</p>
            <p className="text-xs text-gray-400">{apt.service}</p>
          </div>
          <span className={`material-symbols-outlined text-sm ${apt.color}`}>circle</span>
        </div>
      ))}
    </div>
  );

  // Content for "Pets" screen
  const PetsScreen = () => (
    <div className="grid grid-cols-2 gap-3 animate-[fadeIn_0.3s_ease-out]">
      {[
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&q=80&w=150',
      ].map((img, i) => (
        <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
          <img src={img} alt="Pet" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white">edit</span>
          </div>
        </div>
      ))}
    </div>
  );

  // Content for "Add" screen (Menu)
  const AddScreen = () => (
    <div className="grid grid-cols-2 gap-3 md:gap-4 h-full content-center animate-[scaleIn_0.2s_ease-out]">
      {[
        { label: 'Novo Cliente', icon: 'person_add', color: 'bg-blue-500' },
        { label: 'Agendar', icon: 'calendar_add_on', color: 'bg-primary' },
        { label: 'Venda', icon: 'point_of_sale', color: 'bg-green-500' },
        { label: 'Despesa', icon: 'receipt', color: 'bg-red-500' },
      ].map((action, i) => (
        <button key={i} className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className={`size-8 md:size-10 rounded-full ${action.color} text-white flex items-center justify-center`}>
            <span className="material-symbols-outlined text-lg md:text-2xl">{action.icon}</span>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300">{action.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <section className="py-24 bg-subtle dark:bg-[#0f0f0f] overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Text Side */}
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="material-symbols-outlined text-primary text-sm">smartphone</span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Disponível para iOS e Android</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
              Gestão na <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
                Palma da Mão
              </span>
            </h2>

            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Não fique preso ao balcão. Com o app do Flow Pet CRM, você acompanha o faturamento, responde clientes e aprova agendamentos de onde estiver.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                { icon: 'notifications_active', text: 'Notificações de agenda em tempo real' },
                { icon: 'palette', text: 'App do Cliente White-label totalmente seu' },
                { icon: 'qr_code_scanner', text: 'Check-in rápido de pets via câmera' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-primary shadow-sm shrink-0">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-200">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-3xl">apple</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Baixar na</p>
                  <p className="text-sm font-black leading-none">App Store</p>
                </div>
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-3xl">android</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Disponível no</p>
                  <p className="text-sm font-black leading-none">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* Phone Mockup Side */}
          <div className="lg:w-1/2 order-1 lg:order-2 flex justify-center w-full">
            {/* Responsiveness update: changed w-[300px] to w-full max-w-[300px] and adjusted height */}
            <div className="relative w-full max-w-[280px] md:max-w-[320px] h-[550px] md:h-[650px] bg-black rounded-[2.5rem] md:rounded-[3rem] border-4 md:border-8 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10 shrink-0">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-5 md:h-6 bg-black rounded-b-2xl z-20"></div>

              {/* Screen Content */}
              <div className="w-full h-full bg-subtle dark:bg-gray-900 overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="bg-primary pt-8 md:pt-10 pb-4 md:pb-6 px-4 md:px-6 rounded-b-3xl shadow-lg z-10 shrink-0">
                  <div className="flex justify-between items-center text-white mb-4">
                    <button onClick={() => setActiveScreen('home')}><span className="material-symbols-outlined">menu</span></button>
                    <span className="font-black italic text-sm md:text-base">FLOW PET</span>
                    <span className="material-symbols-outlined">notifications</span>
                  </div>
                  <p className="text-white/80 text-[10px] md:text-xs uppercase font-bold mb-1">
                    {activeScreen === 'home' ? 'Faturamento Hoje' : activeScreen === 'calendar' ? 'Sua Agenda' : activeScreen === 'pets' ? 'Meus Pets' : 'Ações Rápidas'}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black text-white">
                    {activeScreen === 'home' ? 'R$ 1.240' : activeScreen === 'calendar' ? '4 Pendentes' : activeScreen === 'pets' ? '253 Total' : 'Novo...'}
                  </h3>
                </div>

                {/* App Body - Dynamic Content */}
                <div className="p-4 space-y-4 overflow-y-auto relative flex-1 no-scrollbar">
                  {/* Floating Elements Animation (Only on Home) */}
                  {activeScreen === 'home' && (
                    <div className="absolute top-10 -right-10 size-32 bg-primary/10 rounded-full blur-xl animate-pulse pointer-events-none"></div>
                  )}

                  {activeScreen === 'home' && <HomeScreen />}
                  {activeScreen === 'calendar' && <CalendarScreen />}
                  {activeScreen === 'pets' && <PetsScreen />}
                  {activeScreen === 'add' && <AddScreen />}
                  {activeScreen === 'profile' && (
                    <div className="text-center py-10 animate-[fadeIn_0.3s_ease-out]">
                      <div className="size-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-bold text-black dark:text-white text-lg">Fernanda Paiva</h4>
                      <p className="text-gray-500 text-sm">Bicho Chic</p>
                      <button className="mt-6 text-red-500 text-sm font-bold uppercase">Sair</button>
                    </div>
                  )}

                </div>

                {/* Bottom Nav */}
                <div className="mt-auto bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-white/5 p-3 md:p-4 flex justify-between items-center shrink-0">
                  <button
                    onClick={() => setActiveScreen('home')}
                    className={`material-symbols-outlined transition-colors ${activeScreen === 'home' ? 'text-primary' : 'text-gray-400'}`}
                  >
                    home
                  </button>
                  <button
                    onClick={() => setActiveScreen('calendar')}
                    className={`material-symbols-outlined transition-colors ${activeScreen === 'calendar' ? 'text-primary' : 'text-gray-400'}`}
                  >
                    calendar_month
                  </button>

                  {/* Floating Action Button */}
                  <button
                    onClick={() => setActiveScreen('add')}
                    className={`size-10 md:size-12 rounded-full flex items-center justify-center text-white shadow-lg -mt-8 border-4 border-gray-50 dark:border-gray-900 transition-transform hover:scale-110 ${activeScreen === 'add' ? 'bg-black' : 'bg-primary'}`}
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>

                  <button
                    onClick={() => setActiveScreen('pets')}
                    className={`material-symbols-outlined transition-colors ${activeScreen === 'pets' ? 'text-primary' : 'text-gray-400'}`}
                  >
                    pets
                  </button>
                  <button
                    onClick={() => setActiveScreen('profile')}
                    className={`material-symbols-outlined transition-colors ${activeScreen === 'profile' ? 'text-primary' : 'text-gray-400'}`}
                  >
                    person
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MobileApp;