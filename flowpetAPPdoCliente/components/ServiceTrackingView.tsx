import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Clock, CheckCircle2, Loader2, Dog, Scissors, Droplets,
    Sparkles, Truck, Bell, RefreshCw, ChevronRight, Play,
    Timer, MapPin
} from 'lucide-react';

interface ServiceExecution {
    id: string;
    petName: string;
    petImage?: string;
    service: string;
    professional?: string;
    status: 'pending' | 'confirmed' | 'in-progress' | 'ready' | 'finished' | 'delivery';
    currentStep: number;
    totalSteps: number;
    startedAt?: string;
    estimatedEndTime?: string;
    checkinData?: any;
}

interface ServiceTrackingViewProps {
    clientId?: string;
    petIds: string[];
}

const STATUS_STEPS = [
    { key: 'confirmed', label: 'Confirmado', icon: CheckCircle2, color: 'text-green-500' },
    { key: 'in-progress', label: 'Em Execução', icon: Scissors, color: 'text-blue-500' },
    { key: 'ready', label: 'Pronto', icon: Sparkles, color: 'text-purple-500' },
    { key: 'finished', label: 'Entregue', icon: CheckCircle2, color: 'text-emerald-500' },
];

export const ServiceTrackingView: React.FC<ServiceTrackingViewProps> = ({ clientId, petIds }) => {
    const [executions, setExecutions] = useState<ServiceExecution[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchExecutions = async () => {
        if (petIds.length === 0) {
            setExecutions([]);
            setLoading(false);
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('appointments')
            .select('*, pets(name, img)')
            .in('pet_id', petIds)
            .gte('date', today)
            .in('status', ['confirmed', 'pending', 'in-progress', 'ready', 'finished'])
            .order('start_time', { ascending: true });

        if (!error && data) {
            const mapped: ServiceExecution[] = data.map(apt => ({
                id: apt.id,
                petName: apt.pets?.name || 'Pet',
                petImage: apt.pets?.img,
                service: apt.service || 'Serviço',
                professional: apt.professional,
                status: apt.status || 'pending',
                currentStep: apt.current_step || 0,
                totalSteps: 4,
                startedAt: apt.execution_started_at,
                estimatedEndTime: apt.start_time,
                checkinData: apt.checklist_state,
            }));
            setExecutions(mapped);
        }

        setLoading(false);
        setLastUpdated(new Date());
    };

    useEffect(() => {
        fetchExecutions();

        // Set up real-time subscription
        const channel = supabase
            .channel('appointments-tracking')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                    filter: `pet_id=in.(${petIds.join(',')})`
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchExecutions();
                }
            )
            .subscribe();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchExecutions, 30000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [petIds]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchExecutions();
        setRefreshing(false);
    };

    const getStatusIndex = (status: string) => {
        const idx = STATUS_STEPS.findIndex(s => s.key === status);
        return idx === -1 ? 0 : idx;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'ready': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'finished': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Aguardando';
            case 'confirmed': return 'Confirmado';
            case 'in-progress': return 'Em Execução';
            case 'ready': return 'Pronto!';
            case 'finished': return 'Finalizado';
            default: return status;
        }
    };

    const getServiceIcon = (service: string) => {
        const s = service.toLowerCase();
        if (s.includes('banho')) return <Droplets size={20} />;
        if (s.includes('tosa')) return <Scissors size={20} />;
        return <Dog size={20} />;
    };

    const calculateElapsedTime = (startedAt?: string) => {
        if (!startedAt) return null;
        const start = new Date(startedAt);
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
        return `${diff} min`;
    };

    // Filter to show only active services (not finished)
    const activeExecutions = executions.filter(e => e.status !== 'finished');
    const recentFinished = executions.filter(e => e.status === 'finished').slice(0, 2);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
                <p className="text-white/60">Buscando serviços em andamento...</p>
            </div>
        );
    }

    return (
        <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Acompanhamento</h2>
                    <p className="text-white/40 text-sm">
                        Atualizado {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                    <RefreshCw size={20} className={`text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Active Services */}
            {activeExecutions.length > 0 ? (
                <div className="space-y-4">
                    {activeExecutions.map((exec) => (
                        <div
                            key={exec.id}
                            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-5 backdrop-blur-md"
                        >
                            {/* Pet Info Row */}
                            <div className="flex items-center gap-4 mb-4">
                                {exec.petImage ? (
                                    <img
                                        src={exec.petImage}
                                        alt={exec.petName}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-500">
                                        <Dog size={24} className="text-indigo-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">{exec.petName}</h3>
                                    <div className="flex items-center gap-2">
                                        {getServiceIcon(exec.service)}
                                        <span className="text-white/60 text-sm">{exec.service}</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase ${getStatusColor(exec.status)}`}>
                                    {getStatusLabel(exec.status)}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    {STATUS_STEPS.map((step, i) => {
                                        const isCompleted = getStatusIndex(exec.status) >= i;
                                        const isCurrent = getStatusIndex(exec.status) === i;
                                        const StepIcon = step.icon;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center flex-1">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted
                                                            ? isCurrent
                                                                ? `${step.color} bg-white/10 ring-2 ring-white/20`
                                                                : 'text-emerald-400 bg-emerald-500/20'
                                                            : 'text-white/20 bg-white/5'
                                                        }`}
                                                >
                                                    {isCompleted && !isCurrent ? (
                                                        <CheckCircle2 size={16} />
                                                    ) : isCurrent ? (
                                                        <StepIcon size={16} className="animate-pulse" />
                                                    ) : (
                                                        <div className="w-2 h-2 rounded-full bg-current" />
                                                    )}
                                                </div>
                                                <span className={`text-[9px] mt-1 font-bold uppercase ${isCompleted ? 'text-white/60' : 'text-white/20'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Progress line */}
                                <div className="relative h-1 bg-white/10 rounded-full mx-4">
                                    <div
                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(getStatusIndex(exec.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Info Row */}
                            <div className="flex items-center justify-between text-sm border-t border-white/5 pt-3">
                                {exec.professional && (
                                    <div className="flex items-center gap-2 text-white/40">
                                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold">
                                            {exec.professional.charAt(0)}
                                        </span>
                                        <span>{exec.professional}</span>
                                    </div>
                                )}

                                {exec.status === 'in-progress' && exec.startedAt && (
                                    <div className="flex items-center gap-1 text-blue-400">
                                        <Timer size={14} />
                                        <span className="font-bold">{calculateElapsedTime(exec.startedAt)}</span>
                                    </div>
                                )}

                                {exec.status === 'ready' && (
                                    <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                                        <Bell size={14} />
                                        <span className="font-bold text-xs">Pronto para buscar!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Dog size={32} className="text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Nenhum serviço ativo</h3>
                    <p className="text-white/40 text-sm max-w-xs mx-auto">
                        Quando seu pet estiver em atendimento, você poderá acompanhar o progresso aqui em tempo real.
                    </p>
                </div>
            )}

            {/* Recent Finished */}
            {recentFinished.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">Finalizados Recentemente</h4>
                    <div className="space-y-2">
                        {recentFinished.map((exec) => (
                            <div
                                key={exec.id}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5"
                            >
                                {exec.petImage ? (
                                    <img src={exec.petImage} alt="" className="w-10 h-10 rounded-full object-cover opacity-60" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-white/60 font-bold text-sm">{exec.petName}</p>
                                    <p className="text-white/30 text-xs">{exec.service}</p>
                                </div>
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Card */}
            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <div className="flex items-start gap-3">
                    <Bell size={18} className="text-indigo-400 mt-0.5" />
                    <div>
                        <p className="text-indigo-300 font-bold text-sm">Notificações em tempo real</p>
                        <p className="text-indigo-200/60 text-xs mt-1">
                            Você receberá uma notificação quando seu pet estiver pronto para ser buscado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
