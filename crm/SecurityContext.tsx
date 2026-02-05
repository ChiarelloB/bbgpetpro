
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { User } from '@supabase/supabase-js';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  settings: Record<string, any>;
  invite_code?: string;
  is_pro?: boolean;
  max_users?: number;
  subscription_status?: 'active' | 'expired' | 'none';
}

interface SecurityContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isDbUnlocked: boolean;
  setIsDbUnlocked: (unlocked: boolean) => void;
  dbPassword: string;
  setDbPassword: (pass: string) => void;
  tenant: Tenant | null;
  tenantId: string | null;
  hasActiveSubscription: boolean;
  isPro: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDbUnlocked, setIsDbUnlocked] = useState(false);
  const [dbPassword, setDbPassword] = useState('admin123'); // Default master password
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTenantInfo(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setTenant(null);
        setTenantId(null);
        setLoading(false);
        // Clear anything that might be stuck
        localStorage.removeItem('sb-ljtxdwishwopggrrxada-auth-token');
      } else if (session?.user) {
        setUser(session.user);
        fetchTenantInfo(session.user.id);
      } else {
        // Fallback for other states where session is null
        setUser(null);
        setTenant(null);
        setTenantId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTenantInfo = async (userId: string) => {
    try {
      // Get user's tenant_id from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userId)
        .single();

      if (profileError || !profile?.tenant_id) {
        console.warn('No tenant found for user, using default');
        setTenantId('00000000-0000-0000-0000-000000000001');
        setLoading(false);
        return;
      }

      setTenantId(profile.tenant_id);

      // Get tenant details
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      if (!tenantError && tenantData) {
        // Fetch active subscription for this tenant to get PRO status and limits
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('plan_name, status, next_billing')
          .eq('tenant_id', profile.tenant_id)
          .is('client_name', null)
          .maybeSingle();

        let isPro = false;
        let maxUsers = 1;
        let subscriptionStatus: 'active' | 'expired' | 'none' = 'none';

        if (subData) {
          // Check if subscription is expired
          const now = new Date();
          const nextBilling = subData.next_billing ? new Date(subData.next_billing) : null;

          if (subData.status === 'active' && (!nextBilling || nextBilling > now)) {
            subscriptionStatus = 'active';
            setHasActiveSubscription(true);
          } else {
            subscriptionStatus = 'expired';
            setHasActiveSubscription(false);
          }

          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('is_pro, max_users')
            .eq('name', subData.plan_name)
            .maybeSingle();

          // Fallback logic if plan data is missing or incomplete
          isPro = planData?.is_pro ||
            subData.plan_name?.toLowerCase().includes('profissional') ||
            subData.plan_name?.toLowerCase().includes('elite') ||
            subData.plan_name?.toLowerCase().includes('pro') ||
            false;

          maxUsers = planData?.max_users || (isPro ? 30 : 1);
        } else {
          setHasActiveSubscription(false);
        }

        setTenant({
          ...tenantData,
          is_pro: isPro,
          max_users: maxUsers,
          subscription_status: subscriptionStatus
        });
      }
    } catch (err) {
      console.error('Error fetching tenant info:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    setTenant(null);
    setTenantId(null);
  };

  const value = {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isDbUnlocked,
    setIsDbUnlocked,
    dbPassword,
    setDbPassword,
    tenant,
    tenantId,
    hasActiveSubscription,
    isPro: tenant?.is_pro || false
  };

  return (
    <SecurityContext.Provider value={value}>
      {!loading && children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
