import React, { useState, useEffect } from 'react';

const ExitIntent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if mouse leaves top of window (intent to close tab/browser)
      if (e.clientY <= 0 && !hasShown) {
        const alreadyDismissed = sessionStorage.getItem('exit-intent-dismissed');
        if (!alreadyDismissed) {
          setIsVisible(true);
          setHasShown(true);
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isVisible) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('exit-intent-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-[fadeIn_0.3s_ease-out]"
        onClick={handleClose}
      ></div>
      
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.3s_ease-out] border border-gray-100 dark:border-white/10">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="flex flex-col">
          {/* Header Image/Pattern */}
          <div className="h-32 bg-primary relative overflow-hidden flex items-center justify-center">
            {/* CSS Pattern instead of external image */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #0000 0, #0000 10px, #ffffff 10px, #ffffff 11px)'
            }}></div>
            
            <span className="material-symbols-outlined text-8xl text-white/20 absolute -bottom-4 -left-4 rotate-12">pets</span>
            <div className="text-center relative z-10 p-6">
              <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-1 rounded-sm mb-2 inline-block shadow-lg">Oferta Relâmpago</span>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                Espere! Não vá ainda.
              </h3>
            </div>
          </div>

          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-300 text-lg mb-6 leading-relaxed">
              Sabemos que você quer o melhor para o seu Pet Shop. Que tal testar o <strong>Plano Profissional</strong> com uma condição especial?
            </p>

            <div className="bg-gray-50 dark:bg-black/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 mb-8">
              <p className="text-sm font-bold text-gray-500 uppercase mb-1">Cupom Exclusivo ativado:</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black text-primary">30 DIAS GRÁTIS</span>
                <span className="text-xs text-gray-400 line-through">(era 7 dias)</span>
              </div>
            </div>

            <button className="w-full bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-wide py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 mb-4">
              Quero meus 30 dias grátis
            </button>
            
            <button 
              onClick={handleClose}
              className="text-xs font-bold uppercase text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Não, obrigado. Prefiro continuar perdendo vendas.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntent;