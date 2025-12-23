import React from 'react';

const SupportHub: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-primary rounded-3xl p-8 md:p-16 relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

          <div className="relative z-10 text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6">
              Você nunca estará <br className="md:hidden" /> Sozinho
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Contratar um software é fácil. Difícil é tirar o máximo proveito dele. Por isso, criamos um ecossistema completo de suporte para você.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'school',
                title: 'Pet Academy',
                desc: 'Acesso gratuito a mais de 50h de cursos sobre gestão, vendas e técnicas de tosa.',
                cta: 'Acessar Materiais',
                link: '#materiais',
                external: false
              },
              {
                icon: 'support_agent',
                title: 'Suporte Humanizado',
                desc: 'Nada de robôs. Fale com especialistas reais via Chat, WhatsApp ou Telefone.',
                cta: 'Falar com Suporte',
                link: 'https://api.whatsapp.com/send?phone=5554981273136',
                external: true
              },
              {
                icon: 'forum',
                title: 'Comunidade VIP',
                desc: 'Entre para o nosso grupo exclusivo e troque experiências com outros 3.000 donos de Pet Shop.',
                cta: 'Entrar no Grupo',
                link: 'https://whatsapp.com',
                external: true
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl transition-transform hover:-translate-y-2 flex flex-col">
                <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                  {item.desc}
                </p>
                <a 
                  href={item.link}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="text-sm font-black uppercase tracking-wide text-primary hover:text-primary-dark flex items-center gap-2 group mt-auto"
                >
                  {item.cta}
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportHub;