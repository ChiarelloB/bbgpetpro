import React, { useState } from 'react';

const DownloadCRM: React.FC = () => {
    const [downloadStarted, setDownloadStarted] = useState(false);

    const handleDownload = () => {
        setDownloadStarted(true);
        // Simulate start delay or analytics here if needed
        setTimeout(() => setDownloadStarted(false), 3000);
    };

    return (
        <section className="py-24 bg-gradient-to-br from-slate-900 to-black relative overflow-hidden text-white">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] opacity-20"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Text Content */}
                    <div className="lg:w-1/2 text-left space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/90">Versão v4.1.0 Estável</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter leading-tight">
                            Baixe o <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Flow Pet PRO</span> para Windows
                        </h2>

                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                            Experimente a gestão definitiva no seu computador. Desempenho nativo, atalhos de teclado, e integração total com o hardware (impressoras e leitores).
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="/downloads/Flow-Pet-PRO-Setup-4.1.0.exe"
                                download="Flow-Pet-PRO-Setup.exe"
                                onClick={handleDownload}
                                className="group relative flex items-center justify-center gap-4 bg-white text-black px-8 py-5 rounded-2xl font-black uppercase tracking-wider hover:bg-gray-100 transition-all active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
                            >
                                {downloadStarted ? (
                                    <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-3xl group-hover:-translate-y-1 transition-transform">download</span>
                                )}
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 text-left">Clique para Baixar</span>
                                    <span className="block text-lg leading-none">Download Windows</span>
                                </div>
                            </a>

                            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-3xl text-slate-400">laptop_windows</span>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Requisitos Mínimos</p>
                                    <p className="text-sm font-bold text-white">Windows 10/11 • 64-bit</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">verified_user</span> Seguro & Verificado</span>
                            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-blue-500 text-lg">rocket_launch</span> Setup Rápido (.exe)</span>
                            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-500 text-lg">update</span> Updates Automáticos</span>
                        </div>
                    </div>

                    {/* Visual/Image Content */}
                    <div className="lg:w-1/2 relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-all duration-700"></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl skew-y-2 group-hover:skew-y-1 transition-all duration-500">
                            {/* Mac-like header for window */}
                            <div className="h-8 bg-slate-800/50 flex items-center gap-2 px-4 border-b border-slate-700/50">
                                <div className="size-3 rounded-full bg-red-500/80"></div>
                                <div className="size-3 rounded-full bg-amber-500/80"></div>
                                <div className="size-3 rounded-full bg-green-500/80"></div>
                            </div>
                            {/* Placeholder for Screenshot - using a div with gradient for now or an image if available */}
                            <div className="aspect-[16/10] bg-slate-900 w-full flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800 opacity-50"></div>
                                <div className="text-center z-10">
                                    <span className="material-symbols-outlined text-7xl text-slate-700 mb-4 block">desktop_windows</span>
                                    <span className="font-bold text-slate-600 uppercase tracking-widest text-sm">Flow Pet CRM Desktop</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default DownloadCRM;
