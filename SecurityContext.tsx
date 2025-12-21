
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { User } from '@supabase/supabase-js';

interface SecurityContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isDbUnlocked: boolean;
  setIsDbUnlocked: (unlocked: boolean) => void;
  dbPassword: string;
  setDbPassword: (pass: string) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDbUnlocked, setIsDbUnlocked] = useState(false);
  const [dbPassword, setDbPassword] = useState('admin123'); // Default master password

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  const value = {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isDbUnlocked,
    setIsDbUnlocked,
    dbPassword,
    setDbPassword
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
