import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Close video on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVideoOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-black transition-colors duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-10 dark:opacity-5 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-subtle dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-8 animate-[fadeInUp_1s_ease-out]">
            <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-widest text-primary">App do Cliente White-label Disponível</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-black dark:text-white mb-8 transition-colors duration-300">
            Domine o seu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
              Negócio Pet
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto mb-10 leading-relaxed transition-colors duration-300">
            Gestão completa, clientes felizes e mais tempo para o que importa. A plataforma definitiva para escalar seu Pet Shop com a simplicidade que você precisa.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <a href="#precos" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full text-base font-black uppercase tracking-wide shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1">
              Começar Agora Grátis
            </a>
            <button
              onClick={() => setIsVideoOpen(true)}
              className="w-full sm:w-auto bg-white dark:bg-transparent border-2 border-gray-200 dark:border-gray-700 text-black dark:text-white px-8 py-4 rounded-full text-base font-black uppercase tracking-wide hover:border-black dark:hover:border-white transition-all flex items-center justify-center gap-2 group"
            >
              Ver Vídeo
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">play_circle</span>
            </button>
          </div>

          {/* Mock Dashboard UI */}
          <div className="relative max-w-5xl mx-auto">
            {/* Glow Effect behind dashboard */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-400 to-primary rounded-2xl blur opacity-20"></div>

            <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col aspect-[16/9] md:aspect-auto md:h-[600px] transition-colors duration-300">
              {/* Window Controls */}
              <div className="bg-gray-50 dark:bg-black/40 border-b border-gray-100 dark:border-white/5 px-4 py-3 flex gap-2">
                <div className="size-3 bg-red-400 rounded-full"></div>
                <div className="size-3 bg-yellow-400 rounded-full"></div>
                <div className="size-3 bg-green-400 rounded-full"></div>
              </div>

              {/* Dashboard Content */}
              <div className="flex-1 bg-subtle dark:bg-black/80 p-6 flex gap-6 overflow-hidden transition-colors duration-300">
                {/* Sidebar Mockup */}
                <div className="hidden sm:flex w-16 md:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex-col p-4 gap-4 transition-colors duration-300">
                  <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-md w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-10 bg-primary/10 rounded-lg w-full"></div>
                    <div className="h-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg w-full"></div>
                    <div className="h-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg w-full"></div>
                    <div className="h-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg w-full"></div>
                  </div>
                </div>

                {/* Main Area Mockup */}
                <div className="flex-1 flex flex-col gap-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { color: 'bg-primary/20', bar: 'bg-primary' },
                      { color: 'bg-green-100 dark:bg-green-500/20', bar: 'bg-green-500' },
                      { color: 'bg-blue-100 dark:bg-blue-500/20', bar: 'bg-blue-500' }
                    ].map((stat, i) => (
                      <div key={i} className={`h-24 md:h-32 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-4 transition-colors duration-300 ${i === 2 ? 'hidden md:block' : ''}`}>
                        <div className={`h-6 w-6 md:h-8 md:w-8 ${stat.color} rounded-full mb-3`}></div>
                        <div className="h-3 md:h-4 bg-gray-100 dark:bg-gray-700 w-1/2 rounded mb-2"></div>
                        <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-600 w-3/4 rounded"></div>
                      </div>
                    ))}
                  </div>

                  {/* Main Table/List Area */}
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-6 flex flex-col transition-colors duration-300">
                    <div className="h-6 bg-gray-100 dark:bg-gray-700 w-1/4 rounded mb-6"></div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-10 md:h-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg w-full animate-pulse" style={{ animationDelay: `${item * 100}ms` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsVideoOpen(false)}
          ></div>

          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video animate-[scaleIn_0.3s_ease-out]">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 text-white/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>

            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1"
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;