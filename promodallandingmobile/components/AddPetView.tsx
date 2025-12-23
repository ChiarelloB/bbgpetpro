import React, { useState, useEffect } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { PetProfile } from '../types';

interface AddPetViewProps {
  onCancel: () => void;
  onSave: (data: any) => void;
  onDelete?: (id: string) => void;
  initialData?: PetProfile | null;
}

export const AddPetView: React.FC<AddPetViewProps> = ({ onCancel, onSave, onDelete, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    sex: 'male',
    weight: '',
    size: 'M',
    food: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        breed: initialData.breed,
        age: initialData.age.toString(),
        sex: initialData.stats.sex,
        weight: initialData.stats.weight.toString(),
        size: initialData.stats.size,
        food: initialData.preferences.food
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!formData.name || !formData.breed) {
      alert('Por favor, preencha o nome e a raça.');
      return;
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (initialData && onDelete && confirm(`Tem certeza que deseja excluir ${initialData.name}?`)) {
        onDelete(initialData.id);
    }
  };

  return (
    <div className="animate-[slideUp_0.3s_ease-out] h-full flex flex-col pb-6">
      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-20">
        
        {/* Image Picker */}
        <div className="flex justify-center mt-4">
            <button className="relative w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors group overflow-hidden">
                {initialData ? (
                    <img src={initialData.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                ) : null}
                <Camera size={32} className="group-hover:scale-110 transition-transform relative z-10" />
                <span className="text-xs font-bold uppercase tracking-wide relative z-10">{initialData ? 'Alterar' : 'Adicionar'} Foto</span>
            </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-white/60 px-4 pb-2 border-b border-white/5">Informações Básicas</h3>
            
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Nome</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-glass-bg border border-glass-border rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Raça</label>
                    <input 
                      type="text" 
                      value={formData.breed}
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
                      className="w-full bg-glass-bg border border-glass-border rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" 
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Idade (Anos)</label>
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full bg-glass-bg border border-glass-border rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" 
                    />
                </div>
            </div>
        </div>

        {/* Stats */}
        <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white/60 px-4 pb-2 border-b border-white/5">Características</h3>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Peso (kg)</label>
                    <input 
                      type="number" 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="0.0"
                      className="w-full bg-glass-bg border border-glass-border rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" 
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Porte</label>
                    <select 
                        value={formData.size}
                        onChange={(e) => setFormData({...formData, size: e.target.value})}
                        className="w-full bg-glass-bg border border-glass-border rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                    >
                        <option value="P" className="bg-dark-900">Pequeno (P)</option>
                        <option value="M" className="bg-dark-900">Médio (M)</option>
                        <option value="G" className="bg-dark-900">Grande (G)</option>
                        <option value="GG" className="bg-dark-900">Gigante (GG)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Sexo</label>
                <div className="flex gap-3">
                    <button 
                      onClick={() => setFormData({...formData, sex: 'male'})}
                      className={`flex-1 py-3 rounded-2xl font-bold border transition-transform active:scale-95 ${formData.sex === 'male' ? 'bg-indigo-600 text-white border-indigo-500 shadow-neon' : 'bg-glass-bg border-glass-border text-white/40 hover:bg-white/5'}`}
                    >
                      Macho
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, sex: 'female'})}
                      className={`flex-1 py-3 rounded-2xl font-bold border transition-transform active:scale-95 ${formData.sex === 'female' ? 'bg-pink-600 text-white border-pink-500 shadow-[0_0_20px_-5px_rgba(236,72,153,0.4)]' : 'bg-glass-bg border-glass-border text-white/40 hover:bg-white/5'}`}
                    >
                      Fêmea
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Alimentação Favorita</label>
                <textarea 
                  value={formData.food}
                  onChange={(e) => setFormData({...formData, food: e.target.value})}
                  rows={2}
                  className="w-full bg-glass-bg border border-glass-border rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" 
                />
            </div>
        </div>

        {initialData && (
             <button 
                onClick={handleDelete}
                className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
             >
                <Trash2 size={18} />
                Excluir Pet
             </button>
        )}
      </div>

      <div className="flex gap-4 mt-auto pt-4 border-t border-white/5 bg-dark-900">
          <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-transparent border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} className="flex-[2] py-4 rounded-2xl bg-white text-dark-950 font-black uppercase tracking-wide hover:bg-white/90 transition-colors shadow-lg active:scale-95 transform">
              {initialData ? 'Salvar' : 'Criar Pet'}
          </button>
      </div>
    </div>
  );
};