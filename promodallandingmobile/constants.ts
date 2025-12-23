import { PetProfile, Appointment } from './types';

export const THOR_DATA: PetProfile = {
  id: 'thor-001',
  name: 'Thor',
  breed: 'Golden Retriever',
  age: 3,
  imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=662&auto=format&fit=crop',
  stats: {
    weight: 32.5,
    sex: 'male',
    size: 'G',
  },
  nextAppointment: {
    title: 'Banho Tropical',
    date: '24 Nov',
    time: '14:30h',
    type: 'bath',
  },
  vaccines: [
    {
      id: 'v1',
      name: 'V10 (Polivalente)',
      date: '10 Ago 2023',
      status: 'valid',
    },
    {
      id: 'v2',
      name: 'Antirrábica',
      date: 'Vence em 15 dias',
      status: 'expiring',
    },
  ],
  alerts: [
    { id: 'a1', type: 'allergy', label: 'Alergia a Frango', severity: 'high' },
    { id: 'a2', type: 'condition', label: 'Pele Sensível', severity: 'medium' },
  ],
  preferences: {
    food: 'Royal Canin Maxi Adult - 2x ao dia (Manhã e Noite). Gosta de sachê misturado.',
    behavior: ['Dócil', 'Brincalhão', 'Medo de Trovão'],
  },
};

export const LUNA_DATA: PetProfile = {
  id: 'luna-002',
  name: 'Luna',
  breed: 'Siamês',
  age: 2,
  imageUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?q=80&w=800&auto=format&fit=crop',
  stats: {
    weight: 4.2,
    sex: 'female',
    size: 'P',
  },
  nextAppointment: null,
  vaccines: [
    {
      id: 'v3',
      name: 'V4 (Felina)',
      date: '15 Set 2023',
      status: 'valid',
    },
  ],
  alerts: [],
  preferences: {
    food: 'Premier Gatos Castrados - À vontade. Adora patê de atum.',
    behavior: ['Independente', 'Dorme muito', 'Caçadora'],
  },
};

export const PETS = [THOR_DATA, LUNA_DATA];

export const APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    title: 'Banho Tropical',
    date: '24 Nov',
    time: '14:30h',
    type: 'bath',
    petId: 'thor-001',
    petName: 'Thor',
    status: 'upcoming',
    completed: false,
  },
  {
    id: 'apt-2',
    title: 'Vacina Anual',
    date: '02 Dez',
    time: '10:00h',
    type: 'vaccine',
    petId: 'luna-002',
    petName: 'Luna',
    status: 'upcoming',
    completed: false,
  },
  {
    id: 'apt-3',
    title: 'Tosa Higiênica',
    date: '15 Dez',
    time: '09:00h',
    type: 'grooming',
    petId: 'thor-001',
    petName: 'Thor',
    status: 'upcoming',
    completed: false,
  },
  // Add a past appointment for the "History" tab
  {
    id: 'apt-4',
    title: 'Consulta Rotina',
    date: '10 Out',
    time: '11:00h',
    type: 'vet',
    petId: 'thor-001',
    petName: 'Thor',
    status: 'completed',
    completed: true,
  }
];