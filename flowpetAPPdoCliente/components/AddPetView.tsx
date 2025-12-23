import React, { useState, useEffect, useRef } from 'react';
import { Camera, Trash2, X, ImagePlus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
    food: '',
    photo_url: ''
  });

  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        breed: initialData.breed,
        age: initialData.age.toString(),
        sex: initialData.stats.sex,
        weight: initialData.stats.weight.toString(),
        size: initialData.stats.size,
        food: initialData.preferences.food,
        photo_url: initialData.imageUrl || ''
      });
    }
  }, [initialData]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setFormData({ ...formData, photo_url: dataUrl });
      stopCamera();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Convert to base64 for preview (will be uploaded to Supabase on save)
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photo_url: reader.result as string });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

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
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-4">
            <span className="text-white font-bold">Tire uma foto</span>
            <button onClick={stopCamera} className="p-2 bg-white/10 rounded-full">
              <X size={24} className="text-white" />
            </button>
          </div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="flex-1 object-cover"
          />
          <div className="p-6 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full border-4 border-indigo-600"></div>
            </button>
          </div>
        </div>
      )}

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-20">

        {/* Image Picker */}
        <div className="flex justify-center mt-4">
          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors group overflow-hidden"
            >
              {formData.photo_url ? (
                <img src={formData.photo_url} className="absolute inset-0 w-full h-full object-cover" />
              ) : initialData?.imageUrl ? (
                <img src={initialData.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
              ) : null}

              {uploading ? (
                <Loader2 size={32} className="animate-spin relative z-10" />
              ) : !formData.photo_url && !initialData?.imageUrl ? (
                <>
                  <ImagePlus size={32} className="group-hover:scale-110 transition-transform relative z-10" />
                  <span className="text-xs font-bold uppercase tracking-wide relative z-10">Foto</span>
                </>
              ) : (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-white">Alterar</span>
                </div>
              )}
            </button>

            {/* Camera Button */}
            <button
              onClick={startCamera}
              className="absolute -right-2 -bottom-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors"
            >
              <Camera size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white/60 px-4 pb-2 border-b border-white/5">Informações Básicas</h3>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Raça</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Idade (Anos)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
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
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Porte</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
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
                onClick={() => setFormData({ ...formData, sex: 'male' })}
                className={`flex-1 py-3 rounded-2xl font-bold border transition-transform active:scale-95 ${formData.sex === 'male' ? 'bg-indigo-600 text-white border-indigo-500 shadow-neon' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
              >
                Macho
              </button>
              <button
                onClick={() => setFormData({ ...formData, sex: 'female' })}
                className={`flex-1 py-3 rounded-2xl font-bold border transition-transform active:scale-95 ${formData.sex === 'female' ? 'bg-pink-600 text-white border-pink-500 shadow-[0_0_20px_-5px_rgba(236,72,153,0.4)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
              >
                Fêmea
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-4">Alimentação Favorita</label>
            <textarea
              value={formData.food}
              onChange={(e) => setFormData({ ...formData, food: e.target.value })}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
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