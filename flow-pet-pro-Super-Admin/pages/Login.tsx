import React, { useState } from 'react';
import { supabase } from '../src/lib/supabase';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@flowpet.pro');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Multi-tenant check: Get profile to verify role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const isMainAdmin = data.user.email === 'brunochiarellolaw@gmail.com';
        const isSuperAdmin = profile?.role === 'super_admin';

        if (isMainAdmin || isSuperAdmin) {
          // If it's the main admin but role is not set, we can implicitly trust it for this panel
          onLogin({ ...data.user, role: isSuperAdmin ? 'super_admin' : 'admin' });
        } else {
          await supabase.auth.signOut();
          throw new Error('Acesso restrito: Apenas administradores do sistema podem acessar este painel.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-dark relative overflow-hidden font-sans">
      {/* Background Ambient Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md p-8 relative z-10 animate-fade-in">
        <div className="glass-panel rounded-4xl p-8 md:p-10 shadow-2xl shadow-black/50 border border-white/10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6">
              <span className="material-symbols-outlined text-white text-4xl !font-bold">pets</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Flow Pet <span className="text-primary">PRO</span></h1>
            <p className="text-text-muted text-sm">Faça login para acessar o painel administrativo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Email Corporativo</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted group-focus-within:text-white transition-colors">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-0 text-white placeholder-text-muted/50"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Senha</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted group-focus-within:text-white transition-colors">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-0 text-white placeholder-text-muted/50"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">Esqueceu a senha?</a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group mt-4 relative overflow-hidden"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Entrar na Plataforma</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-text-muted">
              Ainda não tem acesso? <a href="#" className="text-white hover:text-primary font-bold transition-colors">Contate o suporte.</a>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-text-muted/50 mt-6 uppercase tracking-widest">
          Secure System • Flow Pet Inc. © 2024
        </p>
      </div>
    </div>
  );
};