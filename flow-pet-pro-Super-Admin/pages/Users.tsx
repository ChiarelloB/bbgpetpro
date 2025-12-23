import React from 'react';

export const Users: React.FC = () => {
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
                         <th className="px-6 py-5 font-semibold">Último Acesso</th>
                         <th className="px-6 py-5 font-semibold text-right">Ações</th>
                     </tr>
                 </thead>
                 <tbody className="text-sm divide-y divide-white/5">
                     {[
                         { name: 'Roberto Admin', email: 'roberto@flowpet.pro', role: 'Super Admin', status: 'Ativo', last: 'Agora', avatar: 'RA', color: 'bg-emerald-500' },
                         { name: 'Juliana Silva', email: 'juliana@flowpet.pro', role: 'Gerente Comercial', status: 'Ativo', last: 'Há 2h', avatar: 'JS', color: 'bg-blue-500' },
                         { name: 'Marcos Costa', email: 'marcos@flowpet.pro', role: 'Suporte Técnico', status: 'Ausente', last: 'Ontem', avatar: 'MC', color: 'bg-orange-500' },
                         { name: 'Ana Pereira', email: 'ana@flowpet.pro', role: 'Financeiro', status: 'Inativo', last: 'Há 5 dias', avatar: 'AP', color: 'bg-rose-500', inactive: true },
                     ].map((user, i) => (
                         <tr key={i} className={`group hover:bg-white/[0.02] transition-colors ${user.inactive ? 'opacity-50' : ''}`}>
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                                         {user.avatar}
                                     </div>
                                     <div>
                                         <p className="font-semibold text-white">{user.name}</p>
                                         <p className="text-xs text-text-muted">{user.email}</p>
                                     </div>
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 <span className="inline-flex px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-text-muted">
                                     {user.role}
                                 </span>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                     <span className={`w-2 h-2 rounded-full ${user.status === 'Ativo' ? 'bg-emerald-500' : user.status === 'Ausente' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                     <span className="text-white">{user.status}</span>
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-text-muted">{user.last}</td>
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