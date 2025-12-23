import React, { useState, useEffect } from 'react';
import RegisterModal from './RegisterModal';
import SpotlightCard from './SpotlightCard';
import { supabase } from '../lib/supabase';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: string;
  services: string[] | null;
  stripe_payment_link: string | null;
  is_pro: boolean;
  color: string;
  stripe_product_id: string;
}

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPlanLink, setSelectedPlanLink] = useState('');
  const [selectedPlanName, setSelectedPlanName] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .eq('tenant_id', '00000000-0000-0000-0000-000000000001') // Only Global Plans
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoadingFetch(false);
    }
  };

  const handleSelectPlan = (plan: Plan, index: number) => {
    const link = plan.stripe_payment_link || '#';

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
          {loadingFetch ? (
            <div className="col-span-full text-center py-20 text-gray-500">Carregando planos...</div>
          ) : plans.map((plan, idx) => {
            // Apply 20% discount logic if Yearly is selected
            // Note: In a real scenario, you probably want precise Stripe Price IDs for yearly.
            // Here we respect the user's request to "Make discount calc on landing".
            // So we take the base Monthly price and discount it visually.
            // The Stripe Link usually is fixed to one price. 
            // FIXME: If the link is for Monthly, paying Yearly via that link won't work unless the link supports adjustable quantity or coupon.
            // For now, we follow the visual instructions. 

            const basePrice = plan.price;
            const displayPrice = billingCycle === 'monthly'
              ? basePrice
              : basePrice * 0.8; // 20% discount

            const isHighlight = plan.name === 'Profissional'; // Highlight middle plan or by flag

            return (
              <SpotlightCard
                key={plan.id}
                className={`relative p-8 transition-all duration-300 ${isHighlight
                  ? 'border-2 border-primary shadow-2xl shadow-primary/20 scale-105 z-10'
                  : 'hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                spotlightColor={isHighlight ? 'rgba(124, 58, 237, 0.2)' : undefined}
              >
                {isHighlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    Mais Popular
                  </div>
                )}

                <h3 className="text-xl font-black uppercase italic tracking-tight text-black dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 h-10 line-clamp-2">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-sm font-bold text-gray-500">R$</span>
                  <span className="text-5xl font-black tracking-tighter text-black dark:text-white">
                    {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-bold text-gray-500">/mês</span>
                </div>

                {billingCycle === 'yearly' && (
                  <p className="text-xs text-green-500 font-bold mb-6">
                    Economia de R$ {((basePrice * 12) - (displayPrice * 12)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
                  </p>
                )}
                {billingCycle === 'monthly' && (
                  <div className="h-4 mb-6"></div> // Spacer to prevent jump
                )}

                <ul className="space-y-4 mb-8">
                  {plan.services?.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      <span className={`material-symbols-outlined text-lg ${isHighlight ? 'text-primary' : 'text-gray-400'}`}>check</span>
                      {feature}
                    </li>
                  ))}
                  {(!plan.services || plan.services.length === 0) && (
                    <li className="text-sm text-gray-400 italic">Sem recursos listados.</li>
                  )}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan, idx)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${isHighlight
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25'
                    : 'bg-gray-100 dark:bg-white/10 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                    }`}
                >
                  {loadingPlan === idx ? (
                    <>
                      <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      Carregando...
                    </>
                  ) : (isHighlight ? 'Testar por 7 dias' : 'Começar Agora')}
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