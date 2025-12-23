import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNotification } from '../NotificationContext';
import { getGeminiModel } from '../src/lib/gemini';
import { useResources } from '../ResourceContext';
import { supabase } from '../src/lib/supabase';
import { useTheme } from '../ThemeContext';
import { DOG_BREEDS, CAT_BREEDS } from '../constants';
import { useSecurity } from '../SecurityContext';
import { UpgradeModal } from '../components/UpgradeModal';

const FREE_LIMIT = 30;


// --- Interfaces ---
interface Pet {
    id: string;
    clientId: string;
    name: string;
    species: string;
    breed: string;
    gender: string;
    birthDate: string;
    weight: number;
    sizeCategory: string;
    notes: string;
    img: string;
    ownerName: string;
    ownerImg: string;
    registeredDate: string;
    gallery?: string[];
}

interface MedicalRecord {
    id: string;
    type: 'vaccine' | 'allergy' | 'condition';
    title: string;
    date: string;
    status: string;
    notes: string;
}

interface ClinicalHistory {
    id: string;
    date: string;
    type: string;
    professional: string;
    notes: string;
    serviceName: string;
}

// --- Modals ---

const EditPetModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (p: any) => void; pet: any }> = ({ isOpen, onClose, onSave, pet }) => {
    const { calculateSize } = useResources();
    const { showNotification } = useNotification();
    const [activeSection, setActiveSection] = useState('basico');
    const [formData, setFormData] = useState(pet);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        if (pet) setFormData(pet);
    }, [pet]);

    useEffect(() => {
        if (formData?.weight) {
            const autoSize = calculateSize(formData.weight);
            setFormData((prev: any) => ({ ...prev, sizeCategory: autoSize, size_category: autoSize }));
        }
    }, [formData?.weight, calculateSize]);

    const handleShuffle = () => {
        const type = formData.species?.toLowerCase() || 'cachorro';
        const randomId = Math.floor(Math.random() * 1000);
        const newImg = type === 'gato'
            ? `https://placekitten.com/150/150?image=${randomId}`
            : `https://placedog.net/150/150?id=${randomId}`;
        setFormData((prev: any) => ({ ...prev, img: newImg }));
    };


    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !formData.id) return;

        try {
            setUploadingPhoto(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${formData.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('pets').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('pets').getPublicUrl(fileName);
            setFormData({ ...formData, img: data.publicUrl });
            showNotification('Foto carregada! Clique em Salvar para confirmar.', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('Erro ao fazer upload da foto', 'error');
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (!isOpen || !pet) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const sections = [
        { id: 'basico', label: 'Básico', icon: 'pets' },
        { id: 'fisico', label: 'Físico', icon: 'monitoring' },
        { id: 'saude', label: 'Saúde', icon: 'health_and_safety' },
        { id: 'comportamento', label: 'Comportamento', icon: 'psychology' },
    ];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] shadow-2xl w-full max-w-4xl relative z-10 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#111]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-1">Editar Perfil</h2>
                            <p className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest">Atualize as informações do pet</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex gap-2 mt-6">
                        {sections.map(sec => (
                            <button key={sec.id} onClick={() => setActiveSection(sec.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSection === sec.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                <span className="material-symbols-outlined text-[16px]">{sec.icon}</span>
                                {sec.label}
                            </button>
                        ))}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 nike-scroll">
                    {/* FOTO Section - Always visible at top */}
                    <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <img src={formData.img || 'https://via.placeholder.com/120'} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg" />
                                {uploadingPhoto && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black shadow-lg cursor-pointer hover:opacity-80 transition-colors mr-10" onClick={handleShuffle}>
                                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-primary-hover transition-colors" onClick={() => document.getElementById('editPetPhotoInput')?.click()}>
                                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-1">Foto do Perfil</h4>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">Clique na câmera ou no sorteio para alterar</p>

                                <input
                                    type="file"
                                    id="editPetPhotoInput"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                    disabled={uploadingPhoto}
                                />
                            </div>
                        </div>
                    </div>
                    {activeSection === 'basico' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Nome do Pet</label><input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none" /></div>
                                <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Espécie</label><select value={formData.species || 'Cachorro'} onChange={e => setFormData({ ...formData, species: e.target.value, breed: '' })} className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none"><option value="Cachorro">🐕 Cachorro</option><option value="Gato">🐈 Gato</option><option value="Outro">🐾 Outro</option></select></div>

                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Raça</label>
                                    {formData.species === 'Outro' ? (
                                        <input
                                            type="text"
                                            required
                                            value={formData.breed || ''}
                                            onChange={e => setFormData({ ...formData, breed: e.target.value })}
                                            className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Digite a raça/espécie..."
                                        />
                                    ) : (
                                        <select
                                            required
                                            value={formData.breed || ''}
                                            onChange={e => setFormData({ ...formData, breed: e.target.value })}
                                            className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="">Selecione...</option>
                                            {(formData.species === 'Gato' ? CAT_BREEDS : DOG_BREEDS).map(breed => (
                                                <option key={breed} value={breed}>{breed}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Gênero</label><select value={formData.gender || 'M'} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none"><option value="M">♂ Macho</option><option value="F">♀ Fêmea</option></select></div>
                                <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Data de Nascimento</label><input type="date" value={formData.birthDate || ''} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none" /></div>
                            </div>
                            <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Cor/Pelagem</label><input type="text" value={formData.color || ''} onChange={e => setFormData({ ...formData, color: e.target.value })} placeholder="Ex: Preto e Branco, Dourado..." className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none" /></div>
                        </div>
                    )}
                    {activeSection === 'fisico' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Peso (kg)</label><input type="number" step="0.1" required value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })} className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none" /></div>
                                <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Porte (Calculado)</label><input type="text" readOnly value={formData.sizeCategory || formData.size_category || ''} className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-gray-400 text-sm px-5 py-4 font-bold" /></div>
                            </div>
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6"><div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-primary text-2xl">info</span><h4 className="font-black text-sm text-slate-900 dark:text-white uppercase">Classificação de Porte</h4></div><div className="space-y-2 text-xs font-bold text-slate-600 dark:text-gray-400"><p>🐕 <span className="text-primary">Pequeno:</span> até 10kg</p><p>🦮 <span className="text-primary">Médio:</span> 10kg - 25kg</p><p>🐕‍🦺 <span className="text-primary">Grande:</span> acima de 25kg</p></div></div>
                        </div>
                    )}
                    {activeSection === 'saude' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-6 p-5 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-700 rounded-2xl"><input type="checkbox" id="castrado" checked={formData.castrated || false} onChange={e => setFormData({ ...formData, castrated: e.target.checked })} className="w-6 h-6 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" /><label htmlFor="castrado" className="flex-1 cursor-pointer"><span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Castrado</span><span className="text-xs text-slate-600 dark:text-gray-400 font-medium">Cirurgia realizada</span></label></div>
                                <div className="flex items-center gap-6 p-5 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-700 rounded-2xl"><input type="checkbox" id="microchip" checked={formData.microchip || false} onChange={e => setFormData({ ...formData, microchip: e.target.checked })} className="w-6 h-6 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" /><label htmlFor="microchip" className="flex-1 cursor-pointer"><span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Microchip</span><span className="text-xs text-slate-600 dark:text-gray-400 font-medium">Identificação eletrônica</span></label></div>
                            </div>
                            <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Número do Microchip</label><input type="text" value={formData.microchipNumber || formData.microchip_number || ''} onChange={e => setFormData({ ...formData, microchipNumber: e.target.value, microchip_number: e.target.value })} placeholder="Ex: 981234567890123" disabled={!formData.microchip} className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 font-bold focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed" /></div>
                            <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Condições Médicas / Alergias</label><textarea rows={4} value={formData.medicalConditions || formData.medical_conditions || ''} onChange={e => setFormData({ ...formData, medicalConditions: e.target.value, medical_conditions: e.target.value })} placeholder="Descreva quaisquer condições médicas, alergias ou restrições de saúde..." className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 resize-none focus:ring-2 focus:ring-primary outline-none" /></div>
                        </div>
                    )}
                    {activeSection === 'comportamento' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Temperamento</label><div className="flex flex-wrap gap-3">{['Dócil', 'Energético', 'Sociável', 'Calmo', 'Brincalhão', 'Tímido', 'Agressivo', 'Medroso'].map(trait => <button key={trait} type="button" onClick={() => { const current = formData.temperament || []; const has = current.includes(trait); setFormData({ ...formData, temperament: has ? current.filter((t: string) => t !== trait) : [...current, trait] }); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${(formData.temperament || []).includes(trait) ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>{trait}</button>)}</div></div>
                            <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Notas / Preferências / Observações</label><textarea rows={6} value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Ex: Gosta de nadar, tem medo de tempestades, prefere ração de frango..." className="w-full rounded-2xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white text-sm px-5 py-4 resize-none focus:ring-2 focus:ring-primary outline-none" /></div>
                        </div>
                    )}
                </form>
                <div className="p-8 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#111] flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} className="px-10 py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">save</span>Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};

const AddPetModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (p: any) => void; initialClientId?: string }> = ({ isOpen, onClose, onSave, initialClientId }) => {
    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        species: 'Cachorro',
        weight: 0,
        gender: 'M',
        clientId: initialClientId || '',
        birthDate: '',
        notes: '',
        img: `https://placedog.net/150/150?id=${Math.floor(Math.random() * 1000)}`
    });

    const [clients, setClients] = useState<any[]>([]);
    const { calculateSize } = useResources();

    const handleShuffle = () => {
        const type = formData.species?.toLowerCase() || 'cachorro';
        const randomId = Math.floor(Math.random() * 1000);
        const newImg = type === 'gato'
            ? `https://placekitten.com/150/150?image=${randomId}`
            : `https://placedog.net/150/150?id=${randomId}`;
        setFormData(prev => ({ ...prev, img: newImg }));
    };


    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('id, name').order('name');
            if (data) setClients(data);
        };
        fetchClients();
    }, []);

    useEffect(() => {
        if (isOpen && initialClientId) {
            setFormData(prev => ({ ...prev, clientId: initialClientId }));
        }
    }, [isOpen, initialClientId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const size = calculateSize(formData.weight);

        const { data, error } = await supabase.from('pets').insert([{
            name: formData.name,
            breed: formData.breed,
            species: formData.species,
            weight: formData.weight,
            gender: formData.gender,
            birth_date: formData.birthDate || null,
            client_id: formData.clientId, // Ensure you select a client!
            size_category: size,
            notes: formData.notes,
            img: formData.img
        }]).select();



        if (!error && data) {
            onSave(data[0]);
            onClose();
        } else {
            console.error(error);
            alert('Erro ao criar pet. Verifique se selecionou um tutor.');
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-lg relative z-10 p-8 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-wider">Novo Pet</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center mb-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-gray-700">
                        <img src={formData.img} alt="Preview" className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-lg object-cover mb-2" />
                        <button type="button" onClick={handleShuffle} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">refresh</span> Sortear Foto
                        </button>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Espécie</label>
                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                            {['Cachorro', 'Gato', 'Outro'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, species: type, breed: '', img: type === 'Gato' ? `https://placekitten.com/150/150?image=${Math.floor(Math.random() * 1000)}` : `https://placedog.net/150/150?id=${Math.floor(Math.random() * 1000)}` })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${formData.species === type ? 'bg-white dark:bg-[#252525] text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>

                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Tutor</label>
                        <select required value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none">
                            <option value="">Selecione um tutor...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Nome</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Raça</label>
                            {formData.species === 'Outro' ? (
                                <input
                                    type="text"
                                    required
                                    value={formData.breed}
                                    onChange={e => setFormData({ ...formData, breed: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Digite a raça..."
                                />
                            ) : (
                                <select
                                    required
                                    value={formData.breed}
                                    onChange={e => setFormData({ ...formData, breed: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    {(formData.species === 'Gato' ? CAT_BREEDS : DOG_BREEDS).map(breed => (
                                        <option key={breed} value={breed}>{breed}</option>
                                    ))}
                                </select>
                            )}

                        </div>

                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Peso (kg)</label>
                            <input type="number" step="0.1" required value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Gênero</label>
                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none">
                                <option value="M">Macho</option>
                                <option value="F">Fêmea</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Data de Nascimento</label>
                        <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all active:scale-[0.98]">Cadastrar Pet</button>
                </form>
            </div>
        </div>
    );
};

const AddMedicalRecordModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (v: any) => void; petId: string }> = ({ isOpen, onClose, onSave, petId }) => {
    const [data, setData] = useState({ type: 'vaccine', title: '', date: new Date().toISOString().split('T')[0], status: 'valid', notes: '' });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('medical_records').insert([{
            pet_id: petId,
            type: data.type,
            title: data.title,
            date: data.date,
            status: data.status,
            notes: data.notes
        }]);
        if (!error) {
            onSave(data);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-sm relative z-10 p-8 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-wider">Novo Registro</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Tipo</label>
                        <select value={data.type} onChange={e => setData({ ...data, type: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none">
                            <option value="vaccine">Vacina</option>
                            <option value="allergy">Alergia</option>
                            <option value="condition">Condição Crônica</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Título</label>
                        <input type="text" required value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: V10 / Antirrábica" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Data</label>
                        <input type="date" required value={data.date} onChange={e => setData({ ...data, date: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm px-4 py-3 font-bold focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all active:scale-[0.98]">Registrar</button>
                </form>
            </div>
        </div>
    );
};

// --- Memoized Components ---
const PetListItem = React.memo(({ pet, isSelected, onSelect }: { pet: Pet, isSelected: boolean, onSelect: (pet: Pet) => void }) => (
    <div
        onClick={() => onSelect(pet)}
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 88px' }}
        className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-[background-color,transform,border-color] duration-200 border group relative overflow-hidden ${isSelected ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10 scale-[1.01]' : 'bg-white dark:bg-[#1a1a1a] dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#222] border-transparent hover:border-slate-200 dark:hover:border-gray-800'}`}
    >

        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 shrink-0 relative bg-slate-200 dark:bg-gray-800">
            <img src={pet.img} loading="lazy" width="56" height="56" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 z-10">
            <h3 className={`font-black text-sm truncate uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{pet.name}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-wide truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{pet.breed}</p>
        </div>
        {isSelected && <span className="absolute right-4 w-2 h-2 rounded-full bg-white animate-pulse"></span>}
    </div>
));


// --- Main Component ---


export const PetProfile: React.FC<{ onNavigate?: (screen: any) => void }> = ({ onNavigate }) => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const [activeTab, setActiveTab] = useState('Histórico Médico');

    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [clinicalHistory, setClinicalHistory] = useState<ClinicalHistory[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
    const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
    const [initialClientId, setInitialClientId] = useState<string | undefined>(undefined);
    const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [healthReport, setHealthReport] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false); // Upload State
    const [visibleCount, setVisibleCount] = useState(20);
    const listEndRef = useRef<HTMLDivElement>(null);
    const { showNotification } = useNotification();
    const { tenant } = useSecurity();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const checkPetLimit = () => {
        const isPro = (tenant as any)?.is_pro === true;
        if (isPro) return true;

        if (pets.length >= FREE_LIMIT) {
            setIsUpgradeModalOpen(true);
            return false;
        }
        return true;
    };


    const handleSelectPet = useCallback((pet: Pet) => {
        setSelectedPet(pet);
    }, []);


    // Upload Refs
    const profileImageInputRef = useRef<HTMLInputElement>(null);
    const galleryImageInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        setVisibleCount(20);
    }, [debouncedSearchTerm]);

    const fetchPets = async () => {


        setLoading(true);
        const { data, error } = await supabase
            .from('pets')
            .select('*, clients(name)')
            .order('name', { ascending: true });

        if (!error && data) {
            const mappedPets: Pet[] = data.map(p => ({
                id: p.id,
                clientId: p.client_id,
                name: p.name,
                species: p.species,
                breed: p.breed,
                gender: p.gender,
                birthDate: p.birth_date,
                weight: p.weight,
                sizeCategory: p.size_category,
                notes: p.notes,
                img: p.img || (p.species?.toLowerCase() === 'gato' ? `https://placekitten.com/150/150?image=${p.id.charCodeAt(0) % 1000}` : `https://placedog.net/150/150?id=${p.id.charCodeAt(0) % 1000}`),

                ownerName: p.clients?.name || 'Desconhecido',
                ownerImg: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.clients?.name || 'U')}&background=random`,
                registeredDate: new Date(p.created_at).toLocaleDateString(),
                gallery: p.gallery || []
            }));
            setPets(mappedPets);

            const targetId = localStorage.getItem('petmanager_target_pet_id');
            if (targetId) {
                const target = mappedPets.find(p => p.id === targetId);
                if (target) setSelectedPet(target);
                localStorage.removeItem('petmanager_target_pet_id');
            }

            // Check for trigger to add new pet for a specific client
            const triggerAdd = localStorage.getItem('petmanager_trigger_add_pet');
            const prefilledClientId = localStorage.getItem('petmanager_initial_client_id');
            if (triggerAdd === 'true' && prefilledClientId) {
                if (checkPetLimit()) {
                    setInitialClientId(prefilledClientId);
                    setIsAddPetModalOpen(true);
                }
                localStorage.removeItem('petmanager_trigger_add_pet');
                localStorage.removeItem('petmanager_initial_client_id');
            } else if (mappedPets.length > 0 && !selectedPet) {
                setSelectedPet(mappedPets[0]);
            }
        }
        setLoading(false);
    };

    const fetchPetDetails = async (petId: string) => {
        // Fetch Medical Records
        const { data: records } = await supabase.from('medical_records').select('*').eq('pet_id', petId).order('date', { ascending: false });
        setMedicalRecords((records || []).map(r => ({
            id: r.id,
            type: r.type,
            title: r.title,
            date: new Date(r.date).toLocaleDateString(),
            status: r.status,
            notes: r.notes
        })));

        // Fetch Clinical History (from appointments)
        const { data: appts } = await supabase.from('appointments').select('*').eq('pet_id', petId).in('status', ['completed', 'in-progress', 'finished']).order('start_time', { ascending: false });
        setClinicalHistory((appts || []).map(a => ({
            id: a.id,
            date: new Date(a.start_time).toLocaleDateString(),
            type: a.service, // In a real app this might be a category
            professional: a.professional || 'N/A',
            notes: a.notes || 'Sem observações clínicas.',
            serviceName: a.service
        })));
    };

    useEffect(() => {
        fetchPets();
    }, []);

    useEffect(() => {
        if (selectedPet) fetchPetDetails(selectedPet.id);
    }, [selectedPet]);

    // --- Upload Handlers ---
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            if (!selectedPet) return null;
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${selectedPet.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('pets').upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('pets').getPublicUrl(fileName);
            return data.publicUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification('Erro ao fazer upload da imagem', 'error');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedPet) return;

        const file = e.target.files[0];
        const publicUrl = await uploadImage(file);

        if (publicUrl) {
            const { error } = await supabase.from('pets').update({ img: publicUrl }).eq('id', selectedPet.id);
            if (!error) {
                showNotification('Foto de perfil atualizada!', 'success');
                setPets(prev => prev.map(p => p.id === selectedPet.id ? { ...p, img: publicUrl } : p));
                setSelectedPet(prev => prev ? { ...prev, img: publicUrl } : null);
            }
        }
        if (profileImageInputRef.current) profileImageInputRef.current.value = '';
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedPet) return;

        const file = e.target.files[0];
        const publicUrl = await uploadImage(file);

        if (publicUrl) {
            const currentGallery = selectedPet.gallery || [];
            const newGallery = [...currentGallery, publicUrl];

            const { error } = await supabase.from('pets').update({ gallery: newGallery }).eq('id', selectedPet.id);
            if (!error) {
                showNotification('Foto adicionada à galeria!', 'success');
                setPets(prev => prev.map(p => p.id === selectedPet.id ? { ...p, gallery: newGallery } : p));
                setSelectedPet(prev => prev ? { ...prev, gallery: newGallery } : null);
            }
        }
        if (galleryImageInputRef.current) galleryImageInputRef.current.value = '';
    };

    const handleSetProfileFromGallery = async (imgUrl: string) => {
        if (!selectedPet) return;
        const { error } = await supabase.from('pets').update({ img: imgUrl }).eq('id', selectedPet.id);
        if (!error) {
            showNotification('Foto de perfil atualizada da galeria!', 'success');
            setPets(prev => prev.map(p => p.id === selectedPet.id ? { ...p, img: imgUrl } : p));
            setSelectedPet(prev => prev ? { ...prev, img: imgUrl } : null);
        }
    };

    const handleUpdatePet = async (updated: any) => {
        try {
            console.log('=== UPDATE PET DEBUG ===');
            console.log('Updated data received:', updated);

            // Prepare update object with all fields
            const updateData: any = {
                name: updated.name,
                breed: updated.breed,
                species: updated.species || 'Cachorro',
                gender: updated.gender || 'M',
                birth_date: updated.birthDate || updated.birth_date || null,
                weight: updated.weight,
                size_category: updated.sizeCategory || updated.size_category,
                color: updated.color || null,
                notes: updated.notes || '',
                castrated: updated.castrated || false,
                microchip: updated.microchip || false,
                microchip_number: updated.microchipNumber || updated.microchip_number || null,
                medical_conditions: updated.medicalConditions || updated.medical_conditions || null,
                // Convert temperament array to JSON string for database
                temperament: updated.temperament ? JSON.stringify(updated.temperament) : null
            };

            // Handle photo URL
            if (updated.img && updated.img.startsWith('http')) {
                updateData.img = updated.img;
            }

            console.log('Update data prepared:', updateData);
            console.log('Pet ID:', updated.id);

            const { error, data } = await supabase
                .from('pets')
                .update(updateData)
                .eq('id', updated.id)
                .select();

            console.log('Supabase response:', { error, data });

            if (error) {
                console.error('Update error details:', error);
                showNotification(`Erro ao atualizar pet: ${error.message}`, 'error');
            } else {
                console.log('Update successful!');
                showNotification('Perfil do pet atualizado!', 'success');
                fetchPets(); // Refresh list to update all fields
                if (selectedPet && selectedPet.id === updated.id) {
                    setSelectedPet(updated);
                    fetchPetDetails(updated.id); // Refresh detail view
                }
            }
        } catch (err: any) {
            console.error('Update exception:', err);
            showNotification(`Erro ao atualizar pet: ${err.message || 'Erro desconhecido'}`, 'error');
        }
    };

    const handleAddPet = (newPet: any) => {
        showNotification('Novo pet cadastrado!', 'success');
        fetchPets();
    };

    const handleGenerateHealthReport = async () => {
        if (!selectedPet) return;
        setIsHealthModalOpen(true);
        setIsGenerating(true);
        try {
            const model = getGeminiModel();
            const petContext = `Pet: ${selectedPet.name}, Espécie: ${selectedPet.species}, Raça: ${selectedPet.breed}, Peso: ${selectedPet.weight}kg. Histórico Recente: ${clinicalHistory.slice(0, 3).map(h => h.serviceName).join(', ')}. Vacinas: ${medicalRecords.filter(r => r.type === 'vaccine').map(v => v.title).join(', ')}`;
            const prompt = `Atue como um veterinário sênior. Gere uma análise rápida de saúde e recomendações preventivas para este pet: ${petContext}. Use formatação Markdown, seja breve e encorajador.`;
            const result = await model.generateContent(prompt);
            setHealthReport(result.response.text());
        } catch (e) {
            setHealthReport("Não foi possível gerar o relatório de IA no momento. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredPets = useMemo(() => {
        return pets.filter(p => p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || p.ownerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }, [pets, debouncedSearchTerm]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + 20);
                }
            },
            { threshold: 0.5 }
        );

        if (listEndRef.current) observer.observe(listEndRef.current);
        return () => observer.disconnect();
    }, [filteredPets]); // Re-observe when items change




    if (loading && pets.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#111]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Carregando Pets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#09090b] flex-col md:flex-row animate-in fade-in duration-500">
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                limit={FREE_LIMIT}
                type="pets"
                onUpgrade={() => onNavigate?.('account')}
            />
            {selectedPet && <EditPetModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdatePet} pet={selectedPet} />}
            <AddPetModal
                isOpen={isAddPetModalOpen}
                onClose={() => {
                    setIsAddPetModalOpen(false);
                    setInitialClientId(undefined);
                }}
                onSave={handleAddPet}
                initialClientId={initialClientId}
            />
            {selectedPet && <AddMedicalRecordModal isOpen={isAddRecordOpen} onClose={() => setIsAddRecordOpen(false)} onSave={() => fetchPetDetails(selectedPet.id)} petId={selectedPet.id} />}

            {/* Hidden Inputs for Uploads */}
            <input type="file" ref={profileImageInputRef} hidden accept="image/*" onChange={handleProfileImageUpload} />
            <input type="file" ref={galleryImageInputRef} hidden accept="image/*" onChange={handleGalleryUpload} />

            {/* AI Health Modal */}
            {isHealthModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsHealthModalOpen(false)}></div>
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 border border-slate-100 dark:border-gray-800">
                        <div className="p-8 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
                            <div className="flex items-center gap-3 text-primary">
                                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                                <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white tracking-widest">Análise Clínica IA</h2>
                            </div>
                            <button onClick={() => setIsHealthModalOpen(false)} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {isGenerating ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Analisando Histórico...</p>
                                </div>
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
                                        <div className="whitespace-pre-wrap font-medium text-slate-600 dark:text-gray-300 leading-relaxed">{healthReport}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar List */}
            <div className="w-full md:w-[320px] lg:w-[380px] flex flex-col border-r border-slate-200 dark:border-gray-800 bg-white dark:bg-[#121212] h-[300px] md:h-full shrink-0 z-20">
                <div className="p-8 border-b border-slate-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Pets</h1>
                        <button onClick={() => {
                            if (checkPetLimit()) {
                                setIsAddPetModalOpen(true);
                            }
                        }} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined group-focus-within:text-primary transition-colors">search</span>
                        <input type="text" placeholder="Buscar pet..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600" />
                    </div>
                </div>
                <div
                    className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3"
                    style={{ willChange: 'transform' }}
                >

                    {filteredPets.slice(0, visibleCount).map(pet => (
                        <PetListItem
                            key={pet.id}
                            pet={pet}
                            isSelected={selectedPet?.id === pet.id}
                            onSelect={handleSelectPet}
                        />
                    ))}
                    <div ref={listEndRef} className="h-4 w-full" />

                </div>

            </div>

            {/* Main Content */}
            <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-[#09090b] relative">
                {selectedPet ? (
                    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Clientes</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span className="text-primary cursor-pointer hover:underline" onClick={() => {/* Navigate to client */ }}>{selectedPet.ownerName}</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span className="text-slate-600 dark:text-white">{selectedPet.name}</span>
                        </div>

                        {/* Top Action Bar */}
                        <div className="flex justify-end gap-4">
                            <button onClick={handleGenerateHealthReport} className="h-10 px-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all shadow-lg active:scale-95">
                                <span className="material-symbols-outlined text-[16px]">auto_awesome</span> Análise IA
                            </button>
                            <button className="h-10 px-5 border border-slate-200 dark:border-gray-700 rounded-full font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                                Agendar Consulta
                            </button>
                            <button onClick={() => setIsEditModalOpen(true)} className="h-10 px-5 bg-primary text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">edit</span> Editar Perfil
                            </button>
                        </div>

                        {/* Hero Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <div className="bg-[#1a1a1a] rounded-[2rem] p-6 text-center text-white shadow-2xl relative overflow-hidden group border border-gray-800">
                                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent opacity-50"></div>
                                    <div
                                        className="relative w-64 h-64 mx-auto mb-6 rounded-full p-2 border-4 border-white/10 cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => !isUploading && profileImageInputRef.current?.click()}
                                    >
                                        <img src={selectedPet.img} loading="lazy" alt={selectedPet.name} className={`w-full h-full object-cover rounded-full shadow-2xl group-hover:scale-105 transition-transform duration-500 ${isUploading ? 'opacity-50' : ''}`} />

                                        <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            {isUploading ? (
                                                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl">photo_camera</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-3 mb-6">
                                        <span className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">{selectedPet.gender === 'F' ? 'Fêmea' : 'Macho'}</span>
                                        <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">{selectedPet.breed}</span>
                                    </div>
                                    <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none">{selectedPet.name}</h1>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-8">Cadastrado em {selectedPet.registeredDate}</p>

                                    <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Idade</p>
                                            <p className="text-xl font-black italic">
                                                {(() => {
                                                    if (!selectedPet.birthDate) return '-';
                                                    const birth = new Date(selectedPet.birthDate);
                                                    const today = new Date();
                                                    let ageYears = today.getFullYear() - birth.getFullYear();
                                                    const m = today.getMonth() - birth.getMonth();
                                                    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                                                        ageYears--;
                                                    }

                                                    if (ageYears >= 1) {
                                                        return `${ageYears} ${ageYears === 1 ? 'Ano' : 'Anos'}`;
                                                    } else {
                                                        const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
                                                        return `${months} ${months === 1 ? 'Mês' : 'Meses'}`;
                                                    }
                                                })()}
                                            </p>
                                        </div>
                                        <div className="border-l border-white/10">
                                            <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Peso</p>
                                            <p className="text-xl font-black italic">{selectedPet.weight} kg</p>
                                        </div>
                                        <div className="border-l border-white/10">
                                            <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Porte</p>
                                            <p className="text-xl font-black italic">{selectedPet.sizeCategory}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 border border-slate-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <img src={selectedPet.ownerImg} loading="lazy" className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-gray-700" />

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Tutor Responsável</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{selectedPet.ownerName}</p>
                                        </div>
                                    </div>
                                    <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-green-500 hover:text-white text-slate-400 transition-colors flex items-center justify-center">
                                        <span className="material-symbols-outlined">call</span>
                                    </button>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-8">
                                {/* Highlights and Widgets */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-primary rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute right-[-20px] bottom-[-20px] opacity-20"><span className="material-symbols-outlined text-[150px]">vaccines</span></div>
                                        <div className="flex gap-2 mb-4 relative z-10">
                                            <span className="px-2 py-0.5 bg-white text-primary text-[10px] font-black uppercase rounded">Vacinação</span>
                                            {(() => {
                                                const vaccines = medicalRecords.filter(r => r.type === 'vaccine');
                                                const upcoming = vaccines.find(v => v.status === 'upcoming' || v.status === 'expiring');
                                                if (upcoming) return <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black uppercase rounded animate-pulse">Atenção</span>;
                                                if (vaccines.length > 0) return <span className="px-2 py-0.5 bg-emerald-400 text-white text-[10px] font-black uppercase rounded">Em Dia</span>;
                                                return null;
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2 relative z-10">Próxima Vacina</h3>
                                            <p className="text-sm font-medium opacity-90 mb-6 relative z-10">
                                                {(() => {
                                                    const vaccines = medicalRecords.filter(r => r.type === 'vaccine');
                                                    // For now, let's look for records that might be "next" in notes or status. 
                                                    // If no specific "next" field, show the status of the most recent one or a generic message.
                                                    if (vaccines.length === 0) return "Nenhuma vacina registrada para este pet.";
                                                    const latest = vaccines[0]; // Already sorted by date desc in fetchPetDetails
                                                    return `Status: ${latest.title} aplicada em ${latest.date}. Mantenha o cronograma em dia!`;
                                                })()}
                                            </p>
                                        </div>
                                        <button onClick={() => setIsAddRecordOpen(true)} className="bg-white text-primary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg relative z-10 w-fit">Atualizar Carteira</button>
                                    </div>


                                    <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Temperamento</h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {['Dócil', 'Energético', 'Sociável'].map(tag => (
                                                <span key={tag} className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase border border-slate-200 dark:border-gray-700 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[14px]">bolt</span> {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 italic leading-relaxed">"{selectedPet.notes || `Informações sobre o comportamento de ${selectedPet.name} ainda não registradas.`}"</p>
                                    </div>
                                </div>

                                {/* Tabs Navigation */}
                                <div>
                                    <div className="flex gap-8 border-b border-slate-200 dark:border-gray-800 mb-6">
                                        {['Histórico Médico', 'Galeria', 'Preferências', 'Prontuário Médico'].map(tab => (
                                            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                                                {tab}
                                                {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    {activeTab === 'Histórico Médico' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

                                            {/* Vaccines Section */}
                                            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">Vacinas</h3>
                                                    <button onClick={() => setIsAddRecordOpen(true)} className="text-[10px] font-bold text-primary uppercase flex items-center gap-1 hover:underline"><span className="material-symbols-outlined text-[16px]">add_circle</span> Nova Vacina</button>
                                                </div>
                                                <div className="space-y-4">
                                                    {medicalRecords.filter(r => r.type === 'vaccine').length > 0 ? medicalRecords.filter(r => r.type === 'vaccine').map(vac => (
                                                        <div key={vac.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-gray-700 transition-all">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${vac.status === 'valid' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                <span className="material-symbols-outlined text-[20px]">vaccines</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{vac.title}</h4>
                                                                <p className="text-[10px] text-slate-500 uppercase">Aplicada em {vac.date}</p>
                                                            </div>
                                                            {vac.status === 'valid' ?
                                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase rounded">Válida</span> :
                                                                <span className="px-2 py-1 bg-orange-500/10 text-orange-600 text-[9px] font-black uppercase rounded">Vence em breve</span>
                                                            }
                                                        </div>
                                                    )) : (
                                                        <p className="text-center py-4 text-xs text-slate-400 italic">Nenhuma vacina registrada.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Clinical History List */}
                                            <div className="space-y-0">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Histórico de Atendimentos</h3>
                                                {clinicalHistory.map((item, idx) => (
                                                    <div key={item.id} className="relative pl-8 pb-8 border-l-2 border-slate-100 dark:border-gray-800 last:pb-0 last:border-transparent">
                                                        <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-[#09090b] border-4 border-slate-200 dark:border-gray-700"></span>
                                                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">{item.type}</span>
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</span>
                                                                    </div>
                                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.serviceName}</h4>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.professional)}&background=random`} className="w-6 h-6 rounded-full" />
                                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase">{item.professional}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed italic border-t border-slate-100 dark:border-gray-800 pt-3 mt-3">
                                                                "{item.notes}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {clinicalHistory.length === 0 && <p className="text-center py-8 text-slate-400 italic text-sm">Nenhum histórico clínico encontrado.</p>}
                                            </div>

                                            {/* Allergies & Restrictions */}
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Alergias & Restrições</h3>
                                                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined">warning</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-rose-700 dark:text-rose-400 uppercase text-xs mb-2">Alergias Conhecidas</h4>
                                                            {selectedPet.medicalConditions || selectedPet.medical_conditions ? (
                                                                <p className="text-xs font-bold text-rose-600/90 dark:text-rose-300 leading-relaxed">
                                                                    {selectedPet.medicalConditions || selectedPet.medical_conditions}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs font-medium text-slate-400 italic">Nenhuma alergia ou restrição registrada.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Galeria' && (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                                            <button
                                                onClick={() => galleryImageInputRef.current?.click()}
                                                className="aspect-square rounded-2xl bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-gray-700 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all group"
                                            >
                                                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_a_photo</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest mt-2">{selectedPet.gallery?.length === 0 ? 'Adicionar Foto' : 'Nova Foto'}</span>
                                            </button>
                                            {selectedPet.gallery && selectedPet.gallery.length > 0 ? selectedPet.gallery.map((img, i) => (
                                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-800 relative group">
                                                    <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleSetProfileFromGallery(img); }}
                                                            className="px-3 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">photo_camera_front</span> Perfil
                                                        </button>
                                                        <div className="flex gap-2">
                                                            <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-sm">visibility</span></button>
                                                            <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500 text-white flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="col-span-full py-10 text-center text-slate-400 italic text-xs">
                                                    Galeria vazia. Adicione fotos do pet!
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <span className="material-symbols-outlined text-6xl mb-6">pets</span>
                        <p className="font-black uppercase tracking-widest text-sm">Selecione um Pet para ver o perfil</p>
                    </div>
                )}
            </div>
        </div>
    );
};