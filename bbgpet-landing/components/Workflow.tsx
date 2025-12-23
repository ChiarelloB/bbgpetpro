import React from 'react';

const Workflow: React.FC = () => {
  return (
    <section className="py-24 bg-black dark:bg-gray-900 text-white overflow-hidden transition-colors duration-300" id="beneficios">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Chat Simulation */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-gray-900 dark:bg-black rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden transition-colors duration-300">
              {/* Decorative Icon Background */}
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none">
                <span className="material-symbols-outlined text-[150px]">rocket_launch</span>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex gap-3 animate-[slideInLeft_0.5s_ease-out]">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold shrink-0">V</div>
                  <div className="bg-gray-800 dark:bg-gray-900/80 p-3 rounded-r-xl rounded-bl-xl text-sm border border-gray-700">
                    <p>O agendamento do Thor foi confirmado?</p>
                  </div>
                </div>

                <div className="flex gap-3 flex-row-reverse animate-[slideInRight_0.5s_ease-out_0.3s_both]">
                  <div className="size-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold shrink-0">R</div>
                  <div className="bg-primary p-3 rounded-l-xl rounded-br-xl text-sm shadow-lg shadow-primary/20">
                    <p className="font-medium text-white">Sim! E o sistema já enviou o lembrete pro WhatsApp do dono.</p>
                  </div>
                </div>

                <div className="flex gap-3 animate-[slideInLeft_0.5s_ease-out_0.6s_both]">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold shrink-0">V</div>
                  <div className="bg-gray-800 dark:bg-gray-900/80 p-3 rounded-r-xl rounded-bl-xl text-sm border border-gray-700">
                    <p>Perfeito. Eficiência máxima hoje! 🚀</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:w-1/2">
            <h3 className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Workflow</h3>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 leading-tight">
              Menos cliques, <br />
              Mais resultados.
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Esqueça planilhas complexas e sistemas lentos. O Flow Pet CRM foi desenhado para ser fluido. Comunique-se com sua equipe em tempo real e resolva problemas antes que eles aconteçam.
            </p>
            <ul className="space-y-4">
              {[
                'Interface limpa e focada',
                'Automação de mensagens',
                'Suporte técnico dedicado'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 group">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">check_circle</span>
                  <span className="font-bold text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Workflow;