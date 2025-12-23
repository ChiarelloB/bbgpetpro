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
  const [loading, setLoading] = useState(false); // DEFAULT TO FALSE FOR DEBUG

  console.log('DEBUG: App Rendering - User:', user, 'Loading:', loading);

  useEffect(() => {
    console.log('DEBUG: App Mounted');

    async function checkUser() {
      try {
        console.log('DEBUG: Fetching session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('DEBUG: Session result:', session?.user?.email || 'No session');

        if (session?.user) {
          setUser({ ...session.user, role: 'super_admin' });
        }
      } catch (err) {
        console.error('DEBUG: checkUser error:', err);
      } finally {
        console.log('DEBUG: Ending checkout');
        setLoading(false);
      }
    }

    checkUser();
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
      case ViewState.DASHBOARD: return <Dashboard />;
      case ViewState.CRM: return <CRM />;
      case ViewState.COMPANIES: return <Companies />;
      case ViewState.PLANS: return <Plans />;
      case ViewState.EDITOR: return <Editor />;
      case ViewState.SETTINGS: return <Settings />;
      case ViewState.APP_TUTOR: return <AppTutor />;
      case ViewState.USERS: return <Users />;
      case ViewState.REPORTS: return <Reports />;
      default: return <div>Em construção</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background-dark text-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Carregando debug...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col lg:flex-row bg-background-dark text-text-main relative font-sans">
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
      <main className="flex-1 h-full overflow-y-auto p-4 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;