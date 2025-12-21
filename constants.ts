
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
