export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  COMPANIES = 'COMPANIES',
  PLANS = 'PLANS',
  EDITOR = 'EDITOR',
  SETTINGS = 'SETTINGS',
  // Placeholder views
  CRM = 'CRM',
  APP_TUTOR = 'APP_TUTOR',
  USERS = 'USERS',
  REPORTS = 'REPORTS'
}

export interface MenuItem {
  id: ViewState;
  label: string;
  icon: string;
  section: 'Geral' | 'Sistema';
}