import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 flex justify-center animate-[fadeInUp_0.5s_ease-out]">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl p-6 max-w-2xl w-full flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">cookie</span>
            <h4 className="font-bold text-black dark:text-white">Nós valorizamos sua privacidade</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Utilizamos cookies para melhorar sua experiência e oferecer conteúdo personalizado. Ao continuar navegando, você concorda com nossa Política de Privacidade.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsVisible(false)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Agora não
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;