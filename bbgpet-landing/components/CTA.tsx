import React from 'react';

interface CTAProps {
  data?: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  };
}

const CTA: React.FC<CTAProps> = ({ data }) => {
  const title = data?.title || 'Pronto para evoluir?';
  const buttonText = data?.buttonText || 'Acessar Demonstração';
  const buttonLink = data?.buttonLink || 'https://flowpetdemo.com.br/';

  return (
    <section className="py-20 bg-white dark:bg-black border-t border-gray-100 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 text-black dark:text-white transition-colors duration-300">
          {title}
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-full text-lg font-black uppercase tracking-wide shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:scale-105"
          >
            {buttonText}
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=5554981273136"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mt-4 sm:mt-0 sm:ml-6 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">chat</span>
            Fale com vendas
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;