import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    invite_code: string | null;
    logo_url: string | null;
    primary_color: string;
    created_at: string;
}

interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', primary_color: '#FF6B00' });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [adminPassword, setAdminPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState('');

    const ADMIN_PASSWORD = 'flowpet2024'; // In production, use environment variable

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchTenants = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('tenants').select('*').order('name');
        if (!error && data) {
            setTenants(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTenants();
        }
    }, [isAuthenticated]);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setAuthError('');
        } else {
            setAuthError('Senha de administrador incorreta');
        }
    };

    const handleOpenModal = (tenant?: Tenant) => {
        if (tenant) {
            setEditingTenant(tenant);
            setFormData({ name: tenant.name, slug: tenant.slug, primary_color: tenant.primary_color || '#FF6B00' });
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-[scaleIn_0.3s_ease-out] border border-gray-200 dark:border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">domain</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-black dark:text-white">
                                Painel Admin
                            </h2>
                            <p className="text-xs text-gray-500">Gestão de Empresas (Multi-Tenant)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`mx-6 mt-4 p-3 rounded-xl text-sm font-medium ${notification.type === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        {notification.message}
                    </div>
                )}

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    {!isAuthenticated ? (
                        /* Auth Screen */
                        <div className="max-w-sm mx-auto py-12">
                            <div className="text-center mb-8">
                                <div className="size-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl text-gray-400">lock</span>
                                </div>
                                <h3 className="text-lg font-bold text-black dark:text-white">Área Restrita</h3>
                                <p className="text-sm text-gray-500">Digite a senha de administrador para continuar</p>
                            </div>
                            <form onSubmit={handleAuth} className="space-y-4">
                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="Senha de administrador"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/50 text-black dark:text-white focus:outline-none focus:border-primary"
                                />
                                {authError && <p className="text-sm text-red-500">{authError}</p>}
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                >
                                    Acessar
                                </button>
                            </form>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* Add Button */}
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Nova Empresa
                                </button>
                            </div>

                            {/* Tenants Grid */}
                            <div className="grid gap-4">
                                {tenants.map(tenant => (
                                    <div key={tenant.id} className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 flex items-center gap-5 hover:shadow-lg transition-all group">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg"
                                            style={{ backgroundColor: tenant.primary_color || '#FF6B00' }}
                                        >
                                            {tenant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-base text-black dark:text-white truncate">{tenant.name}</h4>
                                            <p className="text-xs text-gray-400">Slug: {tenant.slug}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Código de Convite</span>
                                            <div className="flex items-center gap-2">
                                                <code className="px-3 py-1.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg font-mono text-sm text-primary font-bold">
                                                    {tenant.invite_code || 'N/A'}
                                                </code>
                                                {tenant.invite_code && (
                                                    <button
                                                        onClick={() => handleCopyCode(tenant.invite_code!)}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                                        title="Copiar código"
                                                    >
                                                        <span className="material-symbols-outlined text-lg text-gray-400">content_copy</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRegenerateCode(tenant)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Gerar novo código"
                                                >
                                                    <span className="material-symbols-outlined text-lg text-gray-400">refresh</span>
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleOpenModal(tenant)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-gray-400">edit</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Edit/Create Modal */}
                {isModalOpen && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)}></div>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-gray-200 dark:border-white/10 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-black dark:text-white">
                                    {editingTenant ? 'Editar Empresa' : 'Nova Empresa'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black dark:hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome da Empresa*</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/50 text-black dark:text-white px-4 py-3 focus:outline-none focus:border-primary"
                                        placeholder="Ex: Pet Shop Feliz"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Slug (identificador)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/50 text-black dark:text-white px-4 py-3 focus:outline-none focus:border-primary"
                                        placeholder="petshop-feliz (gerado do nome)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cor Principal</label>
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
                                            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/50 text-black dark:text-white px-4 py-3 focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90">
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
