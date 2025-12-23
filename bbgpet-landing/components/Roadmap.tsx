import React from 'react';

const milestones = [
  { year: '2024 Q3', title: 'O Início', desc: 'Lançamento da Agenda Inteligente e Cadastro de Pets.', status: 'done' },
  { year: '2024 Q4', title: 'Segurança & CRM', desc: 'Backup JSON total, Raças dinâmicas e Gestão Multi-tenant.', status: 'done' },
  { year: '2025 Q1', title: 'App do Cliente V1', desc: 'Lançamento oficial com Personalização de Marca (Cores/Logo) e Toggles de Módulos.', status: 'done' },
  { year: '2025 Q2', title: 'IA & Automação', desc: 'Assistente virtual Gemini para pré-diagnóstico e lembretes automáticos.', status: 'current' },
  { year: '2025 Q3', title: 'Fidelidade & Clube', desc: 'Sistema de pontos, carteira digital e expansão de benefícios recorrentes.', status: 'future' },
  { year: '2025 Q4', title: 'Telemedicina', desc: 'Plataforma de consultas online integrada aos prontuários veterinários.', status: 'future' },
];

const Roadmap: React.FC = () => {
  return (
    <section className="py-24 bg-subtle dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">Inovação Contínua</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
            O Futuro do seu <br />
            Pet Shop é <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Aqui</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Não paramos de evoluir. Confira o que já entregamos e o que está por vir para revolucionar sua gestão.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 dark:bg-white/10 rounded-full"></div>

          <div className="space-y-12">
            {milestones.map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between w-full ${idx % 2 === 0 ? 'flex-row-reverse' : ''}`}>

                {/* Empty space for the other side */}
                <div className="hidden md:block w-5/12"></div>

                {/* Center Point */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`size-8 rounded-full border-4 flex items-center justify-center ${item.status === 'done' ? 'bg-primary border-white dark:border-black' :
                    item.status === 'current' ? 'bg-white border-primary animate-pulse' : 'bg-gray-800 border-gray-600'
                    }`}>
                    {item.status === 'done' && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                    {item.status === 'current' && <div className="size-2 bg-primary rounded-full"></div>}
                  </div>
                </div>

                {/* Content Card */}
                <div className="w-full md:w-5/12 pl-12 md:pl-0">
                  <div className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.status === 'current'
                    ? 'bg-white dark:bg-gray-800 border-primary shadow-lg shadow-primary/10'
                    : 'bg-white dark:bg-black border-gray-100 dark:border-white/10'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md ${item.status === 'current' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'
                        }`}>
                        {item.year}
                      </span>
                      {item.status === 'current' && <span className="text-xs font-bold text-primary animate-pulse">Em desenvolvimento</span>}
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;