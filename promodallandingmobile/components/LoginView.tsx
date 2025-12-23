import React, { useState } from 'react';
import { PawPrint, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 relative animate-[fadeIn_0.5s_ease-out]">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-neon mb-8 rotate-3 transition-transform hover:rotate-6">
        <PawPrint size={40} className="text-white" fill="currentColor" />
      </div>

      <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2">
        FLOW PET <span className="text-indigo-500">PRO</span>
      </h1>
      <p className="text-white/40 text-sm mb-12 text-center max-w-[200px]">
        Gerencie a vida do seu pet com estilo e precisão.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4 z-10">
        <div className="space-y-1">
            <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
            />
        </div>

        <div className="space-y-1">
            <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
            />
        </div>

        <div className="flex justify-end">
            <button type="button" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                Esqueci minha senha
            </button>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-wide hover:bg-indigo-500 transition-all shadow-neon flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              Entrar
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-xs text-white/30">
        Não tem uma conta? <button className="text-white font-bold hover:underline">Criar agora</button>
      </p>
    </div>
  );
};