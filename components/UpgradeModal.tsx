import React from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    type: 'clientes' | 'pets';
    limit: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, type, limit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 p-10 border border-slate-200 dark:border-gray-800 animate-in zoom-in-95 text-center">
                <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-amber-50 dark:border-amber-900/30">
                    <span className="material-symbols-outlined text-5xl text-amber-500 animate-pulse">workspace_premium</span>
                </div>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase italic leading-tight">
                    Limite <span className="text-amber-500">Atingido!</span>
                </h2>

                <p className="text-slate-500 dark:text-gray-400 font-medium mb-8">
                    Sua conta gratuita permite cadastrar até <span className="font-black text-slate-900 dark:text-white">{limit} {type}</span>.
                    Para continuar expandindo seu negócio e ter acesso a recursos exclusivos, faça o upgrade para o <span className="text-primary font-black">Plano PRO</span>.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={onUpgrade}
                        className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Fazer Upgrade Agora
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold uppercase text-[10px] tracking-widest transition-colors"
                    >
                        Talvez mais tarde
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-gray-800">
                    <div className="flex items-center justify-center gap-6 text-slate-400">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Cursos PRO</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pets Ilimitados</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
