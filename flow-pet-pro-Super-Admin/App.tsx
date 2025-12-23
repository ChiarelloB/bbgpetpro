import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { Plans } from './pages/Plans';
import { Editor } from './pages/Editor';
import { Settings } from './pages/Settings';
import { AppTutor } from './pages/AppTutor';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { CRM } from './pages/CRM';
import { Login } from './pages/Login';
import { ViewState } from './types';
import { supabase } from './src/lib/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('App Rendering - User:', user, 'Loading:', loading);

  useEffect(() => {
    console.log('App Mounted - Checking session...');
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView(ViewState.DASHBOARD);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.CRM:
        return <CRM />;
      case ViewState.COMPANIES:
        return <Companies />;
      case ViewState.PLANS:
        return <Plans />;
      case ViewState.EDITOR:
        return <Editor />;
      case ViewState.SETTINGS:
        return <Settings />;
      case ViewState.APP_TUTOR:
        return <AppTutor />;
      case ViewState.USERS:
        return <Users />;
      case ViewState.REPORTS:
        return <Reports />;
      default:
        // Placeholder for unimplemented views
        return (
          <div className="flex flex-col items-center justify-center h-full text-text-muted animate-fade-in">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">construction</span>
            <h2 className="text-2xl font-bold text-white mb-2">Em Construção</h2>
            <p>O módulo {currentView} estará disponível em breve.</p>
            <button
              onClick={() => setCurrentView(ViewState.DASHBOARD)}
              className="mt-6 px-6 py-2 bg-primary rounded-full text-white text-sm font-bold"
            >
              Voltar para Dashboard
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col lg:flex-row bg-background-dark text-text-main selection:bg-primary selection:text-white relative font-sans animate-fade-in">
      {/* Background Ambient Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Mobile Header */}
      <div className="lg:hidden shrink-0 flex items-center justify-between p-4 border-b border-white/5 bg-surface-dark/50 backdrop-blur-md z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined text-white text-sm !font-bold">pets</span>
          </div>
          <span className="font-bold text-white tracking-tight">Flow Pet PRO</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 h-full overflow-y-auto z-10 relative scroll-smooth p-4 lg:p-8">
        {renderContent()}
      </main>

      {/* Logout button override for demo purposes */}
      <div className="fixed bottom-4 right-4 lg:hidden z-50">
        {/* This is just a fallback for mobile logout if not in sidebar */}
      </div>
    </div>
  );
}

export default App;