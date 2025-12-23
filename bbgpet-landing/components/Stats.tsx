import React from 'react';

const stats = [
  { label: 'Pet Shops Ativos', value: '30+', icon: 'storefront' },
  { label: 'Agendamentos/Mês', value: '150k+', icon: 'calendar_today' },
  { label: 'Economia Gerada', value: 'R$ 2M+', icon: 'savings' },
  { label: 'Satisfação', value: '4.9/5', icon: 'favorite' },
];

const Stats: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50 dark:bg-white/5 border-y border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center group">
              <div className="mb-3 text-primary/50 group-hover:text-primary transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">{stat.icon}</span>
              </div>
              <h4 className="text-3xl md:text-4xl font-black tracking-tighter text-black dark:text-white mb-1">
                {stat.value}
              </h4>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;