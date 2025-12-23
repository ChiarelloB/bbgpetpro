import React, { useState } from 'react';
import { Hero } from './Hero';
import { StatsGrid } from './StatsGrid';
import { AppointmentCard } from './AppointmentCard';
import { HealthSection } from './HealthSection';
import { Preferences } from './Preferences';
import { PetGalleryView } from './PetGalleryView';
import { PetProfile } from '../types';
import { User, Image } from 'lucide-react';

interface PetProfileViewProps {
  pet: PetProfile;
  onEdit: (pet: PetProfile) => void;
  onScheduleVaccine?: () => void;
  showVeterinary?: boolean;
  showGallery?: boolean;
}

export const PetProfileView: React.FC<PetProfileViewProps> = ({
  pet,
  onEdit,
  onScheduleVaccine,
  showVeterinary = true,
  showGallery = true
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'gallery'>('profile');

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      {/* Hero always visible */}
      <Hero pet={pet} onEdit={() => onEdit(pet)} />

      {/* Tab Switcher */}
      {showGallery && (
        <div className="flex gap-2 my-4 bg-white/5 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'profile'
              ? 'bg-indigo-500 text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
              }`}
          >
            <User size={18} />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'gallery'
              ? 'bg-indigo-500 text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
              }`}
          >
            <Image size={18} />
            Galeria
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'profile' ? (
        <div className="space-y-6">
          <StatsGrid stats={pet.stats} />
          <AppointmentCard appointment={pet.nextAppointment} />
          {showVeterinary && (
            <HealthSection
              vaccines={pet.vaccines}
              alerts={pet.alerts}
              onScheduleVaccine={onScheduleVaccine}
            />
          )}
          <Preferences preferences={pet.preferences} />
        </div>
      ) : (
        <PetGalleryView pet={pet} />
      )}
    </div>
  );
};