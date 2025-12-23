import React from 'react';
import { PetStats } from '../types';

interface StatsGridProps {
  stats: PetStats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Weight */}
      <div className="bg-glass-bg border border-glass-border rounded-[24px] p-4 flex flex-col items-center justify-center backdrop-blur-md">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Peso</p>
        <p className="text-lg font-black text-white">
          {stats.weight} <span className="text-xs text-white/50 font-normal">kg</span>
        </p>
      </div>

      {/* Sex */}
      <div className="bg-glass-bg border border-glass-border rounded-[24px] p-4 flex flex-col items-center justify-center backdrop-blur-md">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Sexo</p>
        {/* Using a custom SVG for gender symbol if needed, but simple Material Icon logic works or text */}
        <div className="text-indigo-400">
             {/* Simple Male Symbol SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="14" r="5" />
                <path d="M16 3l5 5" />
                <path d="M21 3v6" />
                <path d="M21 3h-6" />
            </svg>
        </div>
      </div>

      {/* Size */}
      <div className="bg-glass-bg border border-glass-border rounded-[24px] p-4 flex flex-col items-center justify-center backdrop-blur-md">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Porte</p>
        <p className="text-lg font-black text-white">{stats.size}</p>
      </div>
    </div>
  );
};