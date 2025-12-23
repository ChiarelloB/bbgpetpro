import React, { useState } from 'react';

const LeadGen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setStatus('submitting');
    
    // Simula envio
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setName('');
    }, 1500);
  };

  return (
    <section id="materiais" className="py-24 bg-primary relative overflow-hidden transition-colors duration-300">
      {/* CSS Pattern Background (No external images) */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 md:p-16 border border-white/10 flex flex-col md:flex-row items-center gap-12">
          
          <div className="md:w-1/2 text-center md:text-left">
            <span className="bg-yellow-400 text-black text-xs font-black uppercase px-3 py-1 rounded-full mb-4 inline-block shadow-lg">
              Material Gratuito
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6">
              7 Estratégias para <br/>
              Dobrar seu Lucro
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Ainda não está pronto para contratar o Flow Pet CRM? Sem problemas. Baixe nosso guia exclusivo e comece a otimizar sua gestão hoje mesmo com dicas práticas.
            </p>
            
            <ul className="text-white/90 space-y-3 mb-8 text-sm font-medium">
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="material-symbols-outlined text-yellow-400">check_circle</span>
                Como reduzir o No-Show em 50%
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="material-symbols-outlined text-yellow-400">check_circle</span>
                Técnicas de Upsell no Banho e Tosa
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="material-symbols-outlined text-yellow-400">check_circle</span>
                Planilha de fluxo de caixa inclusa
              </li>
            </ul>
          </div>

          <div className="md:w-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl transition-all duration-300">
            {status === 'success' ? (
              <div className="text-center py-12 animate-[fadeIn_0.5s_ease-out]">
                <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-black text-black dark:text-white mb-2">Sucesso!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  O guia foi enviado para o seu e-mail. Verifique sua caixa de entrada (e spam).
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="text-sm font-bold uppercase text-primary hover:underline"
                >
                  Baixar outro material
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-center text-black dark:text-white mb-6">
                  Receba o Guia no seu E-mail
                </h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Seu Nome</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-black dark:text-white"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Seu Melhor E-mail</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-black dark:text-white"
                      placeholder="joao@petshop.com"
                    />
                  </div>
                  <button 
                    disabled={status === 'submitting'}
                    className="w-full bg-black hover:bg-gray-800 dark:bg-black dark:hover:bg-gray-800 text-white font-black uppercase tracking-wide py-4 rounded-lg shadow-lg transition-transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'submitting' ? (
                      <>
                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Enviando...
                      </>
                    ) : (
                      'Baixar E-book Agora'
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    Prometemos não enviar spam. Seus dados estão seguros.
                  </p>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default LeadGen;