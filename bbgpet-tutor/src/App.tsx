import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { TutorLogin } from './screens/TutorLogin';
import { TutorHome } from './screens/TutorHome';

export default function App() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 font-black uppercase tracking-widest text-[10px] text-primary animate-pulse">Carregando</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300 font-sans selection:bg-primary/20">
            {!session ? (
                <TutorLogin />
            ) : (
                <TutorHome user={session.user} />
            )}
        </div>
    );
}
