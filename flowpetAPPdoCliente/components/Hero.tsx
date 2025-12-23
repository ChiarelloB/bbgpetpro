import React from 'react';
import { Pencil } from 'lucide-react';
import { PetProfile } from '../types';

interface HeroProps {
  pet: PetProfile;
  onEdit?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ pet, onEdit }) => {
  return (
    <div className="flex flex-col items-center text-center mt-4">
      <div className="relative group cursor-pointer" onClick={onEdit}>
        {/* Glow effect behind image */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
        
        {/* Image Container */}
        <div className="relative w-36 h-36 p-1 rounded-full bg-gradient-to-b from-white/20 to-transparent">
          <img 
            src={pet.imageUrl} 
            alt={`Foto do ${pet.name}`} 
            className="w-full h-full object-cover rounded-full border-4 border-dark-900 shadow-2xl" 
          />
        </div>
        
        {/* Edit Button */}
        <button 
          onClick={(e) => {
             e.stopPropagation();
             onEdit && onEdit();
          }}
          className="absolute bottom-1 right-1 bg-dark-800/90 backdrop-blur text-indigo-400 p-2 rounded-full border border-indigo-500/30 shadow-lg hover:scale-110 transition-transform"
        >
          <Pencil size={16} />
        </button>
      </div>

      <div className="mt-5 space-y-1">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">
            {pet.name}
          </h2>
          {/* Active Status Indicator */}
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
        </div>
        <p className="text-white/50 font-medium text-sm">
          {pet.breed} • {pet.age} Anos
        </p>
      </div>
    </div>
  );
};