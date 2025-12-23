import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const Users: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['admin', 'super_admin']);

        if (data) setUsers(data);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Usuários Administrativos</h2>
                    <p className="text-text-muted text-sm font-light">Gerencie o acesso da equipe ao painel Flow Pet PRO.</p>
                </div>
                <button className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Adicionar Usuário
                </button>
            </header>

            <div className="glass-panel rounded-4xl overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-text-muted uppercase tracking-wider border-b border-white/5 bg-white/5">
                                <th className="px-6 py-5 font-semibold">Usuário</th>
                                <th className="px-6 py-5 font-semibold">Função</th>
                                <th className="px-6 py-5 font-semibold">Status</th>
                                <th className="px-6 py-5 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-text-muted text-xs uppercase font-bold">Carregando usuários...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-text-muted text-xs uppercase font-bold">Nenhum administrador encontrado.</td>
                                </tr>
                            ) : users.map((user, i) => (
                                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                                {user.full_name?.substring(0, 2).toUpperCase() || 'US'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{user.full_name || 'Usuário sem nome'}</p>
                                                <p className="text-xs text-text-muted">{user.email || 'Sem email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-text-muted uppercase tracking-wider">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                            <span className="text-white">Ativo</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};