import React from 'react';
import { Activity, CheckCircle, AlertTriangle, Ban, Sparkles } from 'lucide-react';
import { Vaccine, MedicalAlert } from '../types';

interface HealthSectionProps {
  vaccines: Vaccine[];
  alerts: MedicalAlert[];
  onScheduleVaccine?: () => void;
}

export const HealthSection: React.FC<HealthSectionProps> = ({ vaccines, alerts, onScheduleVaccine }) => {
  return (
    <div className="bg-glass-bg border border-glass-border rounded-3xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <Activity className="text-indigo-400" size={24} />
          Saúde
        </h3>
        <button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          Ver Tudo
        </button>
      </div>

      <div className="space-y-3">
        {/* Valid Vaccine */}
        <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
          <div className="text-emerald-500 mt-0.5">
            <CheckCircle size={24} fill="currentColor" className="text-dark-900" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-sm text-white/90">V10 (Polivalente)</h4>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                EM DIA
              </span>
            </div>
            <p className="text-xs text-white/40 mt-1">Aplicada: 10 Ago 2023</p>
          </div>
        </div>

        {/* Expiring Vaccine */}
        <div className="flex items-start gap-4 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="text-amber-500 mt-0.5 relative z-10">
            <AlertTriangle size={24} fill="currentColor" className="text-dark-900" />
          </div>
          <div className="flex-1 relative z-10">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-sm text-white/90">Antirrábica</h4>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap ml-2">
                VENCE EM 15 DIAS
              </span>
            </div>
            <button 
              onClick={onScheduleVaccine}
              className="mt-3 w-full py-2 rounded-xl bg-amber-500/90 text-black text-xs font-bold uppercase tracking-wide hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/20 active:scale-95"
            >
              Agendar Reforço
            </button>
          </div>
        </div>

        {/* Medical Alerts */}
        <div className="pt-2">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">
            Alertas Médicos
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              <Ban size={14} />
              Alergia a Frango
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
              <Sparkles size={14} />
              Pele Sensível
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};