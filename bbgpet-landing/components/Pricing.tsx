import React, { useState } from 'react';
import RegisterModal from './RegisterModal';
import SpotlightCard from './SpotlightCard';

const plans = [
  {
    name: 'Inicial',
    monthlyPrice: 89.90,
    description: 'Para quem está começando agora.',
    features: ['Até 50 clientes', 'Agenda básica', 'Histórico de vacinas', 'Suporte por email'],
    cta: 'Começar Agora',
    highlight: false,
    links: {
      monthly: 'https://buy.stripe.com/test_00w6oJ1vhfNU95acsG1gs00',
      yearly: 'https://buy.stripe.com/test_7sY28t5LxeJQ0yE0JY1gs01'
    }
  },
  {
    name: 'Profissional',
    monthlyPrice: 199.90,
    description: 'Para pet shops em crescimento acelerado.',
    features: ['Clientes ilimitados', 'Lembretes via WhatsApp', 'Controle financeiro', 'Módulo de Banho e Tosa', 'Suporte prioritário'],
    cta: 'Testar por 7 dias',
    highlight: true,
    links: {
      monthly: 'https://buy.stripe.com/test_8x2eVffm7bxE3KQeAO1gs02',
      yearly: 'https://buy.stripe.com/test_dRmeVfddZ59gchmboC1gs03'
    }
  },
  {
    name: 'Elite',
    monthlyPrice: 399.90,
    description: 'Gestão completa para grandes redes.',
    features: ['Multi-lojas', 'API de integração', 'Relatórios avançados', 'Gerente de conta dedicado', 'Treinamento para equipe'],
    cta: 'Falar com Consultor',
    highlight: false,
    links: {
      monthly: 'https://buy.stripe.com/test_eVq8wRc9VcBIepu9gu1gs04',
      yearly: 'https://buy.stripe.com/test_eVq14pfm7gRYa9edwK1gs05'
    }
  }
];

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPlanLink, setSelectedPlanLink] = useState('');
  const [selectedPlanName, setSelectedPlanName] = useState('');

  const handleSelectPlan = (index: number) => {
    const plan = plans[index];
    const link = billingCycle === 'monthly' ? plan.links.monthly : plan.links.yearly;

    setSelectedPlanLink(link);
    setSelectedPlanName(plan.name);
    setIsRegisterOpen(true);
  };

  return (
    <section className="py-24 bg-subtle dark:bg-[#0f0f0f] transition-colors duration-300" id="precos">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
            Investimento <span className="text-primary">Inteligente</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
            Escolha o plano ideal para o momento do seu negócio. Mude quando quiser.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-bold uppercase tracking-wider ${billingCycle === 'monthly' ? 'text-black dark:text-white' : 'text-gray-400'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-full p-1 transition-colors focus:outline-none"
            >
              <div
                className={`w-6 h-6 bg-primary rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'
                  }`}
              ></div>
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold uppercase tracking-wider ${billingCycle === 'yearly' ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                Anual
              </span>
              <span className="bg-green-100 text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                20% OFF
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'monthly'
              ? plan.monthlyPrice
              : plan.monthlyPrice * 0.8; // 20% discount

            return (
              <SpotlightCard
                key={idx}
                className={`relative p-8 transition-all duration-300 ${plan.highlight
                  ? 'border-2 border-primary shadow-2xl shadow-primary/20 scale-105 z-10'
                  : 'hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                spotlightColor={plan.highlight ? 'rgba(124, 58, 237, 0.2)' : undefined}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    Mais Popular
                  </div>
                )}

                <h3 className="text-xl font-black uppercase italic tracking-tight text-black dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 h-10">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-sm font-bold text-gray-500">R$</span>
                  <span className="text-5xl font-black tracking-tighter text-black dark:text-white">
                    {price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-bold text-gray-500">/mês</span>
                </div>

                {billingCycle === 'yearly' && (
                  <p className="text-xs text-green-500 font-bold mb-6">
                    Economia de R$ {((plan.monthlyPrice * 12) - (price * 12)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
                  </p>
                )}
                {billingCycle === 'monthly' && (
                  <div className="h-4 mb-6"></div> // Spacer to prevent jump
                )}

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      <span className={`material-symbols-outlined text-lg ${plan.highlight ? 'text-primary' : 'text-gray-400'}`}>check</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(idx)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25'
                    : 'bg-gray-100 dark:bg-white/10 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                    }`}
                >
                  {loadingPlan === idx ? (
                    <>
                      <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      Carregando...
                    </>
                  ) : plan.cta}
                </button>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        planLink={selectedPlanLink}
        planName={selectedPlanName}
      />
    </section>
  );
};

export default Pricing;