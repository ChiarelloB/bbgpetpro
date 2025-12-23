import React from 'react';
import SpotlightCard from './SpotlightCard';

interface FeaturesProps {
  data?: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
}

const defaultFeatures = [
  {
    icon: 'groups',
    title: 'Gestão de Clientes',
    desc: 'Histórico completo dos pets, preferências e alertas de vacinação automáticos.'
  },
  {
    icon: 'calendar_month',
    title: 'Agendamento',
    desc: 'Agenda inteligente drag-and-drop. Evite conflitos e reduza faltas com lembretes.'
  },
  {
    icon: 'local_shipping',
    title: 'Delivery Tracking',
    desc: 'Controle total da frota de busca e entrega. Rastreamento em tempo real para tutores.'
  },
  {
    icon: 'palette',
    title: 'Marca Própria',
    desc: 'App do Cliente (White Label). Personalize cores, logos e funcionalidades para seus tutores.'
  }
];

const Features: React.FC<FeaturesProps> = ({ data }) => {
  const title = data?.title || 'Tudo o que você precisa. Nada que atrapalhe.';
  const items = data?.items?.map(item => ({
    icon: item.icon,
    title: item.title,
    desc: item.description
  })) || defaultFeatures;

  return (
    <section className="py-24 bg-white dark:bg-black relative transition-colors duration-300" id="funcionalidades">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6 transition-colors duration-300">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">
            Ferramentas poderosas integradas em uma interface intuitiva, projetada para a velocidade do dia a dia no pet shop.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((feature, idx) => (
            <SpotlightCard key={idx} className="group p-8">
              <div className="size-14 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-primary shadow-sm mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tight mb-3 text-black dark:text-white group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {feature.desc}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;