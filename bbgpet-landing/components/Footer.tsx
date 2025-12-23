import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    // Simula API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      // Reseta estado após 3 segundos
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <footer className="bg-white dark:bg-black pt-20 pb-10 border-t border-gray-100 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-[18px] font-bold">pets</span>
              </div>
              <h2 className="text-xl font-black tracking-tighter uppercase italic text-black dark:text-white">
                FLOW <span className="text-primary">PET</span>
              </h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Transformando a gestão de pet shops com tecnologia de ponta e design intuitivo. Seu negócio, simplificado.
            </p>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'linkedin', 'youtube_activity'].map((social) => (
                <a key={social} href="javascript:void(0)" className="text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">{social === 'instagram' ? 'photo_camera' : social}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="font-bold text-black dark:text-white uppercase tracking-wider mb-6">Produto</h3>
            <ul className="space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              {['Funcionalidades', 'Integrações', 'Preços', 'Atualizações', 'Roadmap'].map((item) => (
                <li key={item}>
                  <a href="javascript:void(0)" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-bold text-black dark:text-white uppercase tracking-wider mb-6">Empresa</h3>
            <ul className="space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              {['Sobre Nós', 'Carreiras', 'Blog', 'Contato', 'Imprensa'].map((item) => (
                <li key={item}>
                  <a 
                    href={item === 'Contato' ? "https://api.whatsapp.com/send?phone=5554981273136" : "javascript:void(0)"}
                    target={item === 'Contato' ? "_blank" : undefined}
                    rel={item === 'Contato' ? "noopener noreferrer" : undefined}
                    className="hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-bold text-black dark:text-white uppercase tracking-wider mb-6">Fique por dentro</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Receba dicas de gestão e novidades do sistema mensalmente.
            </p>
            
            {status === 'success' ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Inscrição confirmada!
              </div>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail" 
                  required
                  className="w-full bg-subtle dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
                <button 
                  type="submit"
                  disabled={status === 'submitting'}
                  className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wide text-sm py-3 rounded-lg hover:bg-primary dark:hover:bg-primary hover:text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {status === 'submitting' ? (
                    <span className="size-4 border-2 border-white/30 dark:border-black/30 border-t-current rounded-full animate-spin"></span>
                  ) : 'Inscrever-se'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Flow Pet Inc. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-wide text-gray-400">
            <a href="javascript:void(0)" className="hover:text-black dark:hover:text-white transition-colors">Privacidade</a>
            <a href="javascript:void(0)" className="hover:text-black dark:hover:text-white transition-colors">Termos</a>
            <a href="javascript:void(0)" className="hover:text-black dark:hover:text-white transition-colors">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;