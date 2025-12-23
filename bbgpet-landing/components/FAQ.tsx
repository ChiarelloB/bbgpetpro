import React, { useState } from 'react';

const faqs = [
  {
    question: "Preciso instalar algum programa?",
    answer: "Não! O Flow Pet CRM é 100% online. Você acessa pelo navegador do seu computador, tablet ou celular, de qualquer lugar."
  },
  {
    question: "Consigo migrar dados de outro sistema?",
    answer: "Sim, nossa equipe de suporte auxilia na importação dos seus dados de clientes e produtos para que você não comece do zero."
  },
  {
    question: "Tem contrato de fidelidade?",
    answer: "Não. Acreditamos na qualidade do nosso produto. Você pode cancelar a assinatura a qualquer momento sem multas."
  },
  {
    question: "Serve para clínicas veterinárias?",
    answer: "Com certeza. Temos módulos específicos para prontuários, receitas e controle de vacinas integrados à agenda."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-center mb-12 text-black dark:text-white">
          Dúvidas <span className="text-primary">Frequentes</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 bg-subtle dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left"
              >
                <span className="font-bold text-lg text-black dark:text-white">{faq.question}</span>
                <span className={`material-symbols-outlined transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''} text-gray-400`}>
                  keyboard_arrow_down
                </span>
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 bg-subtle dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;