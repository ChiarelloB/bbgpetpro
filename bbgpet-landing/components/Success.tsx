import React from 'react';

const Success: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-2xl text-center">
                <div className="size-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-4">
                    Pagamento Confirmado!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Obrigado por assinar o Flow Pet. Sua conta está sendo preparada. Entre em contato conosco para finalizar a configuração do seu ambiente.
                </p>
                <div className="space-y-4">
                    <a
                        href="https://wa.me/5511999999999" // Replace with actual support number
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-wide rounded-xl transition-colors shadow-lg shadow-green-500/25"
                    >
                        Falar com Suporte
                    </a>
                    <a
                        href="/"
                        className="block w-full py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-black dark:text-white font-bold uppercase tracking-wide rounded-xl transition-colors"
                    >
                        Voltar para o Início
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Success;
