import React from 'react';
import { Heart, Utensils, Brain } from 'lucide-react';

interface PreferencesProps {
  preferences: {
    food: string;
    behavior: string[];
  };
}

export const Preferences: React.FC<PreferencesProps> = ({ preferences }) => {
  return (
    <div className="bg-glass-bg border border-glass-border rounded-3xl p-6 backdrop-blur-md mb-8">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-5">
        <Heart className="text-indigo-400" size={24} fill="currentColor" />
        Preferências
      </h3>
      
      <div className="space-y-4">
        {/* Food */}
        <div className="bg-dark-800/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-indigo-300">
            <Utensils size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">Alimentação</span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed font-light">
            {preferences.food}
          </p>
        </div>

        {/* Behavior */}
        <div className="bg-dark-800/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-indigo-300">
            <Brain size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">Comportamento</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferences.behavior.map((tag, idx) => {
              const isWarning = tag.toLowerCase().includes('medo') || tag.toLowerCase().includes('agressivo');
              return (
                <span 
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    isWarning 
                      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                      : 'bg-white/10 text-white/80 border-white/5'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};