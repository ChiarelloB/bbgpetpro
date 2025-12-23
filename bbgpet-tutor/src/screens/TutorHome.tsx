import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Pet {
    id: string;
    name: string;
    species: string;
    breed: string;
    photo_url?: string;
}

interface Appointment {
    id: string;
    pet_name: string;
    date: string;
    time: string;
    service: string;
    status: string;
}

export const TutorHome: React.FC<{ user: any }> = ({ user }) => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [livePet, setLivePet] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTutorData();
    }, []);

    const fetchTutorData = async () => {
        setLoading(true);
        try {
            // Fetch pets owned by the user
            // Note: Assuming a 'pets' table with 'owner_id' or 'client_id' matching authenticated user
            const { data: petData } = await supabase
                .from('pets')
                .select('*')
                .order('name');

            setPets(petData || []);

            // Fetch appointments
            const { data: appData } = await supabase
                .from('appointments')
                .select('*')
                .order('date', { ascending: true })
                .limit(5);

            setAppointments(appData || []);

            // Simulating a live tracking pet for the demo/implementation
            // In a real scenario, this would check for an active check-in
            const activeCheckin = appData?.find(a => a.status === 'in_progress');
            if (activeCheckin) {
                setLivePet({
                    name: activeCheckin.pet_name,
                    status: 'No Banho',
                    progress: 65,
                    startTime: '14:30'
                });
            } else {
                // Fake one for UI showcase if none exists
                setLivePet({
                    name: 'Max',
                    status: 'Secagem',
                    progress: 85,
                    startTime: '15:00'
                });
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => supabase.auth.signOut();

    if (loading) return null;

    return (
        <div className="pb-24 lg:pb-10 max-w-lg mx-auto min-h-screen relative">
            {/* Header */}
            <header className="p-6 flex justify-between items-center animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bem-vindo,</p>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">
                            {user.email.split('@')[0]}
                        </h2>
                    </div>
                </div>
                <button onClick={handleSignOut} className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined">logout</span>
                </button>
            </header>

            {/* Live Tracking Card */}
            {livePet && (
                <section className="px-6 mb-8 animate-fade-in delay-100">
                    <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-20 transform scale-150 rotate-12">
                            <span className="material-symbols-outlined text-[100px]">pets</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                                        Acompanhamento ao Vivo
                                    </span>
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                                        {livePet.name} <span className="text-primary italic tracking-normal">está sendo cuidado!</span>
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Etapa Atual</span>
                                    <span className="text-xs font-black uppercase tracking-widest text-primary">{livePet.status}</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${livePet.progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-3">
                                    <span className="text-[10px] font-bold text-slate-500">Início: {livePet.startTime}</span>
                                    <span className="text-[10px] font-bold text-slate-500">Estimativa: 45 min</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90">
                                <span className="material-symbols-outlined text-sm">photo_camera</span> Ver Fotos do Banho
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Actions */}
            <section className="px-6 mb-10 overflow-x-auto">
                <div className="flex gap-4">
                    <button className="flex-shrink-0 bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-100 dark:border-gray-800 flex flex-col items-center gap-3 min-w-[120px] shadow-sm hover:border-primary transition-all">
                        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined">add_circle</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Agendar</span>
                    </button>
                    <button className="flex-shrink-0 bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-100 dark:border-gray-800 flex flex-col items-center gap-3 min-w-[120px] shadow-sm hover:border-primary transition-all">
                        <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <span className="material-symbols-outlined">history</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Histórico</span>
                    </button>
                    <button className="flex-shrink-0 bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-100 dark:border-gray-800 flex flex-col items-center gap-3 min-w-[120px] shadow-sm hover:border-primary transition-all">
                        <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <span className="material-symbols-outlined">forum</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Suporte</span>
                    </button>
                </div>
            </section>

            {/* My Pets */}
            <section className="px-6 mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Meus Pets</h4>
                    <button className="text-[10px] font-black uppercase text-primary tracking-widest">Ver Todos</button>
                </div>
                <div className="space-y-4">
                    {pets.length > 0 ? pets.map(pet => (
                        <div key={pet.id} className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-slate-100 dark:border-gray-800 flex items-center gap-4 shadow-sm group hover:scale-[1.02] transition-all">
                            <div className="size-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                                {pet.photo_url ? (
                                    <img src={pet.photo_url} alt={pet.name} className="size-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-3xl text-slate-300">pets</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{pet.name}</h5>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{pet.breed || pet.species}</p>
                            </div>
                            <button className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )) : (
                        <div className="p-10 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[2rem] text-center">
                            <p className="text-slate-400 text-sm font-bold">Nenhum pet cadastrado.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Upcoming Appointments */}
            <section className="px-6 mb-24">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Próximos Agendamentos</h4>
                <div className="space-y-4">
                    {appointments.length > 0 ? appointments.map(app => (
                        <div key={app.id} className="bg-white dark:bg-[#111] p-6 rounded-3xl border-l-4 border-l-primary border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">{app.service}</span>
                                    <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{app.pet_name}</h5>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{app.time}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{new Date(app.date).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-slate-400">
                                <span className="material-symbols-outlined text-sm">location_on</span> Flow Pet PRO - Unidade Central
                            </div>
                        </div>
                    )) : (
                        <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-3xl text-center">
                            <p className="text-slate-400 text-sm font-bold">Nenhum agendamento futuro.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Bottom Nav Bar */}
            <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/90 dark:bg-[#151515]/90 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-2xl flex items-center justify-around px-4 z-50">
                <button className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-2xl font-black">home</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Início</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined text-2xl">calendar_month</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Agenda</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined text-2xl">pets</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Pets</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined text-2xl">person</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Perfil</span>
                </button>
            </nav>
        </div>
    );
};
