import React from 'react';

interface TestimonialsProps {
  data?: {
    title: string;
    items: Array<{
      name: string;
      role: string;
      text: string;
      avatar: string;
    }>;
  };
}

const defaultTestimonials = [
  {
    stars: 5,
    quote: '"O módulo de comunicação interna mudou nosso jogo. A recepção e o banho e tosa nunca estiveram tão sincronizados."',
    author: 'Marcos Costa',
    role: 'Dono da PetVip',
    initials: 'MC',
    bgColor: 'bg-gray-200 dark:bg-gray-700',
    textColor: 'text-gray-500 dark:text-gray-300'
  },
  {
    stars: 5,
    quote: '"Simplesmente o design mais bonito e funcional que já vi em um sistema. Parece que estou usando um app de ponta, não um sistema chato."',
    author: 'Ana Lima',
    role: 'Vet Care Center',
    initials: 'AL',
    bgColor: 'bg-primary',
    textColor: 'text-white',
    featured: true
  },
  {
    stars: 5,
    quote: '"O suporte é incrível e o rastreamento do delivery reduziu nossas reclamações a zero. Vale cada centavo."',
    author: 'Roberto Jr.',
    role: 'Mundo Animal',
    initials: 'RJ',
    bgColor: 'bg-gray-200 dark:bg-gray-700',
    textColor: 'text-gray-500 dark:text-gray-300'
  }
];

const Testimonials: React.FC<TestimonialsProps> = ({ data }) => {
  const title = data?.title || 'Quem usa, Recomenda';
  const items = data?.items?.map((item, idx) => ({
    stars: 5,
    quote: item.text,
    author: item.name,
    role: item.role,
    avatar: item.avatar,
    featured: idx === 1 // Make second item featured by default if it exists
  })) || defaultTestimonials;

  return (
    <section className="py-24 bg-subtle dark:bg-[#0f0f0f] transition-colors duration-300" id="depoimentos">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-center mb-16 text-black dark:text-white transition-colors duration-300">
          {title.includes('Recomenda') ? (
            <>Quem usa, <span className="text-primary">Recomenda</span></>
          ) : title}
        </h2>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {items.map((t: any, idx) => (
            <div
              key={idx}
              className={`bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col transition-all duration-300 hover:shadow-xl ${t.featured ? 'md:-translate-y-4 shadow-lg border-primary/20 ring-1 ring-primary/5' : 'shadow-sm'
                }`}
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-lg fill-current">star</span>
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 italic mb-6 flex-1 text-sm md:text-base leading-relaxed">
                {t.quote}
              </p>

              <div className="flex items-center gap-3">
                {t.avatar ? (
                  <img src={t.avatar} className="size-10 rounded-full object-cover border border-gray-100 dark:border-white/10" alt={t.author} />
                ) : (
                  <div className={`size-10 rounded-full flex items-center justify-center font-black ${t.bgColor || 'bg-gray-200'} ${t.textColor || 'text-gray-500'}`}>
                    {t.initials || t.author?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-black dark:text-white uppercase">{t.author}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;