import React from 'react';
import { ChevronLeft, Bell, PawPrint } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onNotificationsClick?: () => void;
  appName?: string;
  logoUrl?: string;
  showShopName?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBack,
  onNotificationsClick,
  appName = 'FLOW PET PRO',
  logoUrl,
  showShopName = true
}) => {
  return (
    <header className="flex justify-between items-center px-6 pt-8 pb-4 sticky top-0 z-50 backdrop-blur-xl bg-dark-900/80 transition-all duration-300 border-b border-white/5">
      {showBack ? (
        <>
          <div className="w-10 h-10 flex items-center justify-start">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors text-white/80 hover:bg-white/5 -ml-2"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          <h1 className="text-sm font-bold uppercase tracking-widest text-white/90 animate-fade-in absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        </>
      ) : (
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-neon overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <PawPrint size={20} className="text-white" fill="currentColor" />
            )}
          </div>

          {/* Brand Text */}
          {showShopName && (
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-black italic tracking-tighter leading-none text-white uppercase">
                {appName}
              </h1>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onNotificationsClick}
        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors text-white/80 relative hover:bg-white/5 -mr-2"
      >
        <Bell size={24} />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border border-dark-900 shadow-neon"></span>
      </button>
    </header>
  );
};