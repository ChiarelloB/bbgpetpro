import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PawPrint, ArrowRight, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';

interface LoginViewProps {
  petShopName: string;
  petShopId: string;
  onLogin: (user: any) => void;
  onBack: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ petShopName, petShopId, onLogin, onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError('Email ou senha incorretos');
      setIsLoading(false);
      return;
    }

    // Check if user is registered as client for this pet shop
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', petShopId)
      .eq('email', email)
      .single();

    if (!clientData) {
      // Create client record for this pet shop
      await supabase.from('clients').insert({
        tenant_id: petShopId,
        name: data.user?.user_metadata?.name || email.split('@')[0],
        email: email,
        phone: data.user?.user_metadata?.phone || null
      });
    }

    onLogin(data.user);
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        }
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // Create client record
    await supabase.from('clients').insert({
      tenant_id: petShopId,
      name,
      email,
      phone
    });

    onLogin(data.user);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 relative animate-[fadeIn_0.5s_ease-out]">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 p-2 bg-white/5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-neon mb-6 rotate-3 transition-transform hover:rotate-6">
        <PawPrint size={40} className="text-white" fill="currentColor" />
      </div>

      <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1">
        {petShopName}
      </h1>
      <p className="text-white/40 text-sm mb-8 text-center">
        {mode === 'login' ? 'Entre para agendar serviços' : 'Crie sua conta'}
      </p>

      {error && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center mb-4">
          {error}
        </div>
      )}

      <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="w-full space-y-4 z-10">
        {mode === 'register' && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">Nome</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">Telefone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">Senha</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {mode === 'login' && (
          <div className="flex justify-end">
            <button type="button" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
              Esqueci minha senha
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-wide hover:bg-indigo-500 transition-all shadow-neon flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              {mode === 'login' ? 'Entrar' : 'Criar Conta'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-white/40">
        {mode === 'login' ? (
          <>Não tem conta? <button onClick={() => setMode('register')} className="text-indigo-400 font-bold hover:underline">Criar agora</button></>
        ) : (
          <>Já tem conta? <button onClick={() => setMode('login')} className="text-indigo-400 font-bold hover:underline">Entrar</button></>
        )}
      </p>
    </div>
  );
};