import React, { useState } from 'react';

const modules = [
  {
    id: 'reception',
    label: 'Recepção',
    icon: 'storefront',
    title: 'Recepção Ágil',
    desc: 'Acabe com as filas e a confusão no balcão. Uma recepção organizada é o primeiro passo para fidelizar clientes.',
    features: ['Agenda Drag-and-Drop intuitiva', 'Check-in rápido via QRCode', 'Disparo automático de confirmações'],
    color: 'bg-blue-500'
  },
  {
    id: 'grooming',
    label: 'Banho & Tosa',
    icon: 'cut',
    title: 'Gestão Estética',
    desc: 'Controle total do fluxo de banho. Saiba exatamente qual pet está na secagem, tosa ou pronto para entrega.',
    features: ['Painel de status em tempo real', 'Histórico de preferências do pet', 'Cálculo automático de comissões'],
    color: 'bg-purple-500'
  },
  {
    id: 'vet',
    label: 'Veterinário',
    icon: 'medical_services',
    title: 'Clínica Integrada',
    desc: 'Mantenha o histórico de saúde dos pets organizado e acessível. Prontuários completos em poucos cliques.',
    features: ['Carteira de vacinação digital', 'Receituário e exames anexados', 'Lembretes de retorno automáticos'],
    color: 'bg-green-500'
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: 'attach_money',
    title: 'Controle Total',
    desc: 'Não perca dinheiro por falta de gestão. Tenha uma visão clara do lucro, despesas e previsibilidade de caixa.',
    features: ['Fluxo de Caixa diário', 'DRE Gerencial simplificado', 'Controle de pacotes e assinaturas'],
    color: 'bg-orange-500'
  }
];

const Modules: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-24 bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
            Uma solução para <br/>
            <span className="text-primary">Cada Setor</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            O Flow Pet CRM conecta todas as áreas do seu negócio em uma única plataforma.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Tabs Navigation */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {modules.map((module, idx) => (
              <button
                key={module.id}
                onClick={() => setActiveTab(idx)}
                className={`group flex items-center gap-4 p-6 rounded-2xl text-left transition-all duration-300 border ${
                  activeTab === idx
                    ? 'bg-white dark:bg-gray-800 border-primary shadow-xl shadow-primary/10 scale-105 z-10'
                    : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5 text-gray-500'
                }`}
              >
                <div 
                  className={`size-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${
                    activeTab === idx ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span className="material-symbols-outlined">{module.icon}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${activeTab === idx ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {module.label}
                  </h3>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Módulo {idx + 1}</p>
                </div>
                {activeTab === idx && (
                  <span className="material-symbols-outlined ml-auto text-primary animate-pulse">chevron_right</span>
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="w-full lg:w-2/3">
            <div className="relative bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden h-full min-h-[500px] flex flex-col justify-center">
              {/* Decorative Background Blob */}
              <div className={`absolute top-0 right-0 w-64 h-64 ${modules[activeTab].color} opacity-10 blur-[80px] rounded-full pointer-events-none transition-colors duration-500`}></div>
              
              <div key={activeTab} className="relative z-10 animate-[fadeIn_0.5s_ease-out]">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${modules[activeTab].color} bg-opacity-10 text-${modules[activeTab].color.replace('bg-', '')} mb-6`}>
                  <span className={`size-2 rounded-full ${modules[activeTab].color}`}></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white opacity-70">Destaques do Módulo</span>
                </div>

                <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
                  {modules[activeTab].title}
                </h3>
                
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-xl">
                  {modules[activeTab].desc}
                </p>

                <ul className="space-y-6">
                  {modules[activeTab].features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 group">
                      <div className={`size-8 rounded-full ${modules[activeTab].color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/10">
                  <a href="#precos" className="inline-flex items-center gap-2 font-bold uppercase tracking-wide hover:gap-4 transition-all text-black dark:text-white hover:text-primary">
                    Ver Planos para {modules[activeTab].label}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Modules;