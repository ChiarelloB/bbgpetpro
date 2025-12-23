export interface Vaccine {
  id: string;
  name: string;
  date: string;
  status: 'valid' | 'expiring' | 'expired';
}

export interface MedicalAlert {
  id: string;
  type: 'allergy' | 'condition';
  label: string;
  severity: 'high' | 'medium' | 'low';
}

export interface PetStats {
  weight: number;
  sex: 'male' | 'female';
  size: 'P' | 'M' | 'G' | 'GG';
}

export interface PetProfile {
  id: string;
  name: string;
  breed: string;
  age: number; // in years
  imageUrl: string;
  stats: PetStats;
  vaccines: Vaccine[];
  alerts: MedicalAlert[];
  preferences: {
    food: string;
    behavior: string[];
  };
  nextAppointment: {
    title: string;
    date: string;
    time: string;
    type: 'bath' | 'vet' | 'grooming';
  } | null;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'bath' | 'vet' | 'grooming' | 'vaccine';
  petId: string;
  petName: string;
  status: 'upcoming' | 'completed';
  completed?: boolean; // New field to track checkbox state
}