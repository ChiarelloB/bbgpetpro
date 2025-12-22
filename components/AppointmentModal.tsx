import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { useResources } from '../ResourceContext';
import { Appointment } from '../types';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (appt: any) => void;
    initialData?: Appointment | null;
    title: string;
    saveLabel: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    title,
    saveLabel
}) => {
    const { resources } = useResources();
    const [clients, setClients] = useState<any[]>([]);
    const [pets, setPets] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [selectedPet, setSelectedPet] = useState<any>(null);
    const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
    const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

    // Subscription detection states
    const [petSubscription, setPetSubscription] = useState<any>(null);
    const [useSubscription, setUseSubscription] = useState(false);
    const [checkingSubscription, setCheckingSubscription] = useState(false);

    const [formData, setFormData] = useState({
        clientId: '',
        petId: '',
        service: '',
        professional: '',
        resourceId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        duration: 60,
        notes: ''
    });

    // Fetch clients on mount
    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('id, name').order('name');
            if (data) setClients(data);
        };
        fetchClients();
    }, []);

    // Fetch services on mount
    useEffect(() => {
        const fetchServices = async () => {
            const { data } = await supabase
                .from('services')
                .select('*')
                .order('name');
            if (data) setServices(data);
        };
        fetchServices();
    }, []);

    // Fetch pets when client changes
    useEffect(() => {
        if (formData.clientId) {
            const fetchPets = async () => {
                const { data } = await supabase
                    .from('pets')
                    .select('*')
                    .eq('client_id', formData.clientId)
                    .order('name');
                if (data) setPets(data);
            };
            fetchPets();
        } else {
            setPets([]);
            setFormData(prev => ({ ...prev, petId: '' }));
        }
    }, [formData.clientId]);

    // Update selected pet when petId changes
    useEffect(() => {
        const pet = pets.find(p => p.id === formData.petId);
        setSelectedPet(pet || null);
    }, [formData.petId, pets]);

    // Calculate price when service or pet changes
    useEffect(() => {
        if (formData.service && selectedPet) {
            const service = services.find(s => s.name === formData.service);
            if (service) {
                // Get price based on pet size
                const sizeKey = `price_${selectedPet.size_category?.toLowerCase() || 'pequeno'}`;
                const price = service[sizeKey] || service.price_pequeno || 0;
                setCalculatedPrice(price);
            }
        } else {
            setCalculatedPrice(null);
        }
    }, [formData.service, selectedPet, services]);

    // Check if pet has active subscription that covers the service
    useEffect(() => {
        const checkSubscription = async () => {
            if (selectedPet && formData.service) {
                setCheckingSubscription(true);
                setPetSubscription(null);
                setUseSubscription(false);

                try {
                    const { data: subscriptions } = await supabase
                        .from('subscriptions')
                        .select('*')
                        .eq('pet_name', selectedPet.name)
                        .eq('status', 'active');

                    if (subscriptions && subscriptions.length > 0) {
                        const sub = subscriptions[0];
                        // Check if service matches the subscription
                        const serviceName = formData.service.toLowerCase();
                        const planName = sub.plan_name?.toLowerCase() || '';
                        const usageUnit = sub.usage_unit?.toLowerCase() || '';

                        const isServiceCovered =
                            planName.includes(serviceName.split(' ')[0]) ||
                            usageUnit.includes(serviceName.split(' ')[0]) ||
                            serviceName.includes(usageUnit.replace('s', '').toLowerCase());

                        if (isServiceCovered && sub.current_usage < sub.max_usage) {
                            setPetSubscription(sub);
                            setUseSubscription(true); // Auto-enable when subscription is found
                        }
                    }
                } catch (error) {
                    console.error('Error checking subscription:', error);
                }
                setCheckingSubscription(false);
            } else {
                setPetSubscription(null);
                setUseSubscription(false);
            }
        };

        checkSubscription();
    }, [selectedPet, formData.service]);

    // No longer restrict time slots - fetch for display only
    useEffect(() => {
        if (formData.resourceId && formData.date) {
            const fetchExistingAppointments = async () => {
                const { data } = await supabase
                    .from('appointments')
                    .select('start_time, duration')
                    .eq('resource_id', formData.resourceId)
                    .gte('start_time', `${formData.date}T00:00:00`)
                    .lte('start_time', `${formData.date}T23:59:59`);

                if (data) {
                    setExistingAppointments(data);
                }
            };
            fetchExistingAppointments();
        }
    }, [formData.resourceId, formData.date]);


    useEffect(() => {
        if (initialData) {
            setFormData({
                clientId: initialData.client_id || '',
                petId: initialData.pet_id || '',
                service: initialData.service,
                professional: initialData.professional || '',
                resourceId: initialData.resourceId,
                date: initialData.date,
                startTime: initialData.startTime,
                duration: initialData.duration || 60,
                notes: initialData.notes || ''
            });
        } else {
            setFormData({
                clientId: '',
                petId: '',
                service: '',
                professional: '',
                resourceId: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                notes: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            status: initialData ? initialData.status : 'pending',
            useSubscription: useSubscription,
            subscriptionId: petSubscription?.id || null
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-2xl w-full max-w-[500px] relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-[#2d3748]">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 nike-scroll">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">Cliente</label>
                        <select
                            required
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                        >
                            <option value="" disabled>Selecione o Cliente...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">Pet</label>
                        <select
                            required
                            value={formData.petId}
                            onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                            disabled={!formData.clientId}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="" disabled>
                                {formData.clientId ? 'Selecione o Pet...' : 'Primeiro selecione um cliente'}
                            </option>
                            {pets.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.species} - {p.size_category})
                                </option>
                            ))}
                        </select>
                        {selectedPet && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                <span className="font-semibold">{selectedPet.breed}</span> • Porte: {selectedPet.size_category}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">Serviço</label>
                        <select
                            required
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                        >
                            <option value="" disabled>Selecione o Serviço...</option>
                            {services.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        {calculatedPrice !== null && !useSubscription && (
                            <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="text-xs font-bold text-primary italic">
                                    💰 PREÇO PARA {selectedPet?.size_category}: R$ {calculatedPrice.toFixed(2)}
                                </p>
                            </div>
                        )}

                        {/* Subscription Detection */}
                        {checkingSubscription && (
                            <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary/50 border-t-primary rounded-full animate-spin"></div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Verificando assinatura...</span>
                            </div>
                        )}

                        {petSubscription && !checkingSubscription && (
                            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useSubscription}
                                        onChange={(e) => setUseSubscription(e.target.checked)}
                                        className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500 mt-0.5"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                                            ✨ Usar Assinatura
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                                            {petSubscription.plan_name} • {petSubscription.current_usage}/{petSubscription.max_usage} {petSubscription.usage_unit} usados
                                        </p>
                                        {useSubscription && (
                                            <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-semibold">
                                                💚 Serviço será coberto pela assinatura (sem custo adicional)
                                            </p>
                                        )}
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">Profissional Responsável</label>
                        <select
                            value={formData.professional}
                            onChange={(e) => setFormData({ ...formData, professional: e.target.value })}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                        >
                            <option value="" disabled>Selecione o Profissional...</option>
                            <option>Ana S. (Groomer)</option>
                            <option>Carlos M. (Groomer)</option>
                            <option>Dr. Helena (Vet)</option>
                            <option>Dr. Paulo (Vet)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">Local (Mesa/Consultório)</label>
                        <select
                            required
                            value={formData.resourceId}
                            onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                        >
                            <option value="" disabled>Selecione o Local...</option>
                            {resources.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">Data</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">
                                Horário
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">
                                Duração (min)
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-tighter">Observações</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white focus:ring-primary focus:border-primary text-sm py-2.5 px-3"
                            placeholder="Detalhes adicionais..."
                            rows={2}
                        ></textarea>
                    </div>
                </form>

                <div className="p-5 border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-[#2d3748] flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-primary text-white text-xs font-black uppercase rounded-lg hover:bg-primary-hover shadow-lg transition-all flex items-center gap-2 italic tracking-tighter"
                    >
                        <span className="material-symbols-outlined text-lg">save</span> {saveLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
