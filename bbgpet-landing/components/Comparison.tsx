import React from 'react';

const Comparison: React.FC = () => {
  const features = [
    { name: 'Agendamento Online 24/7', us: true, others: false, manual: false },
    { name: 'Lembretes Automáticos (WhatsApp)', us: true, others: true, manual: false },
    { name: 'Controle Financeiro Completo', us: true, others: true, manual: true },
    { name: 'Acesso em Nuvem (Qualquer lugar)', us: true, others: false, manual: false },
    { name: 'App Mobile Nativo (iOS/Android)', us: true, others: false, manual: false },
    { name: 'Backup Automático e Seguro', us: true, others: true, manual: false },
    { name: 'Suporte Humanizado em < 5min', us: true, others: false, manual: false },
  ];

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
            Por que escolher o <br/>
            <span className="text-primary">Flow Pet CRM?</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Pare de lutar com planilhas ou sistemas complicados do século passado.
          </p>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="md:hidden flex items-center justify-center gap-2 text-gray-400 text-sm mb-4 animate-pulse">
          <span className="material-symbols-outlined">swipe_left</span>
          <span>Arraste para comparar</span>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px] md:min-w-[800px] bg-subtle dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-xl">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 mb-8 text-center pb-6 border-b border-gray-200 dark:border-white/10">
              <div className="col-span-1 text-left flex items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Funcionalidades</span>
              </div>
              <div className="col-span-1">
                <div className="inline-block px-4 md:px-6 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm mb-2 border border-gray-200 dark:border-gray-700 w-full">
                  <span className="font-bold text-gray-500 dark:text-gray-400 text-xs md:text-sm">Planilhas</span>
                </div>
              </div>
              <div className="col-span-1">
                 <div className="inline-block px-4 md:px-6 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm mb-2 border border-gray-200 dark:border-gray-700 w-full">
                  <span className="font-bold text-gray-500 dark:text-gray-400 text-xs md:text-sm">Sistemas Antigos</span>
                </div>
              </div>
              <div className="col-span-1 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full animate-bounce whitespace-nowrap">
                  Melhor Escolha
                </div>
                <div className="inline-block px-4 md:px-6 py-3 rounded-xl bg-primary shadow-lg shadow-primary/30 transform scale-110 w-full">
                  <span className="font-black text-white italic text-sm md:text-lg">FLOW PET</span>
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 items-center text-center py-3 hover:bg-white dark:hover:bg-white/5 rounded-xl transition-colors px-2">
                  <div className="col-span-1 text-left">
                    <span className="font-bold text-gray-700 dark:text-gray-200 text-xs md:text-base">{feature.name}</span>
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    {feature.manual ? (
                      <span className="material-symbols-outlined text-gray-400">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">close</span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-center">
                     {feature.others ? (
                      <span className="material-symbols-outlined text-gray-400">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">close</span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    {feature.us && (
                      <div className="size-6 md:size-8 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <span className="material-symbols-outlined font-bold text-sm md:text-base">check</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;