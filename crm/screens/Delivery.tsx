import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';

type DeliveryStatus = 'pending' | 'accepted' | 'collected' | 'en-route' | 'arrived' | 'completed';

interface AppointmentDelivery {
    id: string;
    petName: string;
    breed: string;
    ownerName: string;
    service: string;
    status: string;
    delivery_status: DeliveryStatus;
    latitude: number;
    longitude: number;
    notes: string;
    petAvatar: string;
}

export const Delivery: React.FC = () => {
    const { showNotification } = useNotification();
    const [activeDelivery, setActiveDelivery] = useState<AppointmentDelivery | null>(null);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');

    const fetchDelivery = async () => {
        setLoading(true);
        try {
            // Simplified query to avoid errors with potentially missing columns
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    pets(id, name, breed, img),
                    clients(id, name)
                `)
                .eq('status', 'finished')
                .eq('delivery_status', 'pending') // Only show those not delivery-completed
                .order('start_time', { ascending: true })
                .limit(1);

            if (error) {
                console.error('Delivery fetch error:', error);
                setActiveDelivery(null);
            } else if (data && data.length > 0) {
                const item = data[0];
                setActiveDelivery({
                    id: item.id,
                    petName: item.pets?.name || 'Pet',
                    breed: item.pets?.breed || 'SRD',
                    ownerName: item.clients?.name || 'Dono',
                    service: item.service,
                    status: item.status,
                    delivery_status: (item.delivery_status as DeliveryStatus) || 'accepted',
                    // Use fallback coordinates if specific ones aren't available
                    latitude: -23.5632,
                    longitude: -46.6549,
                    notes: item.notes || '',
                    petAvatar: item.pets?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.pets?.name || 'P')}&background=random`
                });
            } else {
                setActiveDelivery(null);
            }
        } catch (err) {
            console.error('Delivery unexpected error:', err);
            setActiveDelivery(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDelivery(); }, []);

    const handleStatusChange = async (newStatus: DeliveryStatus) => {
        if (!activeDelivery) return;

        const { error } = await supabase
            .from('appointments')
            .update({
                delivery_status: newStatus,
                status: newStatus === 'completed' ? 'finished' : activeDelivery.status
            })
            .eq('id', activeDelivery.id);

        if (!error) {
            showNotification(`Status de entrega atualizado: ${newStatus}`, 'success');
            fetchDelivery();
        }
    };

    if (loading && !activeDelivery) return <div className="flex h-screen items-center justify-center"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;

    if (!activeDelivery) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#111]">
            <span className="material-symbols-outlined text-8xl text-slate-200 dark:text-gray-800 mb-6">local_shipping</span>
            <h2 className="text-2xl font-black text-slate-400 uppercase italic">Nenhuma entrega ativa</h2>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Aguardando novos pedidos de Pet Taxi</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden animate-in fade-in duration-500">
            <header className="px-10 py-8 border-b border-slate-100 dark:border-gray-900 bg-white dark:bg-[#111] flex justify-between items-end shrink-0 shadow-sm relative z-20">
                <div>
                    <div className="flex items-start gap-4 mb-2">
                        <h1 className="text-5xl font-black tracking-tight uppercase leading-tight">
                            <div className="text-slate-900 dark:text-white">Logistics</div>
                            <div className="text-primary italic">Hub</div>
                        </h1>
                        <span className="mt-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-800">Ao Vivo</span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Entrega ID: #{activeDelivery.id.substring(0, 8)} • {activeDelivery.petName} ({activeDelivery.breed})</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl border border-slate-100 dark:border-gray-800">
                    <button onClick={() => handleStatusChange('collected')} disabled={activeDelivery.delivery_status !== 'accepted'} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeDelivery.delivery_status === 'accepted' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 cursor-not-allowed'}`}>Coleta</button>
                    <button onClick={() => handleStatusChange('en-route')} disabled={activeDelivery.delivery_status !== 'collected'} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeDelivery.delivery_status === 'collected' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 cursor-not-allowed'}`}>Em Rota</button>
                    <button onClick={() => handleStatusChange('completed')} disabled={activeDelivery.delivery_status !== 'en-route' && activeDelivery.delivery_status !== 'arrived'} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${['en-route', 'arrived'].includes(activeDelivery.delivery_status) ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 cursor-not-allowed'}`}>Finalizar</button>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-10 overflow-hidden">
                <div className="lg:w-[450px] flex flex-col gap-6 shrink-0 h-full overflow-y-auto nike-scroll">
                    <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <span className="material-symbols-outlined text-2xl font-black">local_shipping</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previsão de Chegada</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">14:45</p>
                                </div>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">{activeDelivery.delivery_status.replace('-', ' ')}</h2>
                            <div className="flex items-center gap-2 mt-6">
                                <img src={activeDelivery.petAvatar} className="size-12 rounded-full border-2 border-primary/20" />
                                <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{activeDelivery.petName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{activeDelivery.ownerName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 italic">Log de Eventos Matrix</p>
                        <div className="space-y-0 relative">
                            <div className="absolute left-[15px] top-2 bottom-8 w-0.5 bg-slate-100 dark:bg-gray-800 z-0"></div>
                            {[
                                { step: 'accepted', label: 'Chamado Aceito', sub: 'Confirmado pelo sistema', icon: 'check' },
                                { step: 'collected', label: 'Pet Coletado', sub: 'Retirado na residência', icon: 'pets' },
                                { step: 'en-route', label: 'Em Trânsito', sub: 'Em rota para destino', icon: 'near_me' },
                                { step: 'completed', label: 'Concluído', sub: 'Destino alcançado', icon: 'flag' }
                            ].map((evt) => (
                                <div key={evt.step} className={`relative z-10 flex gap-6 pb-8 group ${activeDelivery.delivery_status === evt.step ? 'scale-105' : 'opacity-40'}`}>
                                    <div className={`size-8 rounded-full border-4 border-white dark:border-[#111] flex items-center justify-center transition-all ${activeDelivery.delivery_status === evt.step ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-gray-800 text-slate-400'}`}>
                                        <span className="material-symbols-outlined text-sm font-black">{evt.icon}</span>
                                    </div>
                                    <div className="pt-0.5">
                                        <p className={`text-xs font-black uppercase italic ${activeDelivery.delivery_status === evt.step ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{evt.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{evt.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-gray-800 relative bg-[#e5e7eb] group">
                    <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${activeDelivery.longitude}!3d${activeDelivery.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1633023222532!5m2!1spt-BR!2sbr`}
                        className="absolute inset-0 w-full h-full border-0 dark:invert dark:grayscale dark:contrast-[1.2] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                        loading="lazy"
                    ></iframe>
                    <div className="absolute inset-0 bg-slate-100 dark:bg-[#111] flex flex-col items-center justify-center group-hover:hidden transition-all">
                        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <span className="material-symbols-outlined text-4xl text-primary font-black">satellite_alt</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Iniciando Link de Satélite</p>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 md:left-auto md:w-96 bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-2xl z-20">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 italic">Destino Final</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic leading-tight mb-8">Av. Paulista, 1578<br />Bela Vista, São Paulo - SP</p>
                        <div className="flex justify-between items-center border-t border-slate-50 dark:border-gray-800 pt-6">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Distância</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">4.2 KM</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Nível Sinal</p>
                                <span className="px-2 py-0.5 bg-emerald-500 rounded text-[8px] font-black text-white">ÓTIMO</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};