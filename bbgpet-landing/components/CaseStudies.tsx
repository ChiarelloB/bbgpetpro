import React, { useState, useEffect } from 'react';

const cases = [
  {
    company: "Bicho Chic",
    owner: "Fernanda Paiva",
    // Image: Woman owner smiling
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    challenge: "Perdia R$ 2.000/mês com faltas de clientes e agenda de papel confusa.",
    solution: "Implementou o agendamento online e lembretes automáticos do Flow Pet CRM.",
    result: "Reduziu o No-Show a zero e aumentou o faturamento em 45% no primeiro mês.",
    metric: "+45%",
    metricLabel: "Crescimento",
    details: "Antes do Flow Pet CRM, Fernanda gastava 2 horas por dia confirmando agendamentos no WhatsApp manual. Com a automação, ela recuperou esse tempo para focar em estratégias de vendas e treinamento da equipe."
  },
  {
    company: "Hospital Vet Care",
    owner: "Dr. André Luiz",
    // Image: Male vet
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800",
    challenge: "Equipe desorganizada, prontuários perdidos e demora no atendimento.",
    solution: "Centralizou o histórico clínico e organizou a fila de espera com o sistema.",
    result: "Tempo de espera reduzido pela metade e satisfação dos clientes nota 5 no Google.",
    metric: "-50%",
    metricLabel: "Tempo de Espera",
    details: "A clínica sofria com fichas de papel que sumiam. A digitalização permitiu que qualquer veterinário acessasse o histórico do animal em segundos, salvando vidas em emergências e agilizando consultas de rotina."
  }
];

const CaseStudies: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCase(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">Histórias Reais</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white">
            Resultados que <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Falam por si</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {cases.map((item, idx) => (
            <div key={idx} className="group relative bg-subtle dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-2xl flex flex-col h-full">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-9xl">format_quote</span>
              </div>

              <div className="p-8 md:p-12 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-md shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.owner} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=800'; // Fallback
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-black dark:text-white uppercase italic">{item.company}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.owner}</p>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <p className="text-xs font-bold uppercase text-red-400 mb-1">O Desafio</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.challenge}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-blue-400 mb-1">A Solução</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.solution}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-green-400 mb-1">O Resultado</p>
                    <p className="font-bold text-black dark:text-white text-lg leading-tight">{item.result}</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-4xl md:text-5xl font-black text-primary tracking-tighter">{item.metric}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{item.metricLabel}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCase(idx)}
                    className="size-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transform group-hover:scale-110 transition-transform hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedCase !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCase(null)}></div>
          
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl animate-[scaleIn_0.3s_ease-out]">
             <button 
               onClick={() => setSelectedCase(null)}
               className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
             >
               <span className="material-symbols-outlined">close</span>
             </button>

             <div className="flex items-center gap-4 mb-6">
                <div className="size-14 rounded-full overflow-hidden border-2 border-primary shadow-md">
                   <img src={cases[selectedCase].image} alt="" className="w-full h-full object-cover"/>
                </div>
                <div>
                   <h3 className="font-black text-xl text-black dark:text-white uppercase italic">{cases[selectedCase].company}</h3>
                   <p className="text-sm text-gray-500">{cases[selectedCase].owner}</p>
                </div>
             </div>

             <div className="bg-subtle dark:bg-black/40 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 mb-6">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                   "{cases[selectedCase].details}"
                </p>
             </div>

             <button 
               onClick={() => { setSelectedCase(null); document.getElementById('precos')?.scrollIntoView({behavior: 'smooth'}); }}
               className="w-full bg-primary text-white font-black uppercase tracking-wide py-4 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
             >
               Quero resultados assim
             </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CaseStudies;