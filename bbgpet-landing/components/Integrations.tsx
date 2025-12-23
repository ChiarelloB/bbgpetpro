import React from 'react';

const integrations = [
  { name: 'WhatsApp', icon: 'chat', color: 'text-green-500' },
  { name: 'Google Agenda', icon: 'calendar_today', color: 'text-blue-500' },
  { name: 'Mercado Pago', icon: 'payments', color: 'text-blue-400' },
  { name: 'Nota Fiscal', icon: 'receipt_long', color: 'text-orange-500' },
  { name: 'Instagram', icon: 'photo_camera', color: 'text-pink-500' },
  { name: 'Mailchimp', icon: 'mail', color: 'text-yellow-500' },
  { name: 'Slack', icon: 'forum', color: 'text-purple-500' },
  { name: 'Stripe', icon: 'credit_card', color: 'text-indigo-500' },
  { name: 'Zoom', icon: 'video_camera_front', color: 'text-blue-600' },
  { name: 'Dropbox', icon: 'folder', color: 'text-blue-800' },
];

const Integrations: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-black overflow-hidden border-t border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Conectado ao seu ecossistema
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="flex animate-marquee whitespace-nowrap gap-16 py-4 group-hover:[animation-play-state:paused]">
          {[...integrations, ...integrations, ...integrations].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 cursor-default">
              <span className={`material-symbols-outlined text-4xl ${item.color}`}>{item.icon}</span>
              <span className="text-xl font-bold text-gray-400 dark:text-gray-500">{item.name}</span>
            </div>
          ))}
        </div>
        
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent z-10"></div>
      </div>
    </section>
  );
};

export default Integrations;