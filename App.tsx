import React, { useState, useEffect, Suspense } from 'react';
import { ScreenType, Permissions } from './types';
import { Sidebar } from './components/Sidebar';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider, useNotification } from './NotificationContext';
import { SecurityProvider, useSecurity } from './SecurityContext';
import { ResourceProvider } from './ResourceContext';
import { supabase } from './src/lib/supabase';
import { DEFAULT_ROLES } from './constants';

// Lazy load global components
const AICopilot = React.lazy(() => import('./components/AICopilot').then(module => ({ default: module.AICopilot })));
const CommandPalette = React.lazy(() => import('./components/CommandPalette').then(module => ({ default: module.CommandPalette })));
const MessageNotifications = React.lazy(() => import('./components/MessageNotifications').then(module => ({ default: module.MessageNotifications })));

// Lazy load screens
const Login = React.lazy(() => import('./screens/Login').then(module => ({ default: module.Login })));
const Dashboard = React.lazy(() => import('./screens/Dashboard').then(module => ({ default: module.Dashboard })));
const UserDashboard = React.lazy(() => import('./screens/UserDashboard').then(module => ({ default: module.UserDashboard })));
const Schedule = React.lazy(() => import('./screens/Schedule').then(module => ({ default: module.Schedule })));
const Clients = React.lazy(() => import('./screens/Clients').then(module => ({ default: module.Clients })));
const PetProfile = React.lazy(() => import('./screens/PetProfile').then(module => ({ default: module.PetProfile })));
const Inventory = React.lazy(() => import('./screens/Inventory').then(module => ({ default: module.Inventory })));
const Services = React.lazy(() => import('./screens/Services').then(module => ({ default: module.Services })));
const Finance = React.lazy(() => import('./screens/Finance').then(module => ({ default: module.Finance })));
const Team = React.lazy(() => import('./screens/Team').then(module => ({ default: module.Team })));
const Communication = React.lazy(() => import('./screens/Communication').then(module => ({ default: module.Communication })));
const Reports = React.lazy(() => import('./screens/Reports').then(module => ({ default: module.Reports })));
const Roadmap = React.lazy(() => import('./screens/Roadmap').then(module => ({ default: module.Roadmap })));
const Settings = React.lazy(() => import('./screens/Settings').then(module => ({ default: module.Settings })));
const Execution = React.lazy(() => import('./screens/Execution').then(module => ({ default: module.Execution })));
const POS = React.lazy(() => import('./screens/POS').then(module => ({ default: module.POS })));
const Database = React.lazy(() => import('./screens/Database').then(module => ({ default: module.Database })));
const Delivery = React.lazy(() => import('./screens/Delivery').then(module => ({ default: module.Delivery })));
const Subscriptions = React.lazy(() => import('./screens/Subscriptions').then(module => ({ default: module.Subscriptions })));

const LoadingScreen = () => (
  <div className="flex-1 h-full w-full flex flex-col items-center justify-center min-h-[50vh] bg-background-light dark:bg-[#111] transition-colors duration-300">
    <div className="relative w-24 h-32 flex flex-col items-center justify-center">
      {/* Paws animation sequence */}
      <span className="material-symbols-outlined text-primary text-3xl absolute bottom-0 left-2 opacity-0 animate-paw-1 -rotate-12">pets</span>
      <span className="material-symbols-outlined text-primary text-3xl absolute bottom-8 right-2 opacity-0 animate-paw-2 rotate-12">pets</span>
      <span className="material-symbols-outlined text-primary text-3xl absolute bottom-16 left-2 opacity-0 animate-paw-3 -rotate-12">pets</span>
      <span className="material-symbols-outlined text-primary text-3xl absolute bottom-24 right-2 opacity-0 animate-paw-4 rotate-12">pets</span>
    </div>
    <span className="mt-4 text-xs font-black text-primary uppercase tracking-[0.2em] animate-pulse">Carregando</span>

    <style>{`
      @keyframes pawWalk {
        0% { opacity: 0; transform: scale(0.8) translateY(10px); }
        20% { opacity: 1; transform: scale(1) translateY(0); }
        60% { opacity: 1; transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(0.9) translateY(-5px); }
      }
      .animate-paw-1 { animation: pawWalk 2s infinite; animation-delay: 0ms; }
      .animate-paw-2 { animation: pawWalk 2s infinite; animation-delay: 500ms; }
      .animate-paw-3 { animation: pawWalk 2s infinite; animation-delay: 1000ms; }
      .animate-paw-4 { animation: pawWalk 2s infinite; animation-delay: 1500ms; }
    `}</style>
  </div>
);

const AccessDenied = () => (
  <div className="flex-1 h-full flex flex-col items-center justify-center bg-background-light dark:bg-[#111] p-8 text-center animate-in fade-in duration-500">
    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-full mb-6">
      <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
    </div>
    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Acesso Restrito</h1>
    <p className="text-slate-500 dark:text-gray-400 max-w-md">
      Você não tem permissão para acessar este módulo. Contate o administrador do sistema se precisar de acesso.
    </p>
  </div>
);

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [communicationInitialType, setCommunicationInitialType] = useState<'client' | 'team'>('client');
  const [communicationInitialContact, setCommunicationInitialContact] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [posInitialState, setPosInitialState] = useState<any>(null);
  const { showNotification } = useNotification();
  const { user, signOut } = useSecurity();
  const [userProfile, setUserProfile] = useState({
    name: 'Usuário',
    role: 'Administrador',
    email: '',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM3kjadQTjMTHl9YC-OrGR8wbZYUqoOrwId5WQ7c2eyZomiQk05HuotL6zwyo6Z9Tr5P-wLbqRkvXJ4tfqjiuIyIJRMtI60gAaGhsmDbYvURZIWtzVvmBHOZTA-JhfziZkJiaZsO3kiG-01SxOfOajsZqvE8qPHg8m0ijjIFfFyzwhP-y1iG2BhKcEaK44Gpg2MMxv_x_m5TEoqZnmVJGCnHaw4ZCwyyusgRRLNTU8tgNXStlKIvVM24O-x_t-2WnpW99rwAs7oI'
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setUserProfile({
            name: data.name || user.email?.split('@')[0] || 'Usuário',
            role: data.role || 'Administrador',
            email: user.email || '',
            avatar: data.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM3kjadQTjMTHl9YC-OrGR8wbZYUqoOrwId5WQ7c2eyZomiQk05HuotL6zwyo6Z9Tr5P-wLbqRkvXJ4tfqjiuIyIJRMtI60gAaGhsmDbYvURZIWtzVvmBHOZTA-JhfziZkJiaZsO3kiG-01SxOfOajsZqvE8qPHg8m0ijjIFfFyzwhP-y1iG2BhKcEaK44Gpg2MMxv_x_m5TEoqZnmVJGCnHaw4ZCwyyusgRRLNTU8tgNXStlKIvVM24O-x_t-2WnpW99rwAs7oI'
          });

          // Navigate to dashboard if currently on login
          if (currentScreen === 'login') {
            const roleName = (data.role || 'Administrador').toLowerCase();
            const roleConfig = DEFAULT_ROLES.find(r => r.name.toLowerCase() === roleName) ||
              DEFAULT_ROLES.find(r => roleName.includes(r.name.toLowerCase()) || r.id === roleName);

            if (roleConfig && roleConfig.permissions.userDashboard && !roleConfig.permissions.dashboard) {
              setCurrentScreen('userDashboard');
            } else {
              setCurrentScreen('dashboard');
            }
          }
        }
      };
      fetchProfile();
    } else {
      setCurrentScreen('login');
    }
  }, [user]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (screen: ScreenType, state?: any) => {
    if (screen === 'communication') {
      setCommunicationInitialType(state?.type || 'client');
      setCommunicationInitialContact(state?.contact || null);
    }
    if (screen === 'pos') {
      setPosInitialState(state || null);
    } else {
      setPosInitialState(null);
    }
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
  };

  const handleLogin = (user: any) => {
    // This is now handled by the useEffect above
  };

  const handleLogout = async () => {
    await signOut();
    showNotification('Você saiu do sistema.', 'info');
    setCurrentScreen('login');
  };

  const handleUpdateProfile = (newProfile: any) => {
    setUserProfile(prev => ({ ...prev, ...newProfile }));
    showNotification('Perfil atualizado!', 'success');
  };

  // Helper to check access based on role
  const hasAccess = (screen: ScreenType) => {
    // Always allowed
    if (screen === 'login') return true;

    const roleName = userProfile.role.toLowerCase();
    // Find role config
    const roleConfig = DEFAULT_ROLES.find(r => r.name.toLowerCase() === roleName) ||
      DEFAULT_ROLES.find(r => roleName.includes(r.name.toLowerCase()) || r.id === roleName);

    const permissions: Permissions = roleConfig?.permissions || {
      dashboard: true,
      userDashboard: false,
      schedule: false,
      execution: false,
      pos: false,
      clients: false,
      inventory: false,
      finance: false,
      team: false,
      communication: false,
      services: false,
      subscriptions: false,
      reports: false,
      settings: false,
      database: false,
      delivery: false
    };

    // Special mappings
    if (screen === 'petProfile') return permissions.clients;
    if (screen === 'roadmap') return permissions.dashboard || permissions.userDashboard;

    // Check if screen is a direct permission key
    if (screen in permissions) {
      return permissions[screen as keyof Permissions];
    }

    return true;
  };

  const renderScreen = () => {
    // Check permission before rendering
    if (!hasAccess(currentScreen)) {
      return <AccessDenied />;
    }

    switch (currentScreen) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'userDashboard': return <UserDashboard onNavigate={handleNavigate} userProfile={userProfile} />;
      case 'schedule': return <Schedule onNavigate={handleNavigate} />;
      case 'execution': return <Execution onNavigate={handleNavigate} />;
      case 'pos': return <POS initialState={posInitialState} />;
      case 'clients': return <Clients onNavigate={handleNavigate} />;
      case 'petProfile': return <PetProfile />;
      case 'inventory': return <Inventory />;
      case 'services': return <Services />;
      case 'finance': return <Finance />;
      case 'subscriptions': return <Subscriptions />;
      case 'reports': return <Reports />;
      case 'team': return <Team onNavigate={handleNavigate} />;
      case 'communication': return <Communication initialType={communicationInitialType} initialContact={communicationInitialContact} userProfile={userProfile} />;
      case 'roadmap': return <Roadmap />;
      case 'settings': return <Settings userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />;
      case 'database': return <Database />;
      case 'delivery': return <Delivery />;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (currentScreen === 'login') {
    return (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#0f0529]"><LoadingScreen /></div>}>
        <Login onLogin={handleLogin} />
      </Suspense>
    );
  }

  const isFullHeightScreen = ['dashboard', 'schedule', 'execution', 'clients', 'petProfile', 'communication', 'roadmap', 'settings', 'pos', 'database', 'delivery'].includes(currentScreen);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#111] transition-colors duration-300 relative">
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        userProfile={userProfile}
      />

      <main className={`flex-1 h-screen flex flex-col ${isFullHeightScreen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-2 text-primary font-black italic uppercase">
            <span className="material-symbols-outlined">pets</span> BBG CRM <span className="text-primary font-black uppercase">PRO</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsCommandPaletteOpen(true)} className="text-slate-500">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-600 dark:text-gray-300 hover:text-primary transition-colors p-1"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>

        <Suspense fallback={<LoadingScreen />}>
          {renderScreen()}
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <AICopilot />
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={handleNavigate}
        />
        <MessageNotifications onNavigate={handleNavigate} />
      </Suspense>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SecurityProvider>
      <ThemeProvider>
        <NotificationProvider>
          <ResourceProvider>
            <AppContent />
          </ResourceProvider>
        </NotificationProvider>
      </ThemeProvider>
    </SecurityProvider>
  );
};

export default App;
