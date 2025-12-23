import React, { useState, useMemo } from 'react';

const ProfitCalculator: React.FC = () => {
  const [weeklyAppointments, setWeeklyAppointments] = useState(50);
  const [averageTicket, setAverageTicket] = useState(80);
  const [noShowRate, setNoShowRate] = useState(15);

  const calculations = useMemo(() => {
    const monthlyRevenue = weeklyAppointments * 4 * averageTicket;
    const lostRevenue = monthlyRevenue * (noShowRate / 100);
    // Premise: CRM reduces no-show by 80% and increases recurrence by 15%
    const recoveredRevenue = lostRevenue * 0.8; 
    const growthRevenue = monthlyRevenue * 0.15;
    const totalExtra = recoveredRevenue + growthRevenue;
    
    return {
      monthlyRevenue,
      lostRevenue,
      totalExtra
    };
  }, [weeklyAppointments, averageTicket, noShowRate]);

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white mb-6">
            Quanto você está <br/>
            <span className="text-red-500">Deixando na Mesa?</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Use nossa calculadora para estimar o impacto financeiro de reduzir faltas e aumentar a recorrência com o Flow Pet CRM.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center bg-subtle dark:bg-gray-900/50 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-white/5 shadow-2xl">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-10">
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Atendimentos por Semana</label>
                <span className="text-2xl font-black text-black dark:text-white">{weeklyAppointments}</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="300" 
                value={weeklyAppointments} 
                onChange={(e) => setWeeklyAppointments(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-dark transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Ticket Médio (R$)</label>
                <div className="flex items-center bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 w-32">
                  <span className="text-gray-400 mr-2">R$</span>
                  <input 
                    type="number" 
                    value={averageTicket} 
                    onChange={(e) => setAverageTicket(parseInt(e.target.value))}
                    className="w-full bg-transparent font-bold text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <input 
                type="range" 
                min="30" 
                max="300" 
                value={averageTicket} 
                onChange={(e) => setAverageTicket(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-dark transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Taxa de Faltas (No-Show)</label>
                <span className="text-2xl font-black text-red-500">{noShowRate}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={noShowRate} 
                onChange={(e) => setNoShowRate(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-600 transition-all"
              />
              <p className="text-xs text-gray-400 mt-2">Média de mercado: 15-20%</p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl transform rotate-3 scale-105 opacity-20 blur-lg"></div>
            <div className="relative bg-black dark:bg-gray-800 rounded-2xl p-8 text-white border border-gray-700 shadow-xl flex flex-col justify-between h-full min-h-[400px]">
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white/60 mb-8">
                  <span className="material-symbols-outlined">trending_up</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Resultado Mensal</span>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Receita Atual Estimada</p>
                  <p className="text-2xl font-bold text-white/50 line-through decoration-red-500 decoration-2">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculations.monthlyRevenue)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Prejuízo com Faltas</p>
                  <p className="text-xl font-bold text-red-400">
                    - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculations.lostRevenue)}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-sm text-green-400 font-bold uppercase tracking-wide mb-2">Potencial Extra com Flow Pet CRM</p>
                  <p className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">
                    + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculations.totalExtra)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">*Baseado em redução de 80% nas faltas e aumento de 15% na recorrência.</p>
                </div>
              </div>

              <button className="w-full mt-8 bg-white text-black py-4 rounded-xl font-black uppercase tracking-wide hover:bg-gray-100 transition-colors">
                Garantir esse Lucro
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfitCalculator;