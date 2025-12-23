
import { RolePermission } from './types';

export const DEFAULT_ROLES: RolePermission[] = [
    {
        id: 'admin',
        name: 'Administrador',
        description: 'Acesso total a todos os módulos e configurações do sistema.',
        usersCount: 2,
        permissions: {
            dashboard: true, userDashboard: false, schedule: true, execution: true, pos: true,
            clients: true, inventory: true, finance: true, team: true,
            communication: true, services: true, subscriptions: true, reports: true, settings: true, database: true, delivery: true
        }
    },
    {
        id: 'manager',
        name: 'Gerente',
        description: 'Gestão operacional e financeira, sem acesso a configurações críticas.',
        usersCount: 1,
        permissions: {
            dashboard: true, userDashboard: false, schedule: true, execution: true, pos: true,
            clients: true, inventory: true, finance: true, team: true,
            communication: true, services: true, subscriptions: true, reports: true, settings: false, database: false, delivery: true
        }
    },
    {
        id: 'vet',
        name: 'Veterinário',
        description: 'Foco no atendimento clínico, agenda e histórico de pacientes.',
        usersCount: 3,
        permissions: {
            dashboard: false, userDashboard: true, schedule: true, execution: true, pos: false,
            clients: true, inventory: true, finance: false, team: false,
            communication: true, services: false, subscriptions: false, reports: false, settings: false, database: false, delivery: false
        }
    },
    {
        id: 'groomer',
        name: 'Groomer',
        description: 'Acesso restrito à execução de serviços, agenda e clientes.',
        usersCount: 5,
        permissions: {
            dashboard: false, userDashboard: true, schedule: true, execution: true, pos: false,
            clients: true, inventory: false, finance: false, team: false,
            communication: true, services: false, subscriptions: false, reports: false, settings: false, database: false, delivery: false
        }
    },
    {
        id: 'recep',
        name: 'Recepcionista',
        description: 'Agendamento, cadastro de clientes, PDV e comunicação.',
        usersCount: 2,
        permissions: {
            dashboard: false, userDashboard: true, schedule: true, execution: false, pos: true,
            clients: true, inventory: false, finance: false, team: false,
            communication: true, services: true, subscriptions: true, reports: false, settings: false, database: false, delivery: true
        }
    }
];

export const DOG_BREEDS = [
    'SRD (Sem Raça Definida)',
    'Akita',
    'Basset Hound',
    'Beagle',
    'Bernese',
    'Bichon Frisé',
    'Border Collie',
    'Boxer',
    'Bulldog Francês',
    'Bulldog Inglês',
    'Bull Terrier',
    'Cane Corso',
    'Chihuahua',
    'Chow Chow',
    'Cocker Spaniel',
    'Dachshund (Salsicha)',
    'Dálmata',
    'Doberman',
    'Dogue Alemão',
    'Fila Brasileiro',
    'Golden Retriever',
    'Husky Siberiano',
    'Jack Russell Terrier',
    'Labrador Retriever',
    'Lhasa Apso',
    'Lulu da Pomerânia (Spitz)',
    'Maltês',
    'Mastiff',
    'Pastor Alemão',
    'Pastor Australiano',
    'Pastor Belga',
    'Pequinês',
    'Pinscher',
    'Pit Bull',
    'Poodle (Toy/Mini/Médio/Grande)',
    'Pug',
    'Rottweiler',
    'Samoieda',
    'São Bernardo',
    'Schnauzer',
    'Shar Pei',
    'Shiba Inu',
    'Shih Tzu',
    'Staffordshire Bull Terrier',
    'Terra Nova',
    'Weimaraner',
    'Whippet',
    'Yorkshire Terrier',
    'Outra'
];

export const CAT_BREEDS = [
    'SRD (Sem Raça Definida)',
    'Abissínio',
    'Angorá Turco',
    'Azul Russo',
    'Bengal',
    'Bobtail Americano',
    'Bombaim',
    'British Shorthair',
    'Burmês',
    'Chartreux',
    'Cornish Rex',
    'Devon Rex',
    'Exótico',
    'Himalaio',
    'LaPerm',
    'Maine Coon',
    'Manx',
    'Mau Egípcio',
    'Munchkin',
    'Norueguês da Floresta',
    'Ocicat',
    'Oriental Shorthair',
    'Persa',
    'Ragdoll',
    'Sagrado da Birmânia',
    'Savannah',
    'Scottish Fold',
    'Siamês',
    'Siberiano',
    'Singapura',
    'Snowshoe',
    'Somali',
    'Sphynx',
    'Tonquinês',
    'Outra'
];

