import React from 'react';

const courses = [
    {
        title: 'Estética Pet de Elite',
        instructor: 'Renata Banhos',
        duration: '20h',
        lessons: 15,
        category: 'Banho & Tosa',
        image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
        proOnly: true
    },
    {
        title: 'Gestão Financeira para Pet Shops',
        instructor: 'Carlos Mentor',
        duration: '12h',
        lessons: 8,
        category: 'Gestão',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
        proOnly: true
    },
    {
        title: 'Marketing e Fidelização de Clientes',
        instructor: 'Ana Viral',
        duration: '8h',
        lessons: 10,
        category: 'Marketing',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
        proOnly: false
    }
];

const Courses: React.FC = () => {
    return (
        <section id="cursos" className="py-24 bg-slate-50 dark:bg-[#080808] transition-colors overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block">Educação & Treinamento</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase italic italic tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
                            Flow Pet <span className="text-transparent border-b-4 border-primary" style={{ WebkitTextStroke: '1px currentColor' }}>Academy</span>
                        </h2>
                        <p className="text-slate-500 dark:text-gray-400 font-bold mt-6 text-lg">
                            Domine as técnicas mais avançadas do mercado pet com cursos exclusivos para usuários PRO.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">40+</span>
                            <span className="text-[10px] font-black uppercase text-slate-400">Horas de Conteúdo</span>
                        </div>
                        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
                            <span className="text-[10px] font-black uppercase text-slate-400">Prático</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {courses.map((course, idx) => (
                        <div key={idx} className="group bg-white dark:bg-[#111] rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                            <div className="h-56 relative overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-black uppercase px-3 py-1 rounded-full text-slate-900 dark:text-white border border-white/20">
                                        {course.category}
                                    </span>
                                    {course.proOnly && (
                                        <span className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg shadow-primary/40 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">verified</span> Exclusivo PRO
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-gray-500">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{course.duration}</span>
                                    <span className="mx-2">•</span>
                                    <span className="material-symbols-outlined text-sm">play_circle</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{course.lessons} Aulas</span>
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-2 leading-tight">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-gray-400 font-bold mb-6">Instruído por {course.instructor}</p>

                                <button className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${course.proOnly
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90'
                                        : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                                    }`}>
                                    Assistir Agora
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-[3rem]">
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.9rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 dark:text-white">
                                Seja um assinante PRO e tenha acesso a todos os cursos
                            </h3>
                            <p className="text-slate-500 dark:text-gray-400 font-bold mt-2">
                                Atualize sua conta hoje e comece a escalar seu negócio pet.
                            </p>
                        </div>
                        <button className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black uppercase italic tracking-tighter text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30">
                            Quero ser PRO
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Courses;
