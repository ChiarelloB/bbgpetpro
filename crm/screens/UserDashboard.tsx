import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';

interface UserDashboardProps {
    onNavigate: (screen: ScreenType) => void;
    userProfile?: { name: string; role: string; avatar: string };
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate, userProfile }) => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        setLoading(true);

        // Fetch today's appointments for this professional (or all if admin)
        let query = supabase
            .from('appointments')
            .select(`
              *,
              pets (name, breed),
              clients (name)
          `)
            .order('start_time', { ascending: true })
            .limit(5);

        const isVet = userProfile?.role.toLowerCase().includes('veterinário');
        const isGroomer = userProfile?.role.toLowerCase().includes('groomer');

        if (isVet || isGroomer) {
            query = query.eq('professional', userProfile?.name);
        }

        const { data: appData, error: appError } = await query;

        if (!appError && appData) {
            setAppointments(appData.map(a => ({
                id: a.id,
                time: new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                petName: a.pets?.name,
                breed: a.pets?.breed,
                service: a.service,
                status: a.status
            })));
        }

        // Mock tasks integration (could be a 'tasks' table if implemented)
        setTasks([
            { id: 1, text: 'Confirmar agenda de amanhã', deadline: 'Prazo: 17:00', done: false },
            { id: 2, text: 'Limpar estação de trabalho', deadline: 'Concluído às 10:30', done: true },
            { id: 3, text: 'Reabastecer estoque de insumos', deadline: 'Estoque baixo', done: false },
        ]);

        setLoading(false);
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const toggleTask = (id: number) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
        const task = tasks.find(t => t.id === id);
        if (task && !task.done) {
            showNotification('Tarefa concluída!', 'success');
        }
    };

    const isVet = userProfile?.role.toLowerCase().includes('veterinário');
    const isGroomer = userProfile?.role.toLowerCase().includes('groomer');

    const greeting = userProfile?.name.split(' ')[0] || 'Usuário';

    const roleStats = isVet ? [
        { label: 'Consultas Hoje', value: appointments.filter(a => a.service.toLowerCase().includes('consulta')).length.toString(), icon: 'medical_services', color: 'blue' },
        { label: 'Vacinas', value: '3', icon: 'vaccines', color: 'purple' },
        { label: 'Urgências', value: '0', icon: 'warning', color: 'green' }
    ] : isGroomer ? [
        { label: 'Banhos Hoje', value: appointments.filter(a => a.service.toLowerCase().includes('banho')).length.toString(), icon: 'shower', color: 'blue' },
        { label: 'Tosas', value: appointments.filter(a => a.service.toLowerCase().includes('tosa')).length.toString(), icon: 'content_cut', color: 'purple' },
        { label: 'Finalizados', value: appointments.filter(a => a.status === 'completed').length.toString(), icon: 'check_circle', color: 'green' }
    ] : [
        { label: 'Agendamentos', value: appointments.length.toString(), icon: 'calendar_today', color: 'blue' },
        { label: 'Mensagens', value: '4', icon: 'chat', color: 'purple' },
        { label: 'Tarefas', value: tasks.filter(t => !t.done).length.toString(), icon: 'task_alt', color: 'green' }
    ];

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 animate-in fade-in duration-500 overflow-y-auto nike-scroll">
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black dark:text-white uppercase italic mb-2 leading-none">
                        Olá, <span className="text-primary">{greeting}</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-4">
                        {isVet ? 'Prontuários e agenda clínica atualizados.' : isGroomer ? 'Sua fila de banho e tosa para hoje.' : 'Resumo operacional do seu dia.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onNavigate('execution')}
                        className="bg-white hover:bg-gray-50 dark:bg-[#222] dark:hover:bg-[#333] text-gray-700 dark:text-white font-black h-14 px-8 rounded-2xl flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 transition-all shadow-sm uppercase text-[10px] tracking-widest"
                    >
                        <span className="material-symbols-outlined">check_circle</span> Minhas Tarefas
                    </button>
                    <button
                        onClick={() => onNavigate('schedule')}
                        className="bg-primary hover:bg-primary-hover text-white font-black h-14 px-8 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl shadow-primary/20 uppercase text-[10px] tracking-widest italic"
                    >
                        <span className="material-symbols-outlined font-black">calendar_add_on</span> {isVet ? 'Ver Agenda' : 'Agendar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {roleStats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between group hover:border-primary/50 transition-all duration-500 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 z-10">
                            <div className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl font-black">{stat.icon}</span>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                        <div className="flex items-end gap-3 z-10">
                            <p className="text-6xl font-black text-black dark:text-white tracking-tighter italic">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex-1 overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-8 px-2">
                            <h2 className="text-2xl font-black text-black dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
                                <span className="w-2 h-8 bg-primary rounded-full"></span>
                                Fila de Atendimento
                            </h2>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full">Hoje</span>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div></div>
                        ) : appointments.length === 0 ? (
                            <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum atendimento para hoje</div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((app) => (
                                    <div key={app.id} className="group flex items-center justify-between p-6 bg-slate-50 dark:bg-[#111] rounded-[2rem] border border-slate-100 dark:border-gray-800 hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="size-14 bg-white dark:bg-[#1a1a1a] rounded-2xl flex flex-col items-center justify-center shadow-sm">
                                                <span className="text-xs font-black italic">{app.time}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-tight">{app.petName}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.breed} • {app.service}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onNavigate('execution')}
                                            className="size-12 rounded-full bg-white dark:bg-[#1a1a1a] text-primary shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                                        >
                                            <span className="material-symbols-outlined font-black">play_arrow</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-black dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
                                Focus Tasks
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {tasks.map(task => (
                                <label key={task.id} className="flex items-start gap-4 cursor-pointer group">
                                    <div className="relative flex items-center mt-1">
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={() => toggleTask(task.id)}
                                            className="peer sr-only"
                                        />
                                        <div className={`size-6 rounded-lg border-2 transition-all flex items-center justify-center ${task.done ? 'bg-primary border-primary' : 'border-slate-200 dark:border-gray-700 bg-transparent'}`}>
                                            <span className="material-symbols-outlined text-white text-xs font-black">{task.done ? 'check' : ''}</span>
                                        </div>
                                    </div>
                                    <div className={`flex-1 ${task.done ? 'opacity-40' : ''}`}>
                                        <p className={`text-sm font-black uppercase tracking-tight text-gray-800 dark:text-gray-200 transition-colors ${task.done ? 'line-through' : ''}`}>{task.text}</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{task.deadline}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};