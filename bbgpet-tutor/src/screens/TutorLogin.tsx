import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const TutorLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-600 via-primary to-purple-700 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md animate-fade-in relative z-10">
                <div className="bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
                    <div className="text-center mb-10">
                        <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-white text-3xl">pets</span>
                        </div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                            Flow Pet <span className="text-primary">Tutor</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-2 text-sm uppercase tracking-widest">Portal do Cliente</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-white/5 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-white/5 border-0 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-500 text-xs font-bold p-4 rounded-xl text-center border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={isLoading}
                            className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar no Portal'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-slate-400 font-bold">
                        Ainda não tem acesso? <br />
                        <span className="text-primary">Contate seu pet shop para um convite.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
