import React, { useState, useEffect } from 'react';
import { useTheme, ThemeMode, AccentColor, SidebarTheme } from '../ThemeContext';
import { useNotification } from '../NotificationContext';
import { useSecurity } from '../SecurityContext';
import { useResources, Resource, SizeConfig } from '../ResourceContext';
import { RolePermission, Permissions } from '../types';
import { DEFAULT_ROLES } from '../constants';
import { supabase } from '../src/lib/supabase';

interface SettingsProps {
    userProfile?: { name: string; email: string; avatar: string; role: string };
    onUpdateProfile?: (data: any) => void;
}

// Mock Data for Integrations with Tutorials
const integrationsData = {
    payment: [
        {
            id: 'mercadopago',
            name: 'Mercado Pago',
            icon: 'account_balance_wallet',
            status: 'connected',
            desc: 'Processamento de Pix e Cartões transparente.',
            externalLink: 'https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials',
            tutorial: [
                "Acesse o painel 'Suas Integrações' no Mercado Pago Developers.",
                "Clique em 'Criar Aplicação' e preencha os dados do negócio.",
                "No menu lateral, vá em 'Credenciais de Produção'.",
                "Copie o 'Access Token' (começa com APP_USR-...).",
                "Cole o token no campo de configuração aqui no sistema."
            ]
        },
        {
            id: 'stripe',
            name: 'Stripe',
            icon: 'credit_card',
            status: 'disconnected',
            desc: 'Pagamentos globais e assinaturas recorrentes.',
            externalLink: 'https://dashboard.stripe.com/apikeys',
            tutorial: [
                "Faça login no Dashboard da Stripe.",
                "No menu superior direito, clique em 'Desenvolvedores'.",
                "Selecione a aba 'Chaves de API'.",
                "Em 'Chaves padrão', clique para revelar a 'Chave Secreta' (Secret Key).",
                "Copie a chave (inicia com sk_live_...) e cole na configuração."
            ]
        },
        {
            id: 'asaas',
            name: 'Asaas',
            icon: 'payments',
            status: 'disconnected',
            desc: 'Automação de boletos e cobranças via Pix.',
            externalLink: 'https://www.asaas.com/configuracoes/integracao',
            tutorial: [
                "Acesse sua conta Asaas e vá em 'Configurações' (ícone de engrenagem).",
                "Clique na aba 'Integração' no menu lateral.",
                "Clique no botão 'Gerar API Key'.",
                "Copie a chave gerada (atenção: ela é exibida apenas uma vez).",
                "Cole a chave no campo de API Key do sistema."
            ]
        },
        {
            id: 'pagarme',
            name: 'Pagar.me',
            icon: 'point_of_sale',
            status: 'disconnected',
            desc: 'Gateway de pagamento robusto para e-commerce.',
            externalLink: 'https://dash.pagar.me/',
            tutorial: [
                "Acesse o Dashboard do Pagar.me (V5).",
                "Vá em 'Configurações' > 'Chaves de API'.",
                "Copie a 'Chave Secreta' (Secret Key).",
                "Cole no sistema para habilitar o processamento."
            ]
        },
    ],
    communication: [
        {
            id: 'whatsapp',
            name: 'WhatsApp Business API',
            icon: 'chat',
            status: 'connected',
            desc: 'Envio automático de lembretes e confirmações.',
            externalLink: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
            tutorial: [
                "Acesse o Facebook Developers e crie um app do tipo 'Empresa'.",
                "Adicione o produto 'WhatsApp' ao seu app.",
                "Em 'Configuração da API', obtenha o 'Identificador do número de telefone'.",
                "Gere um Token de Acesso Permanente nas configurações do negócio.",
                "Insira o ID e o Token na configuração."
            ]
        },
        {
            id: 'evolution',
            name: 'Evolution API',
            icon: 'send_to_mobile',
            status: 'disconnected',
            desc: 'API de WhatsApp multi-tenancy open source.',
            externalLink: 'https://doc.evolution-api.com/v2/pt/get-started/introduction',
            tutorial: [
                "Certifique-se que sua instância da Evolution API está online.",
                "Crie uma nova instância via API ou Painel Manager.",
                "Escaneie o QR Code com o WhatsApp do seu negócio.",
                "Copie a 'API Key' global e a URL da sua instância.",
                "Insira o nome da instância e a API Key na configuração."
            ]
        },
    ],
    fiscal: [
        {
            id: 'enotas',
            name: 'eNotas',
            icon: 'receipt_long',
            status: 'disconnected',
            desc: 'Emissão automática de NFS-e em todo Brasil.',
            externalLink: 'https://app.enotas.com.br/configuracoes/api',
            tutorial: [
                "Acesse o painel do eNotas Gateway.",
                "Vá em 'Configurações' > 'API'.",
                "Copie a 'API Key' disponível.",
                "Cole no sistema para habilitar a emissão de notas."
            ]
        },
    ],
    marketing: [
        {
            id: 'rdstation',
            name: 'RD Station',
            icon: 'campaign',
            status: 'disconnected',
            desc: 'Automação de marketing e gestão de leads.',
            externalLink: 'https://app.rdstation.com.br/integracoes/tokens',
            tutorial: [
                "No RD Station Marketing, clique no nome da conta (topo direito).",
                "Selecione 'Integrações'.",
                "Vá na aba 'Dados da Integração' (API).",
                "Copie o 'Token Privado'.",
                "Cole no sistema para sincronizar leads."
            ]
        },
    ],
    calendar: [
        {
            id: 'gcal',
            name: 'Google Calendar',
            icon: 'calendar_month',
            status: 'connected',
            desc: 'Sincronize a agenda com seu calendário pessoal.',
            externalLink: 'https://console.cloud.google.com/apis/credentials',
            tutorial: [
                "Acesse o Google Cloud Console e crie um projeto.",
                "Ative a 'Google Calendar API' na biblioteca.",
                "Vá em 'Credenciais' e crie um 'ID do cliente OAuth'.",
                "Baixe o JSON ou copie o Client ID e Client Secret.",
                "Cole as credenciais para iniciar o fluxo de autorização."
            ]
        },
    ]
};

const IntegrationTutorialModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    integration: any;
}> = ({ isOpen, onClose, integration }) => {
    if (!isOpen || !integration) return null;

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg relative z-10 border border-slate-200 dark:border-gray-800 flex flex-col animate-in zoom-in-95 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-primary">{integration.icon}</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white leading-none">Como Integrar</h2>
                            <p className="text-xs text-slate-500 dark:text-gray-400 font-bold mt-1">{integration.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-[#1a1a1a]">
                    <div className="space-y-4">
                        {integration.tutorial && integration.tutorial.map((step: string, index: number) => (
                            <div key={index} className="flex gap-4 items-start group">
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 font-bold text-slate-600 dark:text-gray-300 text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                    {index + 1}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed pt-1.5">{step}</p>
                            </div>
                        ))}
                        {!integration.tutorial && (
                            <p className="text-slate-500 text-center py-4">Tutorial detalhado indisponível no momento.</p>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222] flex justify-between items-center">
                    {integration.externalLink && (
                        <a
                            href={integration.externalLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            Documentação Oficial <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm hover:opacity-90 shadow-lg transition-all"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

const IntegrationConfigModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    integration: any;
    onSave: () => void;
}> = ({ isOpen, onClose, integration, onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [instanceName, setInstanceName] = useState('');

    if (!isOpen || !integration) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave();
        onClose();
        setApiKey('');
        setWebhookUrl('');
        setInstanceName('');
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-slate-200 dark:border-gray-800 flex flex-col animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-primary">{integration.icon}</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white leading-none">Configurar</h2>
                            <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">{integration.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {integration.id.includes('whatsapp') || integration.id === 'evolution' ? (
                        <>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Instance ID / Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={instanceName}
                                    onChange={e => setInstanceName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                                    placeholder="Ex: petshop_main"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">API Key / Token</label>
                                <input
                                    type="password"
                                    required
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                                    placeholder="••••••••••••••••"
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">API Key</label>
                            <input
                                type="password"
                                required
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Webhook URL (Opcional)</label>
                        <input
                            type="url"
                            value={webhookUrl}
                            onChange={e => setWebhookUrl(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                            placeholder="https://api.seucrm.com/webhook"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-slate-500 font-bold text-sm hover:text-slate-700 dark:hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">save</span> Salvar Conexão
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Employee Interface
interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    specialty: string;
    status: 'active' | 'inactive';
    avatar_url?: string;
    phone?: string;
    created_at?: string;
}

// Employee Modal Component
const EmployeeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id' | 'created_at'>) => void;
    initialData?: Employee;
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Atendente');
    const [specialty, setSpecialty] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setEmail(initialData.email || '');
            setRole(initialData.role || 'Atendente');
            setSpecialty(initialData.specialty || '');
            setPhone(initialData.phone || '');
            setStatus(initialData.status || 'active');
        } else {
            setName('');
            setEmail('');
            setRole('Atendente');
            setSpecialty('');
            setPhone('');
            setStatus('active');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, role, specialty, phone, status });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-slate-200 dark:border-gray-800 animate-in zoom-in-95 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Completo*</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2" placeholder="Ex: João Silva" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email*</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2" placeholder="email@empresa.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Telefone</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2" placeholder="(11) 99999-9999" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cargo*</label>
                            <select value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2">
                                <option>Gerente</option>
                                <option>Atendente</option>
                                <option>Tosador</option>
                                <option>Banhista</option>
                                <option>Veterinário</option>
                                <option>Auxiliar</option>
                                <option>Caixa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2">
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Especialidade</label>
                        <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2" placeholder="Ex: Tosa especializada" />
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const ResourceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (resource: Omit<Resource, 'id'>) => void;
    initialData?: Resource;
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Banho & Tosa');
    const [color, setColor] = useState<'blue' | 'emerald' | 'purple' | 'amber' | 'red' | 'gray'>('blue');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setColor(initialData.color);
        } else {
            setName('');
            setType('Banho & Tosa');
            setColor('blue');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, type, color, staff: null, avatar: null, utilization: 0 });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-sm relative z-10 border border-slate-200 dark:border-gray-800 animate-in zoom-in-95 p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{initialData ? 'Editar Recurso' : 'Novo Recurso'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2" placeholder="Ex: Mesa 03" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2">
                            <option>Banho & Tosa</option>
                            <option>Consultas</option>
                            <option>Exames</option>
                            <option>Cirurgia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cor de Identificação</label>
                        <div className="flex gap-2">
                            {['blue', 'emerald', 'purple', 'amber', 'red', 'gray'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c as any)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-black dark:border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c === 'emerald' ? '#10b981' : c === 'amber' ? '#f59e0b' : c === 'purple' ? '#7c3aed' : c === 'red' ? '#ef4444' : c === 'gray' ? '#6b7280' : '#3b82f6' }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Tenant Admin Tab Component
interface Tenant {
    id: string;
    name: string;
    slug: string;
    invite_code: string | null;
    logo_url: string | null;
    primary_color: string;
    created_at: string;
}

const TenantAdminTab: React.FC<{ showNotification: (msg: string, type: any) => void }> = ({ showNotification }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', primary_color: '#FF6B00' });

    const fetchTenants = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('tenants').select('*').order('name');
        if (!error && data) {
            setTenants(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleOpenModal = (tenant?: Tenant) => {
        if (tenant) {
            setEditingTenant(tenant);
            setFormData({ name: tenant.name, slug: tenant.slug, primary_color: tenant.primary_color });
        } else {
            setEditingTenant(null);
            setFormData({ name: '', slug: '', primary_color: '#FF6B00' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (editingTenant) {
            const { error } = await supabase
                .from('tenants')
                .update({ name: formData.name, slug, primary_color: formData.primary_color })
                .eq('id', editingTenant.id);
            if (!error) {
                showNotification('Empresa atualizada com sucesso!', 'success');
                fetchTenants();
                setIsModalOpen(false);
            } else {
                showNotification('Erro ao atualizar: ' + error.message, 'error');
            }
        } else {
            const { error } = await supabase
                .from('tenants')
                .insert([{ name: formData.name, slug, primary_color: formData.primary_color }]);
            if (!error) {
                showNotification('Nova empresa criada! Código de convite gerado automaticamente.', 'success');
                fetchTenants();
                setIsModalOpen(false);
            } else {
                showNotification('Erro ao criar: ' + error.message, 'error');
            }
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        showNotification('Código copiado para a área de transferência!', 'success');
    };

    const handleRegenerateCode = async (tenant: Tenant) => {
        const newCode = tenant.slug.toLowerCase() + '-' + Math.floor(100000 + Math.random() * 900000);
        const { error } = await supabase
            .from('tenants')
            .update({ invite_code: newCode })
            .eq('id', tenant.id);
        if (!error) {
            showNotification('Novo código de convite gerado!', 'success');
            fetchTenants();
        } else {
            showNotification('Erro ao gerar código: ' + error.message, 'error');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="animate-in slide-in-from-right-10 duration-500 max-w-5xl space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">domain</span>
                        Gestão de Empresas (Multi-Tenant)
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                        Gerencie as empresas que utilizam o CRM. Cada empresa tem dados isolados.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Nova Empresa
                </button>
            </div>

            <div className="grid gap-4">
                {tenants.map(tenant => (
                    <div key={tenant.id} className="bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-gray-800 rounded-2xl p-6 flex items-center gap-6 hover:shadow-lg transition-all group">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: tenant.primary_color }}>
                            {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white truncate">{tenant.name}</h4>
                            <p className="text-xs text-slate-400 dark:text-gray-500">Slug: {tenant.slug}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código de Convite</span>
                            <div className="flex items-center gap-2">
                                <code className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg font-mono text-sm text-primary font-bold">
                                    {tenant.invite_code || 'N/A'}
                                </code>
                                {tenant.invite_code && (
                                    <button
                                        onClick={() => handleCopyCode(tenant.invite_code!)}
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                        title="Copiar código"
                                    >
                                        <span className="material-symbols-outlined text-lg text-slate-400">content_copy</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleRegenerateCode(tenant)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                    title="Gerar novo código"
                                >
                                    <span className="material-symbols-outlined text-lg text-slate-400">refresh</span>
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => handleOpenModal(tenant)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <span className="material-symbols-outlined text-slate-400">edit</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-slate-200 dark:border-gray-800 animate-in zoom-in-95 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingTenant ? 'Editar Empresa' : 'Nova Empresa'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome da Empresa*</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2"
                                    placeholder="Ex: Pet Shop Feliz"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Slug (identificador único)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2"
                                    placeholder="petshop-feliz (gerado automaticamente)"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Usado no código de convite. Se vazio, é gerado do nome.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cor Principal</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.primary_color}
                                        onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                        className="w-12 h-10 rounded-lg cursor-pointer border-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.primary_color}
                                        onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                        className="flex-1 rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222] dark:text-white shadow-sm outline-none px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export const Settings: React.FC<SettingsProps> = ({ userProfile, onUpdateProfile }) => {

    const {
        themeMode, setThemeMode,
        accentColor, setAccentColor,
        sidebarTheme, setSidebarTheme,
        compactMode, setCompactMode,
        highContrast, setHighContrast
    } = useTheme();

    const { showNotification } = useNotification();
    const { dbPassword, setDbPassword, tenant } = useSecurity();
    const { resources, addResource, updateResource, deleteResource, sizeSettings, updateSizeSettings } = useResources();
    const [activeTab, setActiveTab] = useState('Aparência');

    const [loading, setLoading] = useState(true);

    // Integrations State
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

    // Resource State
    const [resourceModalOpen, setResourceModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | undefined>(undefined);

    // Employee State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');

    // Size Config State (Local editing)
    const [localSizes, setLocalSizes] = useState<SizeConfig[]>(sizeSettings);

    useEffect(() => {
        setLocalSizes(sizeSettings);
    }, [sizeSettings]);

    // Permissions State
    const [roles, setRoles] = useState<RolePermission[]>(DEFAULT_ROLES);
    const [selectedRole, setSelectedRole] = useState<RolePermission>(DEFAULT_ROLES[0]);

    // Company Profile State
    const [company, setCompany] = useState({
        name: 'BBG CRM PRO',
        cnpj: '12.345.678/0001-90',
        address: 'Rua dos Pets, 123 - São Paulo, SP',
        phone: '(11) 3333-4444',
        instagram: '@bbgcrm',
        website: 'www.bbgcrm.com.br',
        opensAt: '08:00',
        closesAt: '18:00',
        workDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        email: 'contato@bbgcrm.com',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM3kjadQTjMTHl9YC-OrGR8wbZYUqoOrwId5WQ7c2eyZomiQk05HuotL6zwyo6Z9Tr5P-wLbqRkvXJ4tfqjiuIyIJRMtI60gAaGhsmDbYvURZIWtzVvmBHOZTA-JhfziZkJiaZsO3kiG-01SxOfOajsZqvE8qPHg8m0ijjIFfFyzwhP-y1iG2BhKcEaK44Gpg2MMxv_x_m5TEoqZnmVJGCnHaw4ZCwyyusgRRLNTU8tgNXStlKIvVM24O-x_t-2WnpW99rwAs7oI'
    });

    // Financial Settings State
    const [financialSettings, setFinancialSettings] = useState({
        creditCardFee: '3.99',
        creditCardInstallmentFee: '4.99',
        debitCardFee: '1.99',
        pixFee: '0.99',
        boletoFee: '2.50',
        installmentsMax: 12,
        interestPayer: 'client', // 'client' or 'store'
        anticipation: false
    });

    // Fetch Settings from Supabase
    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('system_settings').select('*');
        if (!error && data) {
            const companySettings = data.find(s => s.id === 'company')?.data;
            const financeSettings = data.find(s => s.id === 'finance')?.data;
            const rolesSettings = data.find(s => s.id === 'roles')?.data;
            if (companySettings) setCompany(prev => ({ ...prev, ...companySettings }));
            if (financeSettings) setFinancialSettings(prev => ({ ...prev, ...financeSettings }));
            if (rolesSettings) {
                setRoles(rolesSettings);
                setSelectedRole(rolesSettings[0]);
            }
        }
        setLoading(false);
    };

    useEffect(() => { fetchSettings(); }, []);

    // Fetch Employees from team_members table
    const fetchEmployees = async () => {
        setEmployeesLoading(true);
        const { data, error } = await supabase.from('team_members').select('*').order('name');
        if (!error && data) {
            setEmployees(data.map((e: any) => ({
                id: e.id,
                name: e.name || e.full_name || '',
                email: e.email || '',
                role: e.role || 'Atendente',
                specialty: e.specialty || '',
                status: e.status || 'active',
                avatar_url: e.avatar_url,
                phone: e.phone || '',
                created_at: e.created_at
            })));
        }
        setEmployeesLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'Funcionários') {
            fetchEmployees();
        }
    }, [activeTab]);

    const [profile, setProfile] = useState({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        avatar: userProfile?.avatar || ''
    });

    // Security State
    const [securityForm, setSecurityForm] = useState({
        current: '',
        newPass: '',
        confirmPass: ''
    });

    const handleSave = async () => {
        const { error: err1 } = await supabase.from('system_settings').update({ data: company }).eq('id', 'company');
        const { error: err2 } = await supabase.from('system_settings').update({ data: financialSettings }).eq('id', 'finance');
        const { error: err3 } = await supabase.from('system_settings').update({ data: roles }).eq('id', 'roles');

        if (!err1 && !err2 && !err3) {
            showNotification('Configurações salvas com sucesso!', 'success');
        } else {
            showNotification('Erro ao salvar as configurações.', 'error');
        }
    };

    // Employee Management Handlers
    const handleOpenEmployeeModal = (employee?: Employee) => {
        setEditingEmployee(employee);
        setEmployeeModalOpen(true);
    };

    const handleSaveEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at'>) => {
        if (editingEmployee) {
            const { error } = await supabase
                .from('team_members')
                .update(employeeData)
                .eq('id', editingEmployee.id);
            if (!error) {
                showNotification('Funcionário atualizado com sucesso!', 'success');
                fetchEmployees();
            } else {
                showNotification('Erro ao atualizar funcionário.', 'error');
            }
        } else {
            const { error } = await supabase
                .from('team_members')
                .insert([employeeData]);
            if (!error) {
                showNotification('Funcionário adicionado com sucesso!', 'success');
                fetchEmployees();
            } else {
                showNotification('Erro ao adicionar funcionário: ' + error.message, 'error');
            }
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este funcionário?')) {
            const { error } = await supabase.from('team_members').delete().eq('id', id);
            if (!error) {
                showNotification('Funcionário removido.', 'info');
                fetchEmployees();
            } else {
                showNotification('Erro ao remover funcionário.', 'error');
            }
        }
    };

    const handleToggleEmployeeStatus = async (employee: Employee) => {
        const newStatus = employee.status === 'active' ? 'inactive' : 'active';
        const { error } = await supabase
            .from('team_members')
            .update({ status: newStatus })
            .eq('id', employee.id);
        if (!error) {
            showNotification(`Funcionário ${newStatus === 'active' ? 'ativado' : 'desativado'}.`, 'success');
            fetchEmployees();
        } else {
            showNotification('Erro ao alterar status.', 'error');
        }
    };

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.role.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    const handleSaveProfile = async () => {
        if (!userProfile?.email) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                name: profile.name,
                avatar_url: profile.avatar
            })
            .eq('email', profile.email);

        if (!error) {
            if (onUpdateProfile) onUpdateProfile({ name: profile.name, avatar: profile.avatar });
            showNotification('Perfil atualizado com sucesso!', 'success');
        } else {
            showNotification('Erro ao atualizar perfil.', 'error');
        }
    };

    const handleSaveSizes = () => {
        updateSizeSettings(localSizes);
        showNotification('Configuração de portes atualizada!', 'success');
    };

    const handleSizeChange = (id: string, field: keyof SizeConfig, value: string) => {
        setLocalSizes(prev => prev.map(size => {
            if (size.id === id) {
                if (field === 'maxWeight') {
                    return { ...size, [field]: parseFloat(value) || 0 };
                }
                return { ...size, [field]: value };
            }
            return size;
        }));
    };

    const handleRestore = () => {
        showNotification('Configurações restauradas para o padrão.', 'info');
        setThemeMode('light');
        setAccentColor('purple');
        setSidebarTheme('default');
        setCompactMode(false);
        setHighContrast(false);
    };

    const togglePermission = (roleId: string, permission: keyof Permissions) => {
        setRoles(prevRoles => prevRoles.map(role => {
            if (role.id === roleId) {
                const updated = {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        [permission]: !role.permissions[permission]
                    }
                };
                if (selectedRole.id === roleId) setSelectedRole(updated);
                return updated;
            }
            return role;
        }));
    };

    const toggleWorkDay = (day: string) => {
        setCompany(prev => {
            const newDays = prev.workDays.includes(day)
                ? prev.workDays.filter(d => d !== day)
                : [...prev.workDays, day];
            return { ...prev, workDays: newDays };
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.current !== dbPassword) {
            showNotification('Senha atual incorreta.', 'error');
            return;
        }
        if (securityForm.newPass !== securityForm.confirmPass) {
            showNotification('As senhas não coincidem.', 'error');
            return;
        }
        if (securityForm.newPass.length < 4) {
            showNotification('A senha deve ter pelo menos 4 caracteres.', 'warning');
            return;
        }

        setDbPassword(securityForm.newPass);
        setSecurityForm({ current: '', newPass: '', confirmPass: '' });
        showNotification('Senha do Banco de Dados atualizada!', 'success');
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompany(prev => ({ ...prev, logo: reader.result as string }));
                showNotification('Logo atualizado!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, avatar: reader.result as string }));
                showNotification('Foto de perfil alterada!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfigureIntegration = (integration: any) => {
        setSelectedIntegration(integration);
        setConfigModalOpen(true);
    };

    const handleViewTutorial = (integration: any) => {
        setSelectedIntegration(integration);
        setTutorialModalOpen(true);
    };

    const handleSaveIntegration = () => {
        showNotification(`Integração ${selectedIntegration.name} configurada com sucesso!`, 'success');
    };

    const handleFeeInput = (key: keyof typeof financialSettings, value: string) => {
        // Allow only numbers and up to 2 decimal places, and comma/dot conversion
        let normalized = value.replace(',', '.');
        if (normalized === '' || /^\d*\.?\d{0,2}$/.test(normalized)) {
            setFinancialSettings(prev => ({ ...prev, [key]: normalized }));
        }
    };

    // Resource Management Handlers
    const handleOpenResourceModal = (resource?: Resource) => {
        setEditingResource(resource);
        setResourceModalOpen(true);
    };

    const handleSaveResource = (resourceData: Omit<Resource, 'id'>) => {
        if (editingResource) {
            updateResource(editingResource.id, resourceData);
            showNotification('Recurso atualizado!', 'success');
        } else {
            addResource(resourceData);
            showNotification('Novo recurso adicionado!', 'success');
        }
    };

    const handleDeleteResource = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este recurso? Isso pode afetar agendamentos existentes.')) {
            deleteResource(id);
            showNotification('Recurso removido.', 'info');
        }
    };

    const colorOptions: { id: AccentColor, label: string, hex: string }[] = [
        { id: 'purple', label: 'ROXO NIKE', hex: '#7c3aed' },
        { id: 'violet', label: 'VIOLETA', hex: '#8b5cf6' },
        { id: 'fuchsia', label: 'FÚCSIA', hex: '#d946ef' },
        { id: 'pink', label: 'PINK', hex: '#db2777' },
        { id: 'rose', label: 'ROSE', hex: '#e11d48' },
        { id: 'blue', label: 'ROYAL', hex: '#2563eb' },
        { id: 'indigo', label: 'ÍNDIGO', hex: '#4f46e5' },
        { id: 'sky', label: 'CÉU', hex: '#0ea5e9' },
        { id: 'cyan', label: 'CIANO', hex: '#06b6d4' },
        { id: 'teal', label: 'TEAL', hex: '#0d9488' },
        { id: 'emerald', label: 'ESMERALDA', hex: '#10b981' },
        { id: 'green', label: 'VERDE', hex: '#059669' },
        { id: 'lime', label: 'LIMA', hex: '#84cc16' },
        { id: 'amber', label: 'ÂMBAR', hex: '#f59e0b' },
        { id: 'orange', label: 'LARANJA', hex: '#f97316' },
        { id: 'black', label: 'MONOCROMO', hex: '#171717' },
    ];

    const sidebarOptions: { id: SidebarTheme, label: string, colorClass: string }[] = [
        { id: 'default', label: 'Sistema Padrão', colorClass: 'bg-[#1e293b]' },
        { id: 'slate', label: 'Profissional', colorClass: 'bg-slate-900' },
        { id: 'zinc', label: 'Industrial', colorClass: 'bg-zinc-900' },
        { id: 'stone', label: 'Quente', colorClass: 'bg-stone-900' },
        { id: 'black', label: 'OLED', colorClass: 'bg-black' },
        { id: 'light', label: 'Claro', colorClass: 'bg-white border border-gray-200' },
        { id: 'navy', label: 'Marinho', colorClass: 'bg-[#1e3a8a]' },
        { id: 'forest', label: 'Floresta', colorClass: 'bg-[#064e3b]' },
        { id: 'purple', label: 'Ultra', colorClass: 'bg-[#4c1d95]' },
        { id: 'ruby', label: 'Rubi', colorClass: 'bg-[#881337]' },
        { id: 'chocolate', label: 'Café', colorClass: 'bg-[#451a03]' },
    ];

    if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;

    return (
        <div className="flex-1 flex h-full bg-white dark:bg-[#0a0a0a] overflow-hidden animate-in fade-in duration-500">

            <IntegrationConfigModal
                isOpen={configModalOpen}
                onClose={() => setConfigModalOpen(false)}
                integration={selectedIntegration}
                onSave={handleSaveIntegration}
            />

            <IntegrationTutorialModal
                isOpen={tutorialModalOpen}
                onClose={() => setTutorialModalOpen(false)}
                integration={selectedIntegration}
            />

            <ResourceModal
                isOpen={resourceModalOpen}
                onClose={() => setResourceModalOpen(false)}
                onSave={handleSaveResource}
                initialData={editingResource}
            />

            <EmployeeModal
                isOpen={employeeModalOpen}
                onClose={() => setEmployeeModalOpen(false)}
                onSave={handleSaveEmployee}
                initialData={editingEmployee}
            />

            <section className="flex-1 flex flex-col h-full bg-white dark:bg-[#0a0a0a] overflow-y-auto nike-scroll relative">
                {/* Header Section */}
                <div className="px-12 pt-20 pb-12 shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary text-sm">tune</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">Preferências</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.85] italic mb-6 text-slate-900 dark:text-white">
                        Configurações<br />
                        <span className="text-primary italic">do Sistema</span>
                    </h1>
                    <p className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] max-w-xl">
                        Personalize a aparência, gerencie permissões, financeiro e integrações do seu CRM.
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="px-12 mb-12 border-b border-slate-100 dark:border-white/5 shrink-0 sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl z-20">
                    <div className="flex gap-10 overflow-x-auto no-scrollbar py-2">
                        {['Aparência', 'Portes', 'Recursos', 'Funcionários', 'Empresa', 'Financeiro', 'Permissões', 'Integrações', 'Perfil', 'Segurança'].map((tab) => (
                            <div key={tab} className="relative group">
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 font-black text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-all ${activeTab === tab
                                        ? 'text-primary italic'
                                        : 'text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400'
                                        }`}
                                >
                                    {tab}
                                </button>
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in slide-in-from-left-2 duration-300"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-10 pb-32 space-y-20">
                    {activeTab === 'Aparência' && (

                        <div className="animate-in slide-in-from-right-10 duration-500 max-w-5xl space-y-20">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                                    Modo de Aparência
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { id: 'light', label: 'CLARO', icon: 'light_mode', preview: '/light-preview.png' },
                                        { id: 'dark', label: 'ESCURO', icon: 'dark_mode', preview: '/dark-preview.png' },
                                        { id: 'system', label: 'SISTEMA', icon: 'hdr_auto', preview: '/system-preview.png' }
                                    ].map((mode) => (
                                        <label key={mode.id} className="cursor-pointer group flex flex-col gap-4">
                                            <input type="radio" name="theme" className="sr-only peer" checked={themeMode === mode.id} onChange={() => setThemeMode(mode.id as any)} />
                                            <div className="aspect-[1.4] rounded-3xl border-2 border-slate-100 dark:border-white/5 transition-all peer-checked:border-primary peer-checked:ring-4 peer-checked:ring-primary/10 overflow-hidden relative bg-slate-50 dark:bg-white/5">
                                                {/* Mock content representation */}
                                                <div className={`absolute inset-0 p-4 ${mode.id === 'dark' ? 'bg-[#1a1a1a]' : mode.id === 'light' ? 'bg-white' : 'bg-gradient-to-br from-white to-[#1a1a1a]'}`}>
                                                    <div className={`w-full h-3 rounded-full mb-2 ${mode.id === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}></div>
                                                    <div className={`w-2/3 h-12 rounded-xl border-2 ${mode.id === 'dark' ? 'border-white/5' : 'border-slate-50'}`}></div>
                                                </div>
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-3xl opacity-0 group-hover:opacity-100 transition-opacity text-primary">check_circle</span>
                                                </div>
                                            </div>
                                            <span className={`text-[11px] font-black tracking-[0.2em] transition-colors ${themeMode === mode.id ? 'text-primary' : 'text-slate-400 dark:text-gray-600'}`}>
                                                {mode.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                                    Cor da Barra Lateral
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                                    {sidebarOptions.map((opt) => (
                                        <label key={opt.id} className="cursor-pointer group flex flex-col gap-3">
                                            <input type="radio" name="sidebar" className="sr-only peer" checked={sidebarTheme === opt.id} onChange={() => setSidebarTheme(opt.id)} />
                                            <div className="aspect-square rounded-2xl border-2 border-slate-100 dark:border-white/5 transition-all peer-checked:border-primary peer-checked:ring-4 peer-checked:ring-primary/10 overflow-hidden bg-slate-50 dark:bg-white/5 relative">
                                                <div className={`absolute inset-0 ${opt.colorClass} opacity-80`}></div>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-white text-xl">check</span>
                                                </div>
                                                {/* Sidebar mock elements */}
                                                <div className="absolute left-2 top-2 bottom-2 w-3 rounded-full bg-white/10"></div>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest text-center truncate px-1 transition-colors ${sidebarTheme === opt.id ? 'text-primary' : 'text-slate-400 dark:text-gray-600'}`}>
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                                    Cor de Destaque
                                </h3>
                                <div className="flex flex-wrap gap-8">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => setAccentColor(color.id)}
                                            className={`group flex flex-col items-center gap-3 transition-all ${accentColor === color.id ? 'scale-110' : 'hover:scale-105'}`}
                                        >
                                            <div
                                                className={`size-12 rounded-full border-4 transition-all shadow-xl flex items-center justify-center ${accentColor === color.id ? 'border-primary ring-4 ring-primary/20 bg-white dark:bg-black' : 'border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                                style={{ backgroundColor: accentColor === color.id ? undefined : color.hex }}
                                            >
                                                {accentColor === color.id ? (
                                                    <div className="size-full rounded-full flex items-center justify-center" style={{ backgroundColor: color.hex }}>
                                                        <span className="material-symbols-outlined text-white text-lg font-black drop-shadow-sm">palette</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${accentColor === color.id ? 'text-primary' : 'text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-400'}`}>
                                                {color.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Portes' && (
                        <div className="max-w-3xl animate-in slide-in-from-right-10 duration-500 bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-2xl">
                            <div className="flex justify-between items-end mb-12">
                                <div>
                                    <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Pet Metrics</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Dynamic classification algorithm</p>
                                </div>
                                <span className="material-symbols-outlined text-primary text-5xl opacity-20">scale</span>
                            </div>

                            <div className="space-y-4">
                                {localSizes.map((size, index) => (
                                    <div key={size.id} className="flex gap-4 items-center p-6 bg-slate-50 dark:bg-[#0a0a0a] rounded-3xl border border-slate-100 dark:border-gray-900 group">
                                        <div className="size-12 rounded-2xl bg-white dark:bg-[#111] shadow-sm flex items-center justify-center shrink-0">
                                            <span className="text-sm font-black italic">{index + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <input type="text" value={size.label} onChange={(e) => handleSizeChange(size.id, 'label', e.target.value)} className="bg-transparent text-lg font-black italic uppercase tracking-tighter text-slate-900 dark:text-white outline-none w-full" />
                                        </div>
                                        {size.id !== 'giant' && (
                                            <div className="flex items-center gap-2">
                                                <input type="number" value={size.maxWeight} onChange={(e) => handleSizeChange(size.id, 'maxWeight', e.target.value)} className="w-16 bg-white dark:bg-[#111] border border-slate-200 dark:border-gray-800 rounded-xl px-2 py-2 text-center font-black text-sm" />
                                                <span className="text-[10px] font-black uppercase text-slate-400">KG</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleSaveSizes} className="w-full mt-10 h-16 bg-primary text-white font-black uppercase italic tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">Update Algorithm</button>
                        </div>
                    )}

                    {activeTab === 'Recursos' && (
                        <div className="max-w-5xl animate-in slide-in-from-right-10 duration-500">
                            <div className="flex justify-between items-end mb-12">
                                <h3 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Asset <span className="text-primary tracking-tight">Mgmt</span></h3>
                                <button onClick={() => handleOpenResourceModal()} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black uppercase italic text-xs tracking-widest hover:scale-110 transition-all">+ New Asset</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {resources.map(res => (
                                    <div key={res.id} className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-xl group hover:border-primary/50 transition-all">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                                <div className="size-4 rounded-full shadow-[0_0_15px]" style={{ backgroundColor: res.color === 'emerald' ? '#10b981' : res.color === 'amber' ? '#f59e0b' : res.color === 'purple' ? '#7c3aed' : res.color === 'red' ? '#ef4444' : res.color === 'gray' ? '#6b7280' : '#3b82f6', boxShadow: `0 0 15px ${res.color === 'emerald' ? '#10b981' : res.color === 'amber' ? '#f59e0b' : res.color === 'purple' ? '#7c3aed' : res.color === 'red' ? '#ef4444' : res.color === 'gray' ? '#6b7280' : '#3b82f6'}` }}></div>
                                            </div>
                                            <div className="flex gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenResourceModal(res)} className="p-2 hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                <button onClick={() => handleDeleteResource(res.id)} className="p-2 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">{res.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{res.type}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Financeiro' && (
                        <div className="max-w-6xl animate-in slide-in-from-right-10 duration-500 space-y-10">
                            {/* Legal Alert */}
                            <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2rem] flex items-start gap-5">
                                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl font-black">info</span>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-1">IMPORTANTE</h4>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 leading-relaxed uppercase">As taxas configuradas aqui são aplicadas automaticamente no cálculo de lucro líquido do PDV e relatórios financeiros. Certifique-se de manter os valores atualizados conforme seu contrato com a adquirente.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Operating Fees Block */}
                                <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-xl space-y-10">
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-amber-500 text-3xl font-black">payments</span>
                                        </div>
                                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Taxas de Operação</h3>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Crédito à Vista (%)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={financialSettings.creditCardFee}
                                                        onChange={e => setFinancialSettings({ ...financialSettings, creditCardFee: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-black text-xl border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Crédito Parcelado (%)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={financialSettings.creditCardInstallmentFee}
                                                        onChange={e => setFinancialSettings({ ...financialSettings, creditCardInstallmentFee: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-black text-xl border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Débito (%)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={financialSettings.debitCardFee}
                                                        onChange={e => setFinancialSettings({ ...financialSettings, debitCardFee: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-black text-xl border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Pix / Dinheiro (%)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={financialSettings.pixFee}
                                                        onChange={e => setFinancialSettings({ ...financialSettings, pixFee: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-black text-xl border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Tarifa Boleto (R$)</label>
                                            <div className="relative group">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                                                <input
                                                    type="text"
                                                    value={financialSettings.boletoFee}
                                                    onChange={e => setFinancialSettings({ ...financialSettings, boletoFee: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-black p-5 pl-14 rounded-2xl font-black text-xl border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Installment Rules Block */}
                                <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-xl space-y-10">
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-[1.5rem] bg-purple-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-purple-500 text-3xl font-black">account_balance_wallet</span>
                                        </div>
                                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Regras de Parcelamento</h3>
                                    </div>

                                    <div className="space-y-10">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Máximo de Parcelas</label>
                                            <select
                                                value={financialSettings.installmentsMax}
                                                onChange={e => setFinancialSettings({ ...financialSettings, installmentsMax: parseInt(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-black text-sm uppercase tracking-widest border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 10, 12, 18, 24].map(n => (
                                                    <option key={n} value={n}>{n}x</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Repasse de Juros</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setFinancialSettings({ ...financialSettings, interestPayer: 'store' })}
                                                    className={`p-5 rounded-2xl flex items-center gap-4 transition-all border-2 ${financialSettings.interestPayer === 'store' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-slate-50 dark:bg-black border-transparent hover:border-slate-200 dark:hover:border-white/5'}`}
                                                >
                                                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${financialSettings.interestPayer === 'store' ? 'border-primary' : 'border-slate-300 dark:border-gray-700'}`}>
                                                        {financialSettings.interestPayer === 'store' && <div className="size-3 bg-primary rounded-full" />}
                                                    </div>
                                                    <span className={`text-[11px] font-black uppercase tracking-tight text-left ${financialSettings.interestPayer === 'store' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Loja assume (Sem juros)</span>
                                                </button>
                                                <button
                                                    onClick={() => setFinancialSettings({ ...financialSettings, interestPayer: 'client' })}
                                                    className={`p-5 rounded-2xl flex items-center gap-4 transition-all border-2 ${financialSettings.interestPayer === 'client' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-slate-50 dark:bg-black border-transparent hover:border-slate-200 dark:hover:border-white/5'}`}
                                                >
                                                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${financialSettings.interestPayer === 'client' ? 'border-primary' : 'border-slate-300 dark:border-gray-700'}`}>
                                                        {financialSettings.interestPayer === 'client' && <div className="size-3 bg-primary rounded-full" />}
                                                    </div>
                                                    <span className={`text-[11px] font-black uppercase tracking-tight text-left ${financialSettings.interestPayer === 'client' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Cliente paga (Com juros)</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">Antecipação Automática</h4>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-tight">Receber vendas a prazo em D+1 (Taxas maiores)</p>
                                            </div>
                                            <button
                                                onClick={() => setFinancialSettings({ ...financialSettings, anticipation: !financialSettings.anticipation })}
                                                className={`w-14 h-8 rounded-full relative transition-all duration-300 ${financialSettings.anticipation ? 'bg-primary' : 'bg-slate-200 dark:bg-gray-800'}`}
                                            >
                                                <div className={`absolute top-1 size-6 bg-white rounded-full shadow-md transition-all duration-300 ${financialSettings.anticipation ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other Tabs like Empresa continue with same design ... */}
                    {activeTab === 'Funcionários' && (
                        <div className="animate-in slide-in-from-right-10 duration-500 max-w-6xl">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Equipe <span className="text-primary">de Trabalho</span></h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Gerencie os funcionários cadastrados</p>
                                </div>
                                <button
                                    onClick={() => handleOpenEmployeeModal()}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    Novo Funcionário
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-8">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome, email ou cargo..."
                                        value={employeeSearch}
                                        onChange={e => setEmployeeSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111] border border-slate-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Employee List */}
                            {employeesLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-[#111] rounded-3xl border border-slate-50 dark:border-gray-900">
                                    <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-gray-700 mb-4">group_off</span>
                                    <p className="text-slate-400 font-bold">Nenhum funcionário encontrado</p>
                                    <button onClick={() => handleOpenEmployeeModal()} className="mt-4 text-primary font-bold text-sm hover:underline">Adicionar primeiro funcionário</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredEmployees.map(emp => (
                                        <div key={emp.id} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-50 dark:border-gray-900 shadow-xl group hover:border-primary/30 transition-all">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                                                        {emp.avatar_url ? (
                                                            <img src={emp.avatar_url} className="size-full object-cover" alt={emp.name} />
                                                        ) : (
                                                            <span className="text-xl font-black text-primary">{emp.name.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{emp.name}</h4>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{emp.role}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleEmployeeStatus(emp)}
                                                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                                                >
                                                    {emp.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </button>
                                            </div>

                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="material-symbols-outlined text-sm">mail</span>
                                                    {emp.email}
                                                </div>
                                                {emp.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="material-symbols-outlined text-sm">phone</span>
                                                        {emp.phone}
                                                    </div>
                                                )}
                                                {emp.specialty && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="material-symbols-outlined text-sm">star</span>
                                                        {emp.specialty}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEmployeeModal(emp)}
                                                    className="flex-1 py-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 rounded-xl font-bold text-xs hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(emp.id)}
                                                    className="py-2 px-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Stats Footer */}
                            <div className="mt-8 flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-green-500"></span>
                                    {employees.filter(e => e.status === 'active').length} Ativos
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-slate-300"></span>
                                    {employees.filter(e => e.status === 'inactive').length} Inativos
                                </span>
                                <span>Total: {employees.length}</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Empresa' && (
                        <div className="max-w-6xl animate-in slide-in-from-right-10 duration-500 space-y-10">
                            {/* Identity Section */}
                            <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-xl space-y-10">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-3xl font-black">storefront</span>
                                    </div>
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Identidade da Loja</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                    {/* Logo Upload */}
                                    <div className="md:col-span-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Logotipo</label>
                                        <div className="aspect-square rounded-[2.5rem] bg-slate-50 dark:bg-black/40 border-2 border-dashed border-slate-200 dark:border-gray-800 flex items-center justify-center p-2 relative group cursor-pointer overflow-hidden transition-all hover:border-primary/50">
                                            {company.logo ? (
                                                <img src={company.logo} className="size-full object-cover rounded-[2rem]" />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-slate-300">add_a_photo</span>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white">Alterar Logo</span>
                                            </div>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoChange} title="Alterar Logotipo" />
                                        </div>
                                    </div>

                                    {/* Info Fields */}
                                    <div className="md:col-span-9 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nome Fantasia</label>
                                                <input
                                                    type="text"
                                                    value={company.name}
                                                    onChange={e => setCompany({ ...company, name: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="Nome da sua loja"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">CNPJ</label>
                                                <input
                                                    type="text"
                                                    value={company.cnpj}
                                                    onChange={e => setCompany({ ...company, cnpj: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="00.000.000/0000-00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Endereço Completo</label>
                                            <input
                                                type="text"
                                                value={company.address}
                                                onChange={e => setCompany({ ...company, address: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="Rua, Número, Bairro, Cidade - UF"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Contact Section */}
                                <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-xl space-y-8">
                                    <div className="flex items-center gap-6 mb-2">
                                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-2xl font-black">contact_support</span>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Canais de Contato</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">E-mail Oficial</label>
                                            <input
                                                type="email"
                                                value={company.email}
                                                onChange={e => setCompany({ ...company, email: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="contato@empresa.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Telefone / WhatsApp</label>
                                            <input
                                                type="text"
                                                value={company.phone}
                                                onChange={e => setCompany({ ...company, phone: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Instagram</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                                    <input
                                                        type="text"
                                                        value={company.instagram?.replace('@', '')}
                                                        onChange={e => setCompany({ ...company, instagram: `@${e.target.value}` })}
                                                        className="w-full bg-slate-50 dark:bg-black p-5 pl-10 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                        placeholder="perfil"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Website</label>
                                                <input
                                                    type="text"
                                                    value={company.website}
                                                    onChange={e => setCompany({ ...company, website: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="www.empresa.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Working Hours Section */}
                                <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-xl space-y-8">
                                    <div className="flex items-center gap-6 mb-2">
                                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-2xl font-black">schedule</span>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Horário de Funcionamento</h3>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Abertura</label>
                                                <input
                                                    type="time"
                                                    value={company.opensAt}
                                                    onChange={e => setCompany({ ...company, opensAt: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Fechamento</label>
                                                <input
                                                    type="time"
                                                    value={company.closesAt}
                                                    onChange={e => setCompany({ ...company, closesAt: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">Dias de Semana</label>
                                            <div className="flex justify-between items-center gap-2">
                                                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                                                    <button
                                                        key={day}
                                                        onClick={() => {
                                                            const exists = company.workDays.includes(day);
                                                            const newDays = exists
                                                                ? company.workDays.filter(d => d !== day)
                                                                : [...company.workDays, day];
                                                            setCompany({ ...company, workDays: newDays });
                                                        }}
                                                        className={`size-12 rounded-full font-black text-[10px] uppercase transition-all flex items-center justify-center ${company.workDays.includes(day)
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                                                            : 'bg-slate-50 dark:bg-black/40 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                                            }`}
                                                    >
                                                        {day.charAt(0)}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 mt-6">
                                                <span className="material-symbols-outlined text-slate-400 text-sm">info</span>
                                                <span className="text-[10px] font-bold text-slate-400 italic">Selecione os dias de operação.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Permissões' && (
                        <div className="max-w-6xl animate-in slide-in-from-right-10 duration-500 flex flex-col md:flex-row gap-10">
                            <div className="w-full md:w-80 shrink-0 space-y-4">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role)}
                                        className={`w-full p-6 rounded-[2rem] text-left transition-all border-2 ${selectedRole.id === role.id ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white dark:bg-[#111] border-slate-50 dark:border-gray-900 text-slate-500 hover:border-primary/30'}`}
                                    >
                                        <h4 className="font-black uppercase italic italic text-sm mb-1">{role.name}</h4>
                                        <p className={`text-[10px] font-bold ${selectedRole.id === role.id ? 'text-white/70' : 'text-slate-400'}`}>{role.usersCount} usuários vinculados</p>
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-2xl">
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-8">Access <span className="text-primary italic">Matrix</span></h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(selectedRole.permissions).map(([key, val]) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black rounded-2xl border border-slate-100 dark:border-gray-800">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">{key}</span>
                                            <button
                                                onClick={() => togglePermission(selectedRole.id, key as keyof Permissions)}
                                                className={`size-12 rounded-xl flex items-center justify-center transition-all ${val ? 'bg-primary text-white shadow-lg' : 'bg-slate-200 dark:bg-gray-800 text-slate-400'}`}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">{val ? 'lock_open' : 'lock'}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Integrações' && (
                        <div className="animate-in slide-in-from-right-10 duration-500 space-y-16">
                            {Object.entries(integrationsData).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8 border-l-4 border-primary pl-4 shrink-0 truncate">{category} Protocol</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {items.map(integ => (
                                            <div key={integ.id} className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-slate-50 dark:border-gray-900 shadow-xl group hover:border-primary/50 transition-all">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary text-3xl">{integ.icon}</span>
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${integ.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>{integ.status}</span>
                                                </div>
                                                <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-tight">{integ.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 h-10 line-clamp-2">{integ.desc}</p>
                                                <div className="mt-8 flex gap-2">
                                                    <button onClick={() => handleConfigureIntegration(integ)} className="flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase text-[10px] tracking-widest">Connect</button>
                                                    <button onClick={() => handleViewTutorial(integ)} className="size-12 bg-slate-100 dark:bg-gray-800 text-slate-500 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">help</span></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Perfil' && (
                        <div className="max-w-2xl animate-in slide-in-from-right-10 duration-500 bg-white dark:bg-[#111] p-12 rounded-[4rem] border border-slate-50 dark:border-gray-900 shadow-2xl space-y-10">
                            <div className="flex items-center gap-10">
                                <div className="size-32 rounded-full border-4 border-slate-100 dark:border-gray-800 overflow-hidden relative group">
                                    <img src={profile.avatar || 'https://via.placeholder.com/150'} className="size-full object-cover" />
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <span className="material-symbols-outlined text-white">photo_camera</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none mb-2">{profile.name}</h3>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{userProfile?.role}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Display Name</label>
                                    <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email Address</label>
                                    <input type="email" value={profile.email} disabled className="w-full bg-slate-50/50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none text-slate-400 cursor-not-allowed" />
                                </div>
                                <button onClick={handleSaveProfile} className="w-full h-16 bg-primary text-white font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20">Update Profile</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Segurança' && (
                        <div className="max-w-2xl animate-in slide-in-from-right-10 duration-500 bg-white dark:bg-[#111] p-12 rounded-[4rem] border border-slate-50 dark:border-gray-900 shadow-2xl space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="size-16 rounded-[1.5rem] bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-500 text-3xl font-black">lock_person</span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Segurança e Acesso</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Gerencie convites de novos usuários e credenciais de segurança</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Empresa</p>
                                            <p className="text-lg font-black italic tracking-tighter text-slate-900 dark:text-white">{tenant?.name || 'Carregando...'}</p>
                                        </div>
                                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined font-black">domain</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Código de Convite (Para Novos Usuários)</p>
                                            <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">{tenant?.invite_code || '---'}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (tenant?.invite_code) {
                                                    navigator.clipboard.writeText(tenant.invite_code);
                                                    showNotification('Código copiado!', 'success');
                                                }
                                            }}
                                            className="size-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
                                            title="Copiar código"
                                        >
                                            <span className="material-symbols-outlined">content_copy</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 dark:border-white/5">
                                    <div className="mb-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Criptografia do Banco de Dados</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Esta senha é local e usada apenas para desbloquear funções críticas do sistema.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Senha Local Atual</label>
                                            <input type="password" value={securityForm.current} onChange={e => setSecurityForm({ ...securityForm, current: e.target.value })} className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm" placeholder="••••••••" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nova Senha Local</label>
                                                <input type="password" value={securityForm.newPass} onChange={e => setSecurityForm({ ...securityForm, newPass: e.target.value })} className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm" placeholder="••••••••" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Confirmar Nova Senha</label>
                                                <input type="password" value={securityForm.confirmPass} onChange={e => setSecurityForm({ ...securityForm, confirmPass: e.target.value })} className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm" placeholder="••••••••" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-xl">Atualizar Senha Local</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </section>

            {/* Live Preview Sidebar */}
            {activeTab === 'Aparência' && (
                <section className="w-[450px] shrink-0 bg-slate-50 dark:bg-[#0d0d0d] flex flex-col border-l border-slate-100 dark:border-white/5 h-full hidden xl:flex overflow-y-auto no-scrollbar relative p-12">
                    <div className="flex items-center gap-3 mb-12">
                        <span className="material-symbols-outlined text-slate-400 dark:text-gray-600 text-sm">visibility</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">Pré-visualização ao vivo</span>
                    </div>

                    {/* Mock Appointment Card */}
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                                    </div>
                                    <span className="font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Agendamento</span>
                                </div>
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-full">Confirmado</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-black/40 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="size-12 rounded-full overflow-hidden bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=100&h=100&fit=crop" className="size-full object-cover" alt="Pet" />
                                    </div>
                                    <div>
                                        <h4 className="font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Bolt O.</h4>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500">Banho & Tosa • Hoje, 14:00</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 ml-1">Observações</div>
                                <div className="w-full bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-[11px] font-bold text-slate-600 dark:text-gray-300 italic">
                                    Cuidado com as patas dianteiras
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase italic tracking-[0.15em] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group">
                                    <span className="material-symbols-outlined text-sm transition-transform group-hover:scale-125">check</span>
                                    Iniciar
                                </button>
                                <button className="size-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest leading-relaxed">
                            Esta é apenas uma demonstração visual.<br />As alterações serão aplicadas globalmente.
                        </p>
                        <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[8px] font-black text-slate-400 tracking-widest">
                            Theme v2.5
                        </div>
                    </div>

                    {/* AI Agent Floating Widget Mock */}
                    <div className="absolute bottom-12 right-12 size-16 bg-primary rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-all group">
                        <span className="material-symbols-outlined text-3xl font-black group-hover:rotate-12 transition-transform">smart_toy</span>
                        <div className="absolute -top-1 -right-1 size-4 bg-green-500 rounded-full border-2 border-white dark:border-[#0d0d0d]"></div>
                    </div>
                </section>
            )}

            {/* Sticky Global Footer */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-2xl border-t border-slate-100 dark:border-white/5 z-[100] px-12 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="size-8 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-[9px] font-black">
                                <span className="material-symbols-outlined text-xs">person</span>
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">12 usuários online</span>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleRestore}
                        className="px-10 h-14 rounded-2xl border-2 border-slate-200 dark:border-white/10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                        Restaurar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-12 h-14 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase italic text-sm tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                    >
                        Salvar Alterações
                        <span className="material-symbols-outlined font-black group-hover:translate-x-1 transition-transform">done_all</span>
                    </button>
                </div>
            </div>
        </div>
    );
};