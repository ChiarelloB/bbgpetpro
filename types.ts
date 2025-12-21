
export type ScreenType =
  | 'login'
  | 'dashboard'
  | 'userDashboard'
  | 'schedule'
  | 'execution'
  | 'pos'
  | 'clients'
  | 'petProfile'
  | 'inventory'
  | 'finance'
  | 'team'
  | 'communication'
  | 'services'
  | 'subscriptions'
  | 'reports'
  | 'roadmap'
  | 'settings'
  | 'database'
  | 'delivery';

export interface NavItem {
  id: ScreenType;
  label: string;
  icon: string;
}

export interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  colorClass?: string;
}

export interface Permissions {
  dashboard: boolean;
  userDashboard: boolean;
  schedule: boolean;
  execution: boolean;
  pos: boolean;
  clients: boolean;
  inventory: boolean;
  finance: boolean;
  team: boolean;
  communication: boolean;
  services: boolean;
  subscriptions: boolean;
  reports: boolean;
  settings: boolean;
  database: boolean;
  delivery: boolean;
}

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: Permissions;
}

export interface Appointment {
  id: string;
  resourceId: string;
  clientName: string;
  petName: string;
  service: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "HH:MM"
  duration: number; // minutes
  status: 'confirmed' | 'pending' | 'completed' | 'in-progress' | 'ready' | 'finished' | 'cancelled';
  notes?: string;
  professional?: string;
  pet_id?: string;
  client_id?: string;
  delivery_status?: string;
  current_step?: number;
  checklist_state?: string[];
}
