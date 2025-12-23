import React from 'react';

const Security: React.FC = () => {
  return (
    <section className="py-24 bg-subtle dark:bg-[#0f0f0f] border-y border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="text-xs font-bold uppercase tracking-wider">Segurança de Nível Bancário</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
              Seus dados, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                100% Protegidos
              </span>
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
              Sabemos que as informações dos seus clientes são o seu maior ativo. Por isso, investimos pesado em infraestrutura para que você nunca precise se preocupar.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Criptografia de Ponta a Ponta', desc: 'Todos os dados trafegam com segurança SSL de 256 bits, o mesmo padrão usado por bancos.', icon: 'lock' },
                { title: 'Backups Diários Automáticos', desc: 'Copiamos seus dados para servidores seguros todos os dias. Você nunca perde nada.', icon: 'cloud_sync' },
                { title: 'Conformidade com a LGPD', desc: 'Ferramentas prontas para você gerenciar o consentimento e dados dos seus clientes.', icon: 'gavel' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="size-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black dark:text-white text-lg">{item.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative flex justify-center">
            {/* Visual Abstract Representation of Security */}
            <div className="relative w-full max-w-md aspect-square">
              {/* Rotating Rings */}
              <div className="absolute inset-0 border-[40px] border-gray-100 dark:border-white/5 rounded-full"></div>
              <div className="absolute inset-8 border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-16 border border-dashed border-cyan-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
              
              {/* Center Shield */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl relative z-10 border border-gray-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-8xl text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-cyan-400">verified_user</span>
                  
                  {/* Floating Badges */}
                  <div className="absolute -top-6 -right-6 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg animate-bounce">
                    100% Seguro
                  </div>
                </div>
              </div>

              {/* Decorative particles */}
              <div className="absolute top-1/4 right-0 size-4 bg-blue-500 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute bottom-1/4 left-0 size-6 bg-cyan-400 rounded-full blur-md animate-pulse delay-75"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Security;