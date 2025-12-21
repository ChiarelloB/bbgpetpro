import React, { useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useNotification } from '../NotificationContext';

type AuthMode = 'login' | 'register' | 'forgot';

export const Login: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('Administrador');
  const [masterPassword, setMasterPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // AppContext will handle the redirect on session change
      } else if (mode === 'register') {
        if (masterPassword !== 'brunosraio') {
          throw new Error('Código de Convite incorreto. Registro não permitido.');
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName,
              role: role
            }
          }
        });
        if (error) throw error;
        showNotification('Conta criada! Por favor, verifique seu e-mail.', 'success');
        setMode('login');
      }
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#0f0529] font-sans">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-40 w-full lg:w-1/2 order-2 lg:order-1 transition-all duration-500">
        <div className="mx-auto w-full max-w-sm lg:w-96 flex flex-col gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">pets</span>
              <span className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">BBG CRM <span className="text-primary">PRO</span></span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
              {mode === 'login' && 'Bem-vindo'}
              {mode === 'register' && 'Criar Conta'}
              {mode === 'forgot' && 'Recuperar'}
            </h1>
            <p className="mt-2 text-slate-500 text-lg">
              {mode === 'login' && 'Acesse o painel para gerenciar seu negócio.'}
              {mode === 'register' && 'Comece a gerenciar seu Pet Shop hoje.'}
              {mode === 'forgot' && 'Enviaremos um link para seu email.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>

            {mode === 'register' && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-11 rounded-xl border-slate-200 bg-white py-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                      placeholder="João Silva"
                    />
                  </div>
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Nome da Empresa</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">store</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="block w-full pl-11 rounded-xl border-slate-200 bg-white py-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                      placeholder="Pet Shop Feliz"
                    />
                  </div>
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Cargo</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full rounded-xl border-slate-200 bg-white py-3.5 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  >
                    <option>Administrador</option>
                    <option>Gerente</option>
                    <option>Veterinário</option>
                    <option>Groomer</option>
                    <option>Recepcionista</option>
                  </select>
                </div>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Código de Convite (Obrigatório)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">badge</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      className="block w-full pl-11 rounded-xl border-slate-200 bg-white py-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                      placeholder="Insira o código de acesso"
                    />
                  </div>
                </div>
              </>
            )}



            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 rounded-xl border-slate-200 bg-white py-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  placeholder="contato@petshop.com"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Senha</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-slate-500 hover:text-primary">Esqueci a senha</button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 rounded-xl border-slate-200 bg-white py-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 text-sm font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-50">
              {isSubmitting ? 'Processando...' : (
                <>
                  {mode === 'login' && 'Entrar'}
                  {mode === 'register' && 'Cadastrar Grátis'}
                  {mode === 'forgot' && 'Enviar Link'}
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
            {mode === 'login' ? (
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Ainda não tem conta? <button onClick={() => setMode('register')} className="font-bold text-primary hover:underline">Cadastre-se</button>
              </p>
            ) : (
              <button onClick={() => setMode('login')} className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">arrow_back</span> Voltar para Login
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 order-1 lg:order-2 bg-purple-50">
        <img
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq7cJiX4JCI9QcLCFqVhU1_tQEfcNJNEPk21_RWFZ2pYpC6YpRsSLp57h3H4cJapL69ILTKwn-3oarMv8W68dySxxviw5D0pkBOal8FNv4LLNcuZoUsJmJKxHpg0FcF_pCyQ0TeqhJmYfPz_EbpNfMY_kWfEOyPIN80neHqEnv7_92vzZrqDoXFgi0Xz3dAgeGRWvasfcWDseY-Aly8bfkzTrHORIZB9aduXpDU9vMIsmFrvafTAPWzpRN3U3-ngkqOd07pXIUReg"
          alt="Pet shop management"
        />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
        <div className="absolute bottom-10 left-10 text-white max-w-lg animate-in slide-in-from-bottom-10 duration-700">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">Simplicidade e Eficiência</h2>
          <p className="text-lg font-medium opacity-90">Gestão completa para o seu pet shop, do agendamento ao controle financeiro.</p>
        </div>
      </div>
    </div>
  );
};