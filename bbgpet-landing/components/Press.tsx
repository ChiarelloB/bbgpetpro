import React from 'react';

const Press: React.FC = () => {
  return (
    <section className="py-10 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Destaque em:</span>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 grayscale">
          {/* Simulated Logos using Typography for reliability */}
          <div className="flex items-center gap-1 group">
            <span className="material-symbols-outlined text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">pets</span>
            <span className="font-serif font-bold text-xl text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors">PetBusiness</span>
          </div>

          <div className="flex items-center gap-1 group">
             <span className="font-sans font-black text-xl tracking-tighter text-gray-600 dark:text-gray-300 group-hover:text-green-600 transition-colors">VET<span className="font-light">HOJE</span></span>
          </div>

          <div className="flex items-center gap-1 group">
            <span className="material-symbols-outlined text-gray-800 dark:text-white group-hover:text-orange-500 transition-colors">rocket</span>
            <span className="font-mono font-bold text-lg text-gray-600 dark:text-gray-300 group-hover:text-orange-500 transition-colors">StartPUP</span>
          </div>

          <div className="flex items-center gap-1 group">
             <span className="font-bold italic text-xl text-gray-600 dark:text-gray-300 border-2 border-gray-600 dark:border-gray-300 px-2 group-hover:border-primary group-hover:text-primary transition-colors">PEGN</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Press;