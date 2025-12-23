import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Crown, Sparkles, Check, Loader2, ChevronRight,
    Star, Gift, Timer, CreditCard, AlertCircle
} from 'lucide-react';

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    frequency: string;
    description?: string;
    max_usage?: number;
    usage_unit?: string;
    is_active?: boolean;
}

interface ActiveSubscription {
    id: string;
    plan_name: string;
    value: number;
    frequency: string;
    status: string;
    current_usage: number;
    max_usage: number;
    usage_unit: string;
    next_billing: string;
    pet_name?: string;
}

interface SubscriptionSectionProps {
    clientId: string | null;
    petShopId: string;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ clientId, petShopId }) => {
    const [loading, setLoading] = useState(true);
    const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    useEffect(() => {
        fetchData();
    }, [clientId, petShopId]);

    const fetchData = async () => {
        setLoading(true);

        try {
            // 1. Fetch available subscription plans from this pet shop
            const { data: plans } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('tenant_id', petShopId)
                .eq('is_active', true)
                .order('price', { ascending: true });

            if (plans) {
                setAvailablePlans(plans.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    frequency: p.frequency || 'mensal',
                    description: p.description,
                    max_usage: p.max_usage,
                    usage_unit: p.usage_unit,
                    is_active: p.is_active
                })));
            }

            // 2. Fetch client's active subscriptions
            if (clientId) {
                const { data: subs } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('tenant_id', petShopId)
                    .eq('status', 'active')
                    .or(`client_name.is.null,client_id.eq.${clientId}`);

                if (subs) {
                    setActiveSubscriptions(subs.map(s => ({
                        id: s.id,
                        plan_name: s.plan_name,
                        value: s.value,
                        frequency: s.frequency || 'mensal',
                        status: s.status,
                        current_usage: s.current_usage || 0,
                        max_usage: s.max_usage || 0,
                        usage_unit: s.usage_unit || 'serviços',
                        next_billing: s.next_billing,
                        pet_name: s.pet_name
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching subscription data:', error);
        }

        setLoading(false);
    };

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        // For now, just show interest - pet shop will process
        setSelectedPlan(plan);
        alert(`Entre em contato com o pet shop para assinar o plano "${plan.name}".`);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-indigo-500" size={24} />
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-1 flex items-center gap-2">
                        <Crown size={14} className="text-amber-400" />
                        Minhas Assinaturas
                    </h3>

                    {activeSubscriptions.map(sub => {
                        const usagePercent = sub.max_usage > 0
                            ? Math.min((sub.current_usage / sub.max_usage) * 100, 100)
                            : 0;
                        const remaining = sub.max_usage - sub.current_usage;

                        return (
                            <div
                                key={sub.id}
                                className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                            <Star size={16} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{sub.plan_name}</p>
                                            {sub.pet_name && <p className="text-xs text-white/40">Para: {sub.pet_name}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-white">{formatCurrency(sub.value)}</p>
                                        <p className="text-[10px] uppercase text-white/40">/{sub.frequency}</p>
                                    </div>
                                </div>

                                {/* Usage Bar */}
                                {sub.max_usage > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-white/60">Uso: {sub.current_usage}/{sub.max_usage} {sub.usage_unit}</span>
                                            <span className={`font-bold ${remaining > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {remaining > 0 ? `${remaining} restantes` : 'Saldo esgotado'}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${usagePercent >= 100 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                                    }`}
                                                style={{ width: `${usagePercent}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Next Billing */}
                                {sub.next_billing && (
                                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                                        <span className="text-white/40 flex items-center gap-1">
                                            <Timer size={12} />
                                            Próxima renovação
                                        </span>
                                        <span className="text-white/60 font-bold">
                                            {new Date(sub.next_billing).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Available Plans */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-1 flex items-center gap-2">
                    <Gift size={14} className="text-purple-400" />
                    Planos Disponíveis
                </h3>

                {availablePlans.length > 0 ? (
                    <div className="space-y-3">
                        {availablePlans.map(plan => {
                            const isAlreadySubscribed = activeSubscriptions.some(s => s.plan_name === plan.name);

                            return (
                                <div
                                    key={plan.id}
                                    className={`bg-white/5 border rounded-3xl p-4 transition-all ${isAlreadySubscribed
                                            ? 'border-indigo-500/30 opacity-60'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                                                <Sparkles size={20} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{plan.name}</p>
                                                {plan.max_usage && (
                                                    <p className="text-xs text-white/40">
                                                        {plan.max_usage}x {plan.usage_unit || 'serviços'}/mês
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white">{formatCurrency(plan.price)}</p>
                                            <p className="text-[10px] uppercase text-white/40">/{plan.frequency}</p>
                                        </div>
                                    </div>

                                    {plan.description && (
                                        <p className="text-xs text-white/40 mt-3 leading-relaxed">{plan.description}</p>
                                    )}

                                    <button
                                        onClick={() => !isAlreadySubscribed && handleSubscribe(plan)}
                                        disabled={isAlreadySubscribed}
                                        className={`w-full mt-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isAlreadySubscribed
                                                ? 'bg-indigo-500/20 text-indigo-300 cursor-default'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'
                                            }`}
                                    >
                                        {isAlreadySubscribed ? (
                                            <>
                                                <Check size={16} />
                                                Já Assinado
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={16} />
                                                Assinar Plano
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                        <AlertCircle size={32} className="mx-auto mb-3 text-white/20" />
                        <p className="text-white/40 text-sm">
                            Este pet shop ainda não possui planos de assinatura disponíveis.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
