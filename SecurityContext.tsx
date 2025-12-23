
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
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDbUnlocked, setIsDbUnlocked] = useState(false);
  const [dbPassword, setDbPassword] = useState('admin123'); // Default master password
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTenantInfo(session.user.id);
      } else {
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
          .select('plan_name')
          .eq('tenant_id', profile.tenant_id)
          .is('client_name', null)
          .eq('status', 'active')
          .maybeSingle();

        let isPro = false;
        let maxUsers = 1;

        if (subData) {
          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('is_pro, max_users')
            .eq('name', subData.plan_name)
            .maybeSingle();

          isPro = planData?.is_pro || false;
          maxUsers = planData?.max_users || 1;
        }

        setTenant({
          ...tenantData,
          is_pro: isPro,
          max_users: maxUsers
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
    tenantId
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
