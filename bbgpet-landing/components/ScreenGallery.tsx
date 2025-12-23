import React from 'react';

const ScreenGallery: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-[#0f0f0f] overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
          Beleza e <span className="text-primary">Poder</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Desenvolvemos cada tela pensando em quem não tem tempo a perder. Visual limpo, botões claros e informações onde você espera encontrar.
        </p>
      </div>

      <div className="relative w-full">
        {/* Gradients to hide scroll edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-gray-50 dark:from-[#0f0f0f] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-gray-50 dark:from-[#0f0f0f] to-transparent z-10 pointer-events-none"></div>

        <div className="flex gap-4 md:gap-8 px-4 md:px-8 animate-marquee hover:[animation-play-state:paused]">
          {[1, 2, 3, 4, 1, 2].map((item, idx) => (
            <div 
              key={idx} 
              className="flex-shrink-0 w-[85vw] md:w-[600px] aspect-video bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/5 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500"
            >
              <div className="h-6 md:h-8 bg-gray-100 dark:bg-black/50 border-b border-gray-200 dark:border-white/5 flex items-center px-4 gap-2">
                <div className="size-2 md:size-3 rounded-full bg-red-400"></div>
                <div className="size-2 md:size-3 rounded-full bg-yellow-400"></div>
                <div className="size-2 md:size-3 rounded-full bg-green-400"></div>
              </div>
              
              {/* Mockup Content based on index */}
              <div className="p-4 md:p-6 h-full flex flex-col bg-subtle dark:bg-gray-900/50">
                {item === 1 && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-6 md:h-8 w-24 md:w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="h-6 md:h-8 w-16 md:w-24 bg-primary/20 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                      <div className="h-16 md:h-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm"></div>
                      <div className="h-16 md:h-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm"></div>
                      <div className="h-16 md:h-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm"></div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-3">
                      <div className="h-3 md:h-4 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 md:h-4 w-3/4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 md:h-4 w-5/6 bg-gray-100 dark:bg-gray-700 rounded"></div>
                    </div>
                  </>
                )}
                {item === 2 && (
                  <div className="flex h-full gap-4">
                     <div className="w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full p-2 md:p-4 space-y-2">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-8 md:h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>)}
                     </div>
                     <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full p-4 relative">
                        <div className="absolute top-4 right-4 size-6 md:size-8 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="h-24 md:h-32 w-24 md:w-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 md:mb-6"></div>
                        <div className="h-5 md:h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
                        <div className="h-3 md:h-4 w-1/3 bg-gray-100 dark:bg-gray-700/50 rounded mx-auto"></div>
                     </div>
                  </div>
                )}
                {item === 3 && (
                   <div className="flex flex-col h-full">
                      <div className="h-48 md:h-64 flex items-end justify-between gap-2 px-4 pb-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4">
                         {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                           <div key={i} style={{height: `${h}%`}} className="flex-1 bg-primary/80 rounded-t-sm"></div>
                         ))}
                      </div>
                      <div className="h-10 md:h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center px-4 justify-between">
                         <div className="h-3 md:h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                         <div className="h-6 md:h-8 w-8 bg-primary rounded-lg"></div>
                      </div>
                   </div>
                )}
                {item === 4 && (
                   <div className="grid grid-cols-2 gap-2 md:gap-4 h-full">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 md:p-4 flex items-center gap-2 md:gap-3">
                           <div className="size-8 md:size-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"></div>
                           <div className="space-y-2 flex-1 min-w-0">
                              <div className="h-2 md:h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="h-1.5 md:h-2 w-1/2 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                           </div>
                        </div>
                      ))}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScreenGallery;