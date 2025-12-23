import React from 'react';

const steps = [
  {
    num: '01',
    title: 'Crie sua conta',
    desc: 'Em menos de 2 minutos você tem acesso ao sistema. Sem cartão de crédito obrigatório para testar.',
    icon: 'person_add'
  },
  {
    num: '02',
    title: 'Migração Grátis',
    desc: 'Nossa equipe importa todos os seus dados de clientes e pets do sistema antigo ou planilhas.',
    icon: 'cloud_upload'
  },
  {
    num: '03',
    title: 'Treinamento',
    desc: 'Vídeos curtos e objetivos para sua equipe aprender a usar o agendamento e caixa no primeiro dia.',
    icon: 'school'
  },
  {
    num: '04',
    title: 'Sucesso Total',
    desc: 'Pronto! Sua loja operando no piloto automático, sem erros e com muito mais lucro.',
    icon: 'rocket_launch'
  }
];

const OnboardingSteps: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
            Mudar é <span className="text-primary">Fácil</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Sabemos que trocar de sistema dá medo. Por isso, criamos um processo onde nós fazemos o trabalho pesado por você.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-1 bg-gray-100 dark:bg-white/10 -z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                <div className="size-24 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-white/10 flex items-center justify-center mb-8 shadow-xl group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary transition-colors">{step.icon}</span>
                  <div className="absolute -top-3 -right-3 size-8 bg-primary text-white rounded-full flex items-center justify-center font-black text-sm border-4 border-white dark:border-gray-900">
                    {step.num}
                  </div>
                </div>
                
                <h3 className="text-xl font-black uppercase italic tracking-tight text-black dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnboardingSteps;