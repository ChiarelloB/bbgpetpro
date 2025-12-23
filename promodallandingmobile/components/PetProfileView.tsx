import React from 'react';
import { Hero } from './Hero';
import { StatsGrid } from './StatsGrid';
import { AppointmentCard } from './AppointmentCard';
import { HealthSection } from './HealthSection';
import { Preferences } from './Preferences';
import { PetProfile } from '../types';

interface PetProfileViewProps {
  pet: PetProfile;
  onEdit: (pet: PetProfile) => void;
  onScheduleVaccine?: () => void;
}

export const PetProfileView: React.FC<PetProfileViewProps> = ({ pet, onEdit, onScheduleVaccine }) => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <Hero pet={pet} onEdit={() => onEdit(pet)} />
      
      <StatsGrid stats={pet.stats} />
      
      <AppointmentCard appointment={pet.nextAppointment} />
      
      <HealthSection 
        vaccines={pet.vaccines}
        alerts={pet.alerts}
        onScheduleVaccine={onScheduleVaccine}
      />
      
      <Preferences preferences={pet.preferences} />
    </div>
  );
};