import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenAdmin?: () => void;
  onOpenProfile?: () => void;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  tenant_id: string | null;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  invite_code: string | null;
}

interface Subscription {
  plan_name: string;
  status: string;
  plan_id?: string;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, onOpenAdmin, onOpenProfile }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loginError, setLoginError] = useState('');

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // CRM URL
  const CRM_URL = '/flowpetpro';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      }
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadUserData(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setTenant(null);
          setSubscription(null);
        }
      }
    );

    return () => authSubscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, tenant_id')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile(profileData);

      // Load tenant
      if (profileData.tenant_id) {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id, name, slug, invite_code')
          .eq('id', profileData.tenant_id)
          .single();

        if (tenantData) {
          setTenant(tenantData);
        }
      }
    }

    // Load subscription using tenant_id
    if (profileData?.tenant_id) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan_name, plan_id, status')
        .eq('tenant_id', profileData.tenant_id)
        .is('client_name', null)
        .eq('status', 'active')
        .maybeSingle();

      if (subData) {
        // Fetch plan info to get is_pro and real name
        let planData = null;

        if (subData.plan_id) {
          const { data } = await supabase
            .from('subscription_plans')
            .select('name, is_pro')
            .eq('id', subData.plan_id)
            .maybeSingle();
          planData = data;
        }

        if (!planData && subData.plan_name) {
          const { data } = await supabase
            .from('subscription_plans')
            .select('name, is_pro')
            .eq('name', subData.plan_name)
            .maybeSingle();
          planData = data;
        }

        // Fallback: detect PRO from plan name if RLS blocks
        const planName = (planData?.name || subData.plan_name || '').toLowerCase();
        const isPro = planData?.is_pro ||
          planName.includes('profissional') ||
          planName.includes('elite') ||
          planName.includes('pro');

        setSubscription({
          plan_name: planData?.name || subData.plan_name || (isPro ? 'PRO' : 'Free'),
          status: subData.status
        });
      } else {
        setSubscription({ plan_name: 'Free', status: 'active' });
      }
    } else {
      setSubscription({ plan_name: 'Free', status: 'active' });
    }
  };

  // Handle ESC key to close login modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLoginOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent scrolling when mobile menu or login modal is open
  useEffect(() => {
    if (mobileMenuOpen || isLoginOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen, isLoginOpen]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState('loading');
    setLoginError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setLoginState('error');
      setLoginError(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos'
        : error.message);
    } else {
      setLoginState('success');
      setTimeout(() => {
        setIsLoginOpen(false);
        setLoginState('idle');
        setEmail('');
        setPassword('');
      }, 1500);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setTenant(null);
    setSubscription(null);
  };

  const navLinks = ['Funcionalidades', 'Benefícios', 'Preços', 'Depoimentos', 'FAQ'];

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro': return 'text-primary';
      case 'enterprise': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <>
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
          ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10 py-4'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer relative z-50" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="size-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-full transition-transform group-hover:rotate-12">
                <span className="material-symbols-outlined text-[20px] font-bold">pets</span>
              </div>
              <h2 className="text-black dark:text-white text-xl font-black tracking-tighter uppercase italic">
                FLOW <span className="text-primary">PET</span>
              </h2>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                  className="text-sm font-bold uppercase tracking-tight text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Actions & Mobile Toggle */}
            <div className="flex items-center gap-4 relative z-50">
              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="Admin Panel"
                  title="Painel Admin"
                >
                  <span className="material-symbols-outlined block">admin_panel_settings</span>
                </button>
              )}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Toggle dark mode"
              >
                <span className="material-symbols-outlined block">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>

              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                      <div className="text-right hidden lg:block cursor-pointer" onClick={onOpenProfile}>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{profile?.full_name || user.email}</p>
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${getPlanColor(subscription?.plan_name || 'Free')}`}>
                          {tenant?.name || 'Carregando...'} • {subscription?.plan_name || 'Free'}
                        </p>
                      </div>
                      <div
                        onClick={onOpenProfile}
                        className="size-9 bg-gray-200 rounded-full overflow-hidden border-2 border-primary cursor-pointer flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="size-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-gray-500 text-lg">person</span>
                        )}
                      </div>
                    </div>
                    <a
                      href={CRM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-all shadow-lg shadow-primary/25"
                    >
                      Acessar CRM
                    </a>

                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                      title="Sair"
                    >
                      <span className="material-symbols-outlined">logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsLoginOpen(true)}
                      className="text-sm font-bold uppercase tracking-tight text-gray-900 dark:text-gray-300 hover:text-primary transition-colors"
                    >
                      Login
                    </button>
                    <a
                      href="https://flowpetdemo.com.br/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-black hover:text-white px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 transform hover:-translate-y-0.5"
                    >
                      Demonstração
                    </a>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-black dark:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="material-symbols-outlined text-3xl">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
      >
        <nav className="flex flex-col items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
          <div className="w-12 h-1 bg-gray-100 dark:bg-gray-800 rounded-full my-4"></div>

          {user ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="size-12 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
                  onClick={() => { setMobileMenuOpen(false); onOpenProfile?.(); }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="size-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-gray-500">person</span>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-black dark:text-white">{profile?.full_name || user.email}</p>
                  <p className={`text-xs font-bold uppercase ${getPlanColor(subscription?.plan_name || 'Free')}`}>
                    {tenant?.name} • {subscription?.plan_name || 'Free'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-8">

                <a
                  href={CRM_URL}
                  className="w-full py-4 bg-primary text-white rounded-2xl text-center font-bold shadow-lg shadow-primary/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Acessar CRM
                </a>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-gray-500 hover:text-gray-700"
              >
                Sair
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); setIsLoginOpen(true); }}
                className="text-lg font-bold uppercase text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Login
              </button>
              <a
                href="https://flowpetdemo.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-8 py-3 rounded-full text-lg font-black uppercase tracking-wide shadow-xl shadow-primary/30"
              >
                Ver Demo
              </a>
            </>
          )}
        </nav>
      </div>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
            onClick={() => setIsLoginOpen(false)}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl animate-[scaleIn_0.3s_ease-out] border border-gray-100 dark:border-white/10">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center size-12 bg-primary/10 rounded-full text-primary mb-4">
                <span className="material-symbols-outlined">pets</span>
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white">
                Acesse sua conta
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerencie seu Pet Shop de onde estiver.
              </p>
            </div>

            {loginState === 'success' ? (
              <div className="text-center py-8">
                <div className="size-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-[scaleIn_0.3s_ease-out]">
                  <span className="material-symbols-outlined text-3xl">check</span>
                </div>
                <p className="text-lg font-bold text-black dark:text-white">Bem-vindo(a)!</p>
                <p className="text-sm text-gray-500">Carregando seu painel...</p>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginState === 'error' && (
                  <div className="p-3 bg-red-100 text-red-600 text-sm rounded-xl">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-black dark:text-white"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-black dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                {/* Forgot password removed - not implemented */}
                <button
                  type="submit"
                  disabled={loginState === 'loading'}
                  className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-black uppercase tracking-wide py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loginState === 'loading' ? (
                    <>
                      <span className="size-4 border-2 border-white/30 dark:border-black/30 border-t-current rounded-full animate-spin"></span>
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Ainda não tem conta? <a href="#precos" onClick={() => setIsLoginOpen(false)} className="font-bold text-black dark:text-white hover:underline">Escolha um plano</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;