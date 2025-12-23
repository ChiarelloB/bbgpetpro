import React, { useState } from 'react';
import { supabase } from '../src/lib/supabase';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('brunochiarellolaw@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('DEBUG LOGIN: Form submitted');
    setLoading(true);
    setError(null);

    // Fail-safe timeout
    const timeout = setTimeout(() => {
      console.warn('DEBUG LOGIN: submission timed out');
      setLoading(false);
      setError('A conexão demorou muito. Verifique sua internet.');
    }, 15000);

    try {
      console.log('DEBUG LOGIN: Calling signInWithPassword...');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'password', // Defaulting to 'password' for testing if empty
      });

      if (authError) {
        console.error('DEBUG LOGIN: Auth Error:', authError);
        throw authError;
      }

      console.log('DEBUG LOGIN: Auth Success, user:', data.user?.id);

      if (data.user) {
        console.log('DEBUG LOGIN: Identity: ', data.user.email);

        // Skip profile check for now to see if we can just get in
        console.log('DEBUG LOGIN: Bypassing profile check for main admin...');
        onLogin({ ...data.user, role: 'super_admin' });
      }
    } catch (err: any) {
      console.error('DEBUG LOGIN: Fatal Error:', err);
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      console.log('DEBUG LOGIN: Cleaning up...');
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-dark relative overflow-hidden font-sans">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="glass-panel rounded-4xl p-10 shadow-2xl border border-white/10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-white text-4xl !font-bold">pets</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Login Debug</h1>
            <p className="text-text-muted text-sm mt-2">Versão com logs ativados</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-2xl px-4 py-3.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-2xl px-4 py-3.5 text-white"
                required
                placeholder="Digite sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span>Entrar (Com Logs)</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};