import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    planLink?: string; // Link para redirecionar após sucesso (caso seja criação de empresa)
    planName?: string;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, planLink, planName }) => {
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Erro ao criar usuário');

            const userId = authData.user.id;

            // 2. Handle Tenant Logic
            if (mode === 'create') {
                // Create new Tenant
                const slug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                const { data: tenantData, error: tenantError } = await supabase
                    .from('tenants')
                    .insert([{ name: companyName, slug }]) // RLS must allow this or use RPC
                    .select()
                    .single();

                if (tenantError) throw new Error('Erro ao criar empresa: ' + tenantError.message);

                // Assign User to Tenant (Update Profile)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ tenant_id: tenantData.id, role: 'admin' }) // Admin of the new tenant
                    .eq('id', userId);

                if (profileError) throw new Error('Erro ao vincular perfil: ' + profileError.message);

                // 3. Redirect to Payment
                if (planLink) {
                    const finalLink = `${planLink}?prefilled_email=${encodeURIComponent(email)}`;
                    window.location.href = finalLink;
                } else {
                    onClose(); // Just close if no plan selected (shouldn't happen in this flow)
                }

            } else {
                // Join Existing Tenant
                // Find Tenant by Invite Code
                const { data: tenantData, error: searchError } = await supabase
                    .from('tenants')
                    .select('id, name')
                    .eq('invite_code', inviteCode)
                    .single();

                if (searchError || !tenantData) throw new Error('Código de convite inválido');

                // Check user limit for this tenant
                const { count: currentUsers } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', tenantData.id);

                // Get subscription and plan limit
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('plan_name')
                    .eq('tenant_id', tenantData.id)
                    .is('client_name', null)
                    .eq('status', 'active')
                    .maybeSingle();

                let maxUsers = 1;
                if (subData) {
                    const { data: planData } = await supabase
                        .from('subscription_plans')
                        .select('max_users')
                        .eq('name', subData.plan_name)
                        .maybeSingle();
                    maxUsers = planData?.max_users || 1;
                }

                if ((currentUsers || 0) >= maxUsers) {
                    throw new Error(`A empresa ${tenantData.name} atingiu o limite de ${maxUsers} usuário(s) do plano atual. Entre em contato com o administrador para fazer upgrade.`);
                }

                // Assign User to Tenant
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ tenant_id: tenantData.id, role: 'employee' }) // Default to employee
                    .eq('id', userId);

                if (profileError) throw new Error('Erro ao vincular perfil: ' + profileError.message);

                // Redirect to CRM directly (Employee flow)
                window.location.href = "http://localhost:5173";
            }

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 animate-[scaleIn_0.3s_ease-out] border border-gray-100 dark:border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="text-center mb-8">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-2">
                        {mode === 'create' ? 'Criar Nova Conta' : 'Entrar em uma Equipe'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {planName ? `Para assinar o plano ${planName}, primeiro crie sua conta.` : 'Preencha os dados abaixo.'}
                    </p>
                </div>

                {/* Toggle Mode */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${mode === 'create' ? 'bg-white dark:bg-black text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Nova Empresa
                    </button>
                    <button
                        onClick={() => setMode('join')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${mode === 'join' ? 'bg-white dark:bg-black text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Tenho Código
                    </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-600 text-xs font-bold rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-black dark:text-white"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">E-mail</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-black dark:text-white"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-black dark:text-white"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    {mode === 'create' ? (
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Nome da Empresa</label>
                            <input
                                type="text"
                                required
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-black dark:text-white"
                                placeholder="Ex: Pet Shop Feliz"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Código de Convite</label>
                            <input
                                type="text"
                                required
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-black dark:text-white"
                                placeholder="Ex: petshop-feliz-123456"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Peça este código ao administrador da sua empresa.</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-wide py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? (
                            <>
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Processando...
                            </>
                        ) : mode === 'create' ? 'Criar Conta e Ir para Pagamento' : 'Entrar na Equipe'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
