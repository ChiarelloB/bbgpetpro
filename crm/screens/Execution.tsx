import React, { useState, useEffect } from 'react';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';
import { useSecurity } from '../SecurityContext';
import { loadAdvancedTemplates, AdvancedChecklistTemplate, TemplateSection, TemplateField } from '../components/TemplateBuilder';


// --- Types ---
type ServiceStage = 'waiting' | 'in-progress' | 'ready' | 'finished';

interface ChecklistItem {
  id: string;
  text: string;
  requiresPhoto: boolean;
}

interface ServiceTask {
  id: string;
  petName: string;
  breed: string;
  ownerName: string;
  petAvatar: string;
  serviceType: string;
  appointmentId: string;
  status: ServiceStage;
  currentStepIndex: number;
  steps: { label: string; key: string }[];
  execution_started_at?: string;
  checklist: ChecklistItem[];
  checkedItems: string[]; // IDs of checked items
  notes: string;
  responsible: string;
  responsibleAvatar: string;
  category: string;
  petId: string;
  clientId: string;
  duration?: number;
  checkin_checklist?: AdvancedChecklistTemplate;
  checkout_checklist?: AdvancedChecklistTemplate;
  used_products?: { id: string; name: string; quantity: number; price: number }[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

// --- Timeline Details Modal (for finished services) ---
const TimelineDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  task: ServiceTask;
  finalPhoto?: string;
}> = ({ isOpen, onClose, task, finalPhoto }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  if (!isOpen) return null;

  const stageConfig = [
    { icon: 'login', label: 'Check-in', gradient: 'from-sky-400 to-blue-500', bgLight: 'bg-sky-50 dark:bg-sky-900/20', textColor: 'text-sky-600 dark:text-sky-400', borderColor: 'border-sky-200 dark:border-sky-800' },
    { icon: 'play_arrow', label: 'Execução', gradient: 'from-indigo-400 to-violet-600', bgLight: 'bg-violet-50 dark:bg-violet-900/20', textColor: 'text-violet-600 dark:text-violet-400', borderColor: 'border-violet-200 dark:border-violet-800' },
    { icon: 'check_circle', label: 'Finalizado', gradient: 'from-emerald-400 to-teal-500', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-800' }
  ];

  // Distribute checklist items across steps (skip first step - check-in)
  const getChecklistForStep = (stepIndex: number) => {
    if (task.checklist.length === 0 || stepIndex === 0) return [];
    return task.checklist;
  };

  const checkinRaw = task.checkedItems?.find(i => i.startsWith('CHECKIN:'));
  const checkinData = checkinRaw ? JSON.parse(checkinRaw.replace('CHECKIN:', '')) : null;

  const checkoutRaw = task.checkedItems?.find(i => i.startsWith('CHECKOUT:'));
  const checkoutData = checkoutRaw ? JSON.parse(checkoutRaw.replace('CHECKOUT:', '')) : null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-200 dark:border-gray-800 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-rose-500/10"></div>
          <div className="relative p-5 border-b border-slate-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={task.petAvatar} className="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-gray-800" alt={task.petName} />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-white text-[10px]">check</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{task.petName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{task.serviceType}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500 dark:text-gray-400">{task.ownerName}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-slate-500 dark:text-gray-400 text-lg">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Content - Zig-Zag Layout */}
        <div className="flex-1 overflow-y-auto p-5">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">timeline</span>
            Linha do Tempo do Atendimento
          </h3>

          {/* Zig-Zag Timeline */}
          <div className="relative">
            {stageConfig.map((stage, idx) => {
              const isLeft = idx % 2 === 0;
              const stepChecklist = getChecklistForStep(idx);

              return (
                <div key={idx}>
                  {/* Stage Card - Zig Zag */}
                  <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-[85%] ${stage.bgLight} rounded-xl p-4 border ${stage.borderColor} shadow-sm hover:shadow-md transition-all`}>
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stage.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                          <span className="material-symbols-outlined text-white text-base">{stage.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-black uppercase tracking-tight ${stage.textColor}`}>
                            {task.steps[idx]?.label || stage.label}
                          </h4>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-[10px]">check_circle</span>
                            <span className="text-[9px] font-bold">Concluído</span>
                          </span>
                        </div>
                      </div>

                      {/* Check-in Details (Step 0) */}
                      {idx === 0 && checkinData && (
                        <div className="space-y-4 mb-3">
                          {/* Render dynamic values if they exist, otherwise fallback to legacy */}
                          {checkinData.dynamicValues ? (
                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(checkinData.dynamicValues).map(([key, value]) => (
                                <div key={key} className="p-2 bg-white/50 dark:bg-black/20 rounded-lg flex justify-between items-center">
                                  <span className="text-[10px] font-black text-slate-400 uppercase">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    {typeof value === 'boolean' ? (value ? '✅ Sim' : '❌ Não') : value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pertences</p>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(checkinData.belongings || {}).map(([k, v]) => v && (
                                    <span key={k} className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded uppercase">
                                      {k === 'outros' ? checkinData.belongings.outros : k}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Análise</p>
                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Pelo: {checkinData.analysis?.hairState || 'N/A'}</p>
                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Sujeira: {checkinData.analysis?.dirtLevel || 'N/A'}</p>
                                {(checkinData.analysis?.parasites || checkinData.analysis?.wounds) && (
                                  <div className="flex gap-1 mt-1">
                                    {checkinData.analysis.parasites && <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded font-black italic">! PARASITAS</span>}
                                    {checkinData.analysis.wounds && <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded font-black italic">! LESÕES</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {!checkinData.dynamicValues && (checkinData.grooming?.scissors || checkinData.grooming?.machine) && (
                            <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg border-l-2 border-orange-400">
                              <p className="text-[9px] font-black text-orange-500 uppercase mb-1 italic">Instruções de Tosa</p>
                              {checkinData.grooming.scissors && <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Tesoura: {checkinData.grooming.scissors}</p>}
                              {checkinData.grooming.machine && <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Máquina: {checkinData.grooming.machine}</p>}
                            </div>
                          )}
                          {checkinData.photos?.length > 0 && (
                            <div className="flex gap-1 mt-2 overflow-x-auto pb-1 nike-scroll">
                              {checkinData.photos.map((url: string, i: number) => (
                                <img key={i} src={url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Checkout Details (Step 2) */}
                      {idx === 2 && checkoutData && (
                        <div className="space-y-3 mb-3">
                          {checkoutData.dynamicValues ? (
                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(checkoutData.dynamicValues).map(([key, value]) => (
                                <div key={key} className="p-2 bg-white/50 dark:bg-black/20 rounded-lg flex justify-between items-center">
                                  <span className="text-[10px] font-black text-slate-400 uppercase">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    {typeof value === 'boolean' ? (value ? '✅ Sim' : '❌ Não') : value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(checkoutData.quality || {}).map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between p-1.5 bg-white/40 dark:bg-black/10 rounded-lg">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase">{k}</span>
                                  <span className={`text-[9px] font-black uppercase px-1 rounded ${v === 'Bom' ? 'text-emerald-500 bg-emerald-100' : 'text-red-500 bg-red-100'}`}>{v}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {(checkoutData.generalNotes || checkoutData.behavior || checkoutData.recommendations) && (
                            <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg space-y-1">
                              {checkoutData.behavior && <p className="text-[10px] text-slate-600 dark:text-slate-400 italic"><strong>Comportamento:</strong> {checkoutData.behavior}</p>}
                              {checkoutData.recommendations && <p className="text-[10px] text-slate-600 dark:text-slate-400 italic"><strong>Dicas:</strong> {checkoutData.recommendations}</p>}
                              {checkoutData.generalNotes && <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">"{checkoutData.generalNotes}"</p>}
                            </div>
                          )}
                          {checkoutData.photos?.length > 0 && (
                            <div className="flex gap-1 mt-2 overflow-x-auto pb-1 nike-scroll">
                              {checkoutData.photos.map((url: string, i: number) => (
                                <img key={i} src={url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Checklist items for this step */}
                      {stepChecklist.length > 0 && (
                        <div className="space-y-1.5 mb-3 pl-1 border-l-2 border-emerald-200 dark:border-emerald-800 ml-1">
                          {stepChecklist.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 pl-2">
                              <div className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-emerald-500 dark:text-emerald-400 text-[9px]">done</span>
                              </div>
                              <span className="text-[10px] text-slate-600 dark:text-gray-400 leading-tight">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes - only on second step */}
                      {task.notes && idx === 1 && (
                        <div className="p-2 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-slate-100 dark:border-gray-700">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Observações</p>
                          <p className="text-[10px] text-slate-600 dark:text-gray-300 italic leading-relaxed">"{task.notes}"</p>
                        </div>
                      )}

                      {/* Responsible - only on last step */}
                      {idx === stageConfig.length - 1 && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-gray-700/50">
                          <img src={task.responsibleAvatar} className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600" alt="" />
                          <span className="text-[9px] text-slate-500 dark:text-gray-400">Por {task.responsible}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Paw Print Connector - Like real pet footprints walking */}
                  {idx < stageConfig.length - 1 && (
                    <div className="flex justify-center py-4 relative">
                      <div className="flex items-center gap-6">
                        {/* Left paw */}
                        <span className="material-symbols-outlined text-primary/60 text-xl rotate-[-25deg] translate-y-1">pets</span>
                        {/* Right paw */}
                        <span className="material-symbols-outlined text-primary/40 text-xl rotate-[25deg] -translate-y-1">pets</span>
                        {/* Left paw */}
                        <span className="material-symbols-outlined text-primary/60 text-xl rotate-[-25deg] translate-y-1">pets</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Photo Section */}
          {finalPhoto && (
            <div className="mt-5 p-4 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 rounded-xl border border-primary/20">
              <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">photo_camera</span>
                Resultado Final
                <span className="text-[9px] text-slate-400 ml-auto">Clique para ampliar</span>
              </h4>
              <div
                className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => setShowImageModal(true)}
              >
                <img src={finalPhoto} alt="Resultado do serviço" className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">zoom_in</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">pets</span>
                    {task.petName} - Pronto!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image Lightbox Modal */}
          {showImageModal && finalPhoto && (
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
              onClick={() => setShowImageModal(false)}
            >
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
              <div className="relative z-10 max-w-4xl max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-white text-xl">close</span>
                </button>

                {/* Image */}
                <img
                  src={finalPhoto}
                  alt="Resultado do serviço"
                  className="w-full h-full object-contain rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-xl">
                  <p className="text-white text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">pets</span>
                    {task.petName} - Resultado Final
                  </p>
                  <p className="text-white/60 text-xs mt-1">{task.serviceType} • {task.ownerName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Card */}
          <div className="mt-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white text-base">verified</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Atendimento Concluído</p>
                  <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">Todas as etapas finalizadas</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                <span className="material-symbols-outlined text-emerald-400 text-base">pets</span>
                <span className="material-symbols-outlined text-emerald-300 text-sm -ml-1">pets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Voltar para Lista
          </button>
        </div>
      </div>
    </div>
  );
};



// --- Advanced Check-in Modal ---
const CheckinModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checkedIds: string[], checkinData?: any) => void;
  task: ServiceTask;
}> = ({ isOpen, onClose, onConfirm, task }) => {
  const { showNotification } = useNotification();
  const [belongings, setBelongings] = useState({ coleira: false, guia: false, peitoral: false, brinquedo: false, outros: '' });
  const [analysis, setAnalysis] = useState({ hairState: '', dirtLevel: '', parasites: false, wounds: false });
  const [grooming, setGrooming] = useState({ scissors: '', machine: '', hygienicType: '' });
  const [generalNotes, setGeneralNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (task.checkin_checklist) {
      const initialValues: Record<string, any> = {};
      task.checkin_checklist.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.type === 'check' || field.type === 'checkbox') initialValues[field.id] = false;
          else if (field.type === 'select' || field.type === 'dropdown') initialValues[field.id] = field.options?.[0] || '';
          else initialValues[field.id] = '';
        });
      });
      setDynamicValues(initialValues);
    }
  }, [task.checkin_checklist]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (photos.length + files.length > 5) {
      showNotification('Máximo de 5 fotos permitido', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const newPhotoUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${task.appointmentId}/checkin_${Date.now()}_${i}.${fileExt}`;
        const filePath = `services/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('service-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('service-photos')
          .getPublicUrl(filePath);

        newPhotoUrls.push(publicUrl);
      }
      setPhotos(prev => [...prev, ...newPhotoUrls]);
      showNotification(`${files.length} foto(s) enviada(s)!`, 'success');
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      showNotification('Erro ao enviar fotos', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = () => {
    const checkinData = {
      belongings,
      analysis,
      grooming,
      generalNotes,
      photos,
      dynamicValues,
      templateName: task.checkin_checklist?.name,
      timestamp: new Date().toISOString()
    };
    onConfirm([], checkinData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#f3f4f6] dark:bg-[#1a1a1a] w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 bg-white dark:bg-[#222] border-b border-slate-200 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-primary uppercase italic tracking-tight">Checklist de Início - {task.petName}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Preencha as informações antes de iniciar o serviço</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 nike-scroll">
          {task.checkin_checklist ? (
            // Dynamic Rendering from Template
            task.checkin_checklist.sections.map((section) => (
              <div key={section.id} className="bg-white dark:bg-[#222] p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{section.icon || 'assignment'}</span>
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-wider">{section.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field) => (
                    <div key={field.id} className={field.type === 'text' && !field.options?.length ? 'md:col-span-2' : ''}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">{field.label}</label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={dynamicValues[field.id] || ''}
                          onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                          placeholder={field.placeholder}
                        />
                      )}

                      {(field.type === 'check' || field.type === 'checkbox') && (
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={!!dynamicValues[field.id]}
                            onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.checked }))}
                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Confirmar</span>
                        </label>
                      )}

                      {(field.type === 'select' || field.type === 'dropdown') && (
                        <select
                          value={dynamicValues[field.id] || ''}
                          onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-100 dark:border-gray-800 rounded-lg text-sm"
                        >
                          <option value="" disabled>Selecione...</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={dynamicValues[field.id] || ''}
                          onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          value={dynamicValues[field.id] || ''}
                          onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
                        />
                      )}

                      {field.type === 'photo' && (
                        <div className="text-xs text-slate-400 italic">Fotos são adicionadas na seção abaixo</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Legacy/Default Fallback Rendering
            <>
              {/* Section: Pertences */}
              <div className="bg-white dark:bg-[#222] p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-500">inventory_2</span>
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-wider">Pertences do Cliente</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {['coleira', 'guia', 'peitoral', 'brinquedo'].map((item) => (
                    <label key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={(belongings as any)[item]}
                        onChange={(e) => setBelongings({ ...belongings, [item]: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 capitalize">{item}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Outros</label>
                  <input
                    type="text"
                    value={belongings.outros}
                    onChange={(e) => setBelongings({ ...belongings, outros: e.target.value })}
                    placeholder="Descreva outros pertences..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Section: Análise Inicial */}
              <div className="bg-white dark:bg-[#222] p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-500">analytics</span>
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-wider">Análise Inicial</h3>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Estado da Pelagem</label>
                    <select
                      value={analysis.hairState}
                      onChange={(e) => setAnalysis({ ...analysis, hairState: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-100 dark:border-gray-800 rounded-lg text-sm"
                    >
                      <option value="">Selecione</option>
                      <option value="Ótimo">Ótimo (Sem nós)</option>
                      <option value="Bom">Bom (Nós leves)</option>
                      <option value="Regular">Regular (Muitos nós)</option>
                      <option value="Crítico">Crítico (Embolado)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nível de Sujeira</label>
                    <select
                      value={analysis.dirtLevel}
                      onChange={(e) => setAnalysis({ ...analysis, dirtLevel: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-100 dark:border-gray-800 rounded-lg text-sm"
                    >
                      <option value="">Selecione</option>
                      <option value="Baixo">Baixo</option>
                      <option value="Médio">Médio</option>
                      <option value="Alto">Alto</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={analysis.parasites}
                      onChange={(e) => setAnalysis({ ...analysis, parasites: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Parasitas Visíveis</span>
                  </label>
                  <label className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={analysis.wounds}
                      onChange={(e) => setAnalysis({ ...analysis, wounds: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Feridas ou Lesões</span>
                  </label>
                </div>
              </div>

              {/* Section: Orientações para Tosa */}
              <div className="bg-white dark:bg-[#222] p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-orange-500">content_cut</span>
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-wider">Orientações para Tosa</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tosa a Tesoura</label>
                    <textarea
                      value={grooming.scissors}
                      onChange={(e) => setGrooming({ ...grooming, scissors: e.target.value })}
                      placeholder="Ex: Arredondar focinho, aparar patas..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tosa a Máquina</label>
                    <input
                      type="text"
                      value={grooming.machine}
                      onChange={(e) => setGrooming({ ...grooming, machine: e.target.value })}
                      placeholder="Ex: Lâmina 7, corpo todo..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tipo de Tosa Higiênica</label>
                    <select
                      value={grooming.hygienicType}
                      onChange={(e) => setGrooming({ ...grooming, hygienicType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-100 dark:border-gray-800 rounded-lg text-sm"
                    >
                      <option value="">Selecione</option>
                      <option value="Completa">Completa</option>
                      <option value="Parcial">Parcial</option>
                      <option value="Apenas Patas">Apenas Patas</option>
                      <option value="Apenas Rostinho">Apenas Rostinho</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Observações Gerais */}
              <div className="bg-white dark:bg-[#222] p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500">description</span>
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-wider">Observações Gerais</h3>
                </div>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Ex: Nervoso, Calmo, Agressivo, Medo de barulho..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                />
              </div>
            </>
          )}

          {/* Photos are common to both dynamic and legacy UI */}
          <div className="bg-white dark:bg-[#222] p-6 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500">photo_camera</span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-wider">Fotos Antes (até 5)</h3>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className={`aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all ${uploadingPhoto ? 'animate-pulse pointer-events-none' : ''}`}>
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">upload</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Adicionar</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white dark:bg-[#222] border-t border-slate-200 dark:border-gray-800 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-600 rounded-2xl transition-all">Cancelar</button>
          <button
            onClick={handleSubmit}
            className="flex-2 py-4 px-12 bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            Salvar e Iniciar Serviço
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Advanced Checkout Modal ---
const CheckoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checkedIds: string[], checkoutData?: any, usedProducts?: any[]) => void;
  task: ServiceTask;
  availableProducts: Product[];
}> = ({ isOpen, onClose, onConfirm, task, availableProducts }) => {
  const { showNotification } = useNotification();
  const [checkedItems, setCheckedItems] = useState<string[]>(task.checkedItems || []);
  const [quality, setQuality] = useState({ eyes: 'Bom', skin: 'Bom', nails: 'Bom', mouth: 'Bom' });
  const [behavior, setBehavior] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [belongings, setBelongings] = useState({ coleira: false, guia: false, peitoral: false, brinquedo: false, outros: false });
  const [belongingsConfirmed, setBelongingsConfirmed] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  // Used Products State
  const [usedProducts, setUsedProducts] = useState<{ id: string; name: string; quantity: number; price: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);

  useEffect(() => {
    if (task.checkout_checklist) {
      const initialValues: Record<string, any> = {};
      task.checkout_checklist.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.type === 'check' || field.type === 'checkbox') initialValues[field.id] = false;
          else if (field.type === 'select' || field.type === 'dropdown') initialValues[field.id] = field.options?.[0] || '';
          else initialValues[field.id] = '';
        });
      });
      setDynamicValues(initialValues);
    }
  }, [task.checkout_checklist]);

  if (!isOpen) return null;

  const handleToggleItem = (id: string) => {
    setCheckedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `services/${task.appointmentId}/checkout_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('service-photos').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('service-photos').getPublicUrl(filePath);
      setPhotos(prev => [...prev, publicUrl]);
      showNotification('Foto adicionada!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Erro ao fazer upload da foto', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = availableProducts.find(p => p.id === selectedProductId);
    if (!product) return;

    setUsedProducts(prev => {
      const existing = prev.find(p => p.id === selectedProductId);
      if (existing) {
        return prev.map(p => p.id === selectedProductId ? { ...p, quantity: p.quantity + productQuantity } : p);
      }
      return [...prev, { id: product.id, name: product.name, quantity: productQuantity, price: product.price }];
    });
    setSelectedProductId('');
    setProductQuantity(1);
  };

  const handleRemoveProduct = (id: string) => {
    setUsedProducts(prev => prev.filter(p => p.id !== id));
  };


  const handleSubmit = () => {
    const checkoutData = {
      quality,
      behavior,
      recommendations,
      generalNotes,
      belongings,
      photos,
      dynamicValues,
      templateName: task.checkout_checklist?.name,
      timestamp: new Date().toISOString()
    };
    onConfirm(checkedItems, checkoutData, usedProducts);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-[#f0f2f5] dark:bg-[#111] rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] overflow-hidden border border-white dark:border-gray-800 animate-in zoom-in-95">

        {/* Header */}
        <div className="p-6 bg-white dark:bg-[#1a1a1a] flex justify-between items-center shrink-0 border-b border-slate-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-black text-emerald-600 dark:text-emerald-400 italic uppercase leading-none">Checkout - {task.petName}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Concluir Atendimento</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 nike-scroll">

          {/* Checklist de Itens */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-500">
              <span className="material-symbols-outlined text-xl">task_alt</span>
              <h3 className="text-xs font-black uppercase italic">Serviços Realizados</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {task.checklist.map(item => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-xl transition-all">
                  <div
                    onClick={() => handleToggleItem(item.id)}
                    className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${checkedItems.includes(item.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-gray-700'}`}
                  >
                    {checkedItems.includes(item.id) && <span className="material-symbols-outlined text-white text-sm">check</span>}
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400">{item.text}</span>
                </label>
              ))}
            </div>
          </section>

          {task.checkout_checklist ? (
            // Dynamic Rendering
            task.checkout_checklist.sections.map((section) => (
              <section key={section.id} className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-100 dark:border-gray-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-500">
                  <span className="material-symbols-outlined text-xl">{section.icon || 'assignment'}</span>
                  <h3 className="text-xs font-black uppercase italic">{section.title}</h3>
                </div>

                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">{field.label}</p>

                      {field.type === 'text' && (
                        <textarea
                          value={dynamicValues[field.id] || ''}
                          onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 min-h-[60px] outline-none"
                          placeholder={field.placeholder}
                        />
                      )}

                      {(field.type === 'check' || field.type === 'checkbox') && (
                        <button
                          onClick={() => setDynamicValues(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                          className={`w-full py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${dynamicValues[field.id] ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-[#252525] border-slate-100 dark:border-gray-800 text-slate-400'}`}
                        >
                          <span className="material-symbols-outlined text-sm">{dynamicValues[field.id] ? 'check_circle' : 'circle'}</span>
                          {dynamicValues[field.id] ? 'Confirmado' : 'Pendente'}
                        </button>
                      )}

                      {(field.type === 'select' || field.type === 'dropdown') && (
                        <div className="flex gap-2 flex-wrap">
                          {field.options?.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setDynamicValues(prev => ({ ...prev, [field.id]: opt }))}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${dynamicValues[field.id] === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-[#252525] border-slate-100 dark:border-gray-800 text-slate-400'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={dynamicValues[field.id] || ''}
                          onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 shadow-none border-none outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            // Legacy Rendering
            <>
              <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-100 dark:border-gray-800 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-500">
                  <span className="material-symbols-outlined text-xl">favorite</span>
                  <h3 className="text-xs font-black uppercase italic">Saúde e Bem-estar</h3>
                </div>

                {[
                  { id: 'eyes', label: 'Estado das Orelhas', icon: '👂' },
                  { id: 'skin', label: 'Estado da Pele', icon: '🧴' },
                  { id: 'nails', label: 'Estado das Unhas', icon: '💅' },
                  { id: 'mouth', label: 'Estado da Boca', icon: '🦷' }
                ].map(item => (
                  <div key={item.id} className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400">{item.label}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setQuality({ ...quality, [item.id as keyof typeof quality]: 'Bom' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${quality[item.id as keyof typeof quality] === 'Bom' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-[#252525] border-slate-100 dark:border-gray-800 text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-sm">thumb_up</span> Bom
                      </button>
                      <button
                        onClick={() => setQuality({ ...quality, [item.id as keyof typeof quality]: 'Ruim' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${quality[item.id as keyof typeof quality] === 'Ruim' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-white dark:bg-[#252525] border-slate-100 dark:border-gray-800 text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-sm">thumb_down</span> Ruim
                      </button>
                      <button
                        onClick={() => setQuality({ ...quality, [item.id as keyof typeof quality]: 'N/A' })}
                        className={`w-10 flex items-center justify-center bg-white dark:bg-[#252525] border-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-all ${quality[item.id as keyof typeof quality] === 'N/A' ? 'border-primary' : 'border-slate-100 dark:border-gray-800'}`}
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-100 dark:border-gray-800 space-y-4 shadow-sm">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Comportamento</label>
                  <textarea
                    value={behavior} onChange={e => setBehavior(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-gray-700 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500 min-h-[60px]"
                    placeholder="Relato do comportamento..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Recomendações</label>
                  <textarea
                    value={recommendations} onChange={e => setRecommendations(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-gray-700 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500 min-h-[60px]"
                    placeholder="Dicas para o tutor..."
                  />
                </div>
              </section>
            </>
          )}

          {/* Fotos (Common) */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-500">
              <span className="material-symbols-outlined text-xl">photo_camera</span>
              <h3 className="text-xs font-black uppercase italic">Fotos do Serviço</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 nike-scroll">
              {photos.map((url, i) => (
                <div key={i} className="relative size-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-red-500 text-white size-5 rounded-bl-lg flex items-center justify-center shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[10px]">close</span>
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <>
                  <input type="file" id="photo-checkout-final" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  <button
                    onClick={() => document.getElementById('photo-checkout-final')?.click()}
                    disabled={uploadingPhoto}
                    className="size-16 shrink-0 rounded-lg bg-slate-50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-gray-800 flex items-center justify-center text-slate-400"
                  >
                    {uploadingPhoto ? (
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full"></div>
                    ) : (
                      <span className="material-symbols-outlined">add_a_photo</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Used Products Section */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-500">
              <span className="material-symbols-outlined text-xl">shopping_bag</span>
              <h3 className="text-xs font-black uppercase italic">Consumo de Produtos</h3>
            </div>

            <div className="flex gap-2 mb-4">
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-gray-700 rounded-xl px-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Selecione um produto...</option>
                {availableProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Estoque: {p.stock})</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={productQuantity}
                onChange={e => setProductQuantity(Number(e.target.value))}
                className="w-16 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-gray-700 rounded-xl px-2 text-center text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleAddProduct}
                disabled={!selectedProductId}
                className="bg-emerald-500 text-white rounded-xl w-10 flex items-center justify-center disabled:opacity-50 hover:bg-emerald-600 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>

            {usedProducts.length > 0 ? (
              <div className="space-y-2">
                {usedProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-[#111] p-3 rounded-xl border border-slate-100 dark:border-gray-800">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{p.name}</span>
                      <span className="text-[10px] text-slate-400">{p.quantity}x R$ {p.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">R$ {(p.quantity * p.price).toFixed(2)}</span>
                      <button onClick={() => handleRemoveProduct(p.id)} className="text-red-400 hover:text-red-600">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-gray-800 mt-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Total Adicional: <span className="text-emerald-600 dark:text-emerald-400 text-sm">R$ {usedProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}</span></p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic text-center py-2">Nenhum produto adicionado.</p>
            )}
          </section>

          {/* Pertences (Common) */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-100 dark:border-gray-800 space-y-4 mb-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
              <h3 className="text-xs font-black uppercase italic">Pertences</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'coleira', label: 'Coleira' },
                { id: 'guia', label: 'Guia' },
                { id: 'peitoral', label: 'Peitoral' },
                { id: 'brinquedo', label: 'Brinquedo' },
                { id: 'outros', label: 'Outros' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setBelongings({ ...belongings, [p.id as keyof typeof belongings]: !belongings[p.id as keyof typeof belongings] })}
                  className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all text-left ${belongings[p.id as keyof typeof belongings] ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 dark:bg-[#111] border-transparent text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-sm">{belongings[p.id as keyof typeof belongings] ? 'check_circle' : 'circle'}</span>
                  <span className="text-[10px] font-bold uppercase">{p.label}</span>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800 cursor-pointer">
              <input
                type="checkbox"
                checked={belongingsConfirmed}
                onChange={e => setBelongingsConfirmed(e.target.checked)}
                className="w-5 h-5 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">Confirmo que todos os pertences foram devolvidos ao cliente</span>
            </label>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white dark:bg-[#1a1a1a] border-t border-slate-100 dark:border-gray-800 flex gap-3 shrink-0 shadow-lg">
          <button onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={!belongingsConfirmed}
            className="flex-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            Finalizar Atendimento
          </button>
        </div>
      </div>
    </div>
  );
};


const DeliveryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { amount: number, paymentMethod: string, status: string, sendWhatsApp: boolean }) => void;
  task: ServiceTask;
  initialPrice: number;
}> = ({ isOpen, onClose, onConfirm, task, initialPrice }) => {
  const [amount, setAmount] = useState(initialPrice);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [paymentStatus, setPaymentStatus] = useState('Pendente');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden border border-slate-100 dark:border-gray-800 animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-6">
          <h2 className="text-xl font-black text-emerald-600 dark:text-emerald-500 mb-6 font-display">Entregar Pet</h2>

          {/* Profile Card */}
          <div className="bg-slate-50 dark:bg-[#111] rounded-2xl p-4 flex items-center gap-4 mb-6 border border-slate-100 dark:border-gray-800">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl">inventory_2</span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white leading-none">{task.petName}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{task.ownerName}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-bold">
                <span className="material-symbols-outlined text-xs">phone_iphone</span>
                (11) 94841-3693
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">Valor Final do Serviço (R$)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] text-slate-900 dark:text-white text-lg font-black px-4 focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] text-slate-900 dark:text-white text-sm font-bold px-4 focus:border-emerald-500 outline-none transition-colors"
              >
                <option>🗳️ PIX</option>
                <option>💳 Cartão de Crédito</option>
                <option>💳 Cartão de Débito</option>
                <option>💵 Dinheiro</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">Status do Pagamento</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] text-slate-900 dark:text-white text-sm font-bold px-4 focus:border-emerald-500 outline-none transition-colors"
              >
                <option>⏳ Pendente</option>
                <option>✅ Pago</option>
              </select>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl p-4 border border-yellow-100 dark:border-yellow-900/20">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-yellow-400 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-yellow-100">Ao confirmar:</p>
                  <ul className="text-[10px] text-slate-500 dark:text-yellow-100/60 space-y-0.5 list-disc pl-4">
                    <li>Pet será marcado como entregue</li>
                    <li>Fatura será gerada automaticamente no Financeiro</li>
                    <li>Cliente receberá confirmação via WhatsApp</li>
                  </ul>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-sm font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm({ amount, paymentMethod, status: paymentStatus === '✅ Pago' ? 'paid' : 'pending', sendWhatsApp })}
              className="flex-[1.5] h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Confirmar Entrega
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrintReceipt: React.FC<{ task: ServiceTask, amount: number, paymentMethod: string }> = ({ task, amount, paymentMethod }) => {
  return (
    <div id="print-receipt" className="hidden print:block p-8 bg-white text-black font-mono text-sm leading-tight">
      <div className="text-center mb-6">
        <h1 className="text-xl font-black uppercase leading-none">BBG PET PRO</h1>
        <p className="text-[10px] uppercase font-bold mt-1">Soluções Inteligentes para Pets</p>
        <div className="border-b-2 border-dashed border-black my-4" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-bold">DATA:</span>
          <span>{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">PET:</span>
          <span className="uppercase">{task.petName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">TUTOR:</span>
          <span className="uppercase">{task.ownerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">SERVIÇO:</span>
          <span className="uppercase">{task.serviceType}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">FORMA PGTO:</span>
          <span className="uppercase">{paymentMethod}</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-black my-4" />

      <div className="flex justify-between text-lg font-black">
        <span>TOTAL:</span>
        <span>R$ {amount.toFixed(2)}</span>
      </div>

      <div className="border-b-2 border-dashed border-black my-4" />

      <div className="text-center italic mt-6 space-y-1">
        <p>Obrigado pela confiança!</p>
        <p className="text-[10px]">Cuide bem do seu amiguinho.</p>
      </div>

      <div className="mt-12 text-center text-[8px] opacity-30">
        ID: {task.appointmentId}
      </div>
    </div>
  );
};

// --- Timer Component ---
const ExecutionTimer: React.FC<{ startTime?: string; duration?: number }> = ({ startTime, duration }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!startTime) {
      setElapsed('00:00');
      return;
    }

    const start = new Date(startTime).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = hours > 0 ? `${hours}:` : '';
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');

      setElapsed(`${hStr}${mStr}:${sStr}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
      <span className="material-symbols-outlined text-xs text-primary animate-pulse">timer</span>
      <span className="text-xs font-black text-primary font-mono lowercase">
        {elapsed} {duration ? `/ ${duration} min` : ''}
      </span>
    </div>
  );
};


export const Execution: React.FC<{ onNavigate?: (screen: any, state?: any) => void }> = ({ onNavigate }) => {
  const { tenant } = useSecurity();
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [checkinTask, setCheckinTask] = useState<ServiceTask | null>(null);
  const [detailsTask, setDetailsTask] = useState<ServiceTask | null>(null);
  const [detailsPhoto, setDetailsPhoto] = useState<string | undefined>(undefined);
  const [deliveryTask, setDeliveryTask] = useState<ServiceTask | null>(null);
  const [initialPrice, setInitialPrice] = useState(0);
  const [printData, setPrintData] = useState<{ amount: number, paymentMethod: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [products, setProducts] = useState<Product[]>([]);
  const { showNotification } = useNotification();

  // Fetch Products for Checkout
  useEffect(() => {
    const fetchProducts = async () => {
      if (!tenant?.id) return;
      const { data } = await supabase
        .from('inventory_items')
        .select('id, name, price, stock_quantity')
        .eq('tenant_id', tenant.id);
      if (data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock_quantity
        })));
      }
    };
    fetchProducts();
  }, []);

  // Fetch pet's last photo from gallery when opening details
  const openDetailsModal = async (task: ServiceTask) => {
    setDetailsTask(task);
    setDetailsPhoto(undefined);

    try {
      const { data: petData } = await supabase
        .from('pets')
        .select('gallery')
        .eq('id', task.petId)
        .single();

      if (petData?.gallery && petData.gallery.length > 0) {
        // Get the most recent photo (last in array)
        setDetailsPhoto(petData.gallery[petData.gallery.length - 1]);
      }
    } catch (err) {
      console.error('Error fetching pet gallery:', err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    if (!tenant?.id) return;
    const { data: appts, error } = await supabase
      .from('appointments')
      .select('*, pets(id, name, breed, img), clients(id, name)')
      .eq('tenant_id', tenant.id)
      .order('start_time', { ascending: true });

    if (!error && appts) {
      const { data: services } = await supabase
        .from('services')
        .select('name, checklist, category, checkin_checklist, checkout_checklist')
        .eq('tenant_id', tenant.id);

      const mapped: ServiceTask[] = appts.filter(a => a.status !== 'cancelled').map(a => {
        const svcInfo = services?.find(s => s.name === a.service);
        return {
          id: a.id,
          appointmentId: a.id,
          petId: a.pet_id,
          clientId: a.client_id,
          petName: a.pets?.name || 'Pet',
          breed: a.pets?.breed || 'SRD',
          ownerName: a.clients?.name || 'Dono',
          petAvatar: a.pets?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.pets?.name || 'P')}&background=random`,
          serviceType: a.service,
          category: svcInfo?.category || 'Geral',
          status: (a.status === 'pending' ? 'waiting' : a.status) as ServiceStage || 'waiting',
          currentStepIndex: a.current_step || 0,
          checklist: svcInfo?.checklist || [],
          checkedItems: a.checklist_state || [],
          steps: [
            { label: 'Check-in', key: 'waiting' },
            { label: 'Execução', key: 'in-progress' },
            { label: 'Pronto', key: 'ready' }
          ],
          execution_started_at: (a.checklist_state || []).find((s: any) => typeof s === 'string' && s.startsWith('TIMER:'))?.replace('TIMER:', ''),
          notes: a.notes || '',
          duration: a.duration || 60,
          responsible: a.professional || 'Não designado',
          responsibleAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.professional || 'NA')}&background=random`,
          checkin_checklist: svcInfo?.checkin_checklist,
          checkout_checklist: svcInfo?.checkout_checklist,
          used_products: a.used_products || []
        };
      });
      setTasks(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleUpdateProgress = async (checkedIds: string[], afterPhotoUrl?: any, usedProducts?: any[], taskOverride?: ServiceTask) => {
    const activeTask = taskOverride || selectedTask;
    if (!activeTask) return;

    try {
      let nextStatus = activeTask.status;
      let nextStep = activeTask.currentStepIndex;

      const isLastStep = activeTask.currentStepIndex === activeTask.steps.length - 1;
      let updatedChecklist = [...checkedIds];

      if (!isLastStep && activeTask.steps && activeTask.steps[nextStep + 1]) {
        nextStep += 1;
        nextStatus = activeTask.steps[nextStep].key as ServiceStage;

        // If moving to 'in-progress', record start time
        if (nextStatus === 'in-progress') {
          const now = new Date().toISOString();
          updatedChecklist.push(`TIMER:${now}`);
        }

        // Add checkin/checkout data if provided
        if (afterPhotoUrl && typeof afterPhotoUrl === 'object') {
          const prefix = activeTask.currentStepIndex === 0 ? 'CHECKIN:' : 'CHECKOUT:';
          const payload = `${prefix}${JSON.stringify(afterPhotoUrl)}`;
          updatedChecklist.push(payload);
        }
      } else if (isLastStep || !activeTask.steps) {
        // Fallback for unexpected state
        nextStatus = 'finished';
      }

      console.log('=== UPDATE PROGRESS DEBUG ===');
      console.log('Appointment ID:', activeTask.appointmentId);
      console.log('Current step:', activeTask.currentStepIndex);
      console.log('Next step:', nextStep);
      console.log('Next status:', nextStatus);
      console.log('Checked IDs:', checkedIds);

      const { error } = await supabase
        .from('appointments')
        .update({
          checklist_state: updatedChecklist,
          current_step: nextStep,
          status: nextStatus,
          used_products: usedProducts && usedProducts.length > 0 ? usedProducts : activeTask.used_products
        })
        .eq('id', activeTask.appointmentId);

      if (error) {
        console.error('Update error:', error);
        showNotification(`Erro ao atualizar: ${error.message}`, 'error');
        return;
      }

      // If there's an after photo or checkout photos, add them to the pet's gallery
      try {
        const payloadData = typeof afterPhotoUrl === 'object' ? (afterPhotoUrl as any) : null;
        let photosToSave: string[] = [];

        if (Array.isArray(payloadData?.photos)) {
          photosToSave = payloadData.photos;
        } else if (typeof afterPhotoUrl === 'string') {
          photosToSave = [afterPhotoUrl];
        }

        if (photosToSave.length > 0 && activeTask.petId) {
          const { data: petData } = await supabase
            .from('pets')
            .select('gallery')
            .eq('id', activeTask.petId)
            .single();

          if (petData) {
            const currentGallery = Array.isArray(petData.gallery) ? petData.gallery : [];
            const newGallery = [...currentGallery, ...photosToSave];

            await supabase
              .from('pets')
              .update({ gallery: newGallery })
              .eq('id', activeTask.petId);

            showNotification(`✅ ${activeTask.petName} - ${photosToSave.length} foto(s) adicionada(s) à galeria!`, 'success');
          }
        }
      } catch (galleryErr) {
        console.error('Error updating pet gallery:', galleryErr);
      }

      const nextLabel = activeTask.steps && activeTask.steps[nextStep] ? activeTask.steps[nextStep].label : 'Próxima Etapa';
      showNotification(`${activeTask.petName} avançou para ${nextLabel}!`, 'success');

      // If at step before "Retirada", get ready to open Delivery Modal
      // If moving to "Ready" status, open Delivery Modal automatically
      if (nextStatus === 'ready') {
        const { data: serviceData } = await supabase
          .from('services')
          .select('price_pequeno, price')
          .eq('name', activeTask.serviceType)
          .single();

        const price = serviceData?.price_pequeno || serviceData?.price || 0;

        // Add used products cost to initial price if any
        const productsCost = (usedProducts || activeTask.used_products || []).reduce((acc: number, curr: any) => acc + (curr.price * curr.quantity), 0);

        setInitialPrice(price + productsCost);
        setDeliveryTask(activeTask);
        setSelectedTask(null);
        setCheckinTask(null);
        fetchTasks();
      } else {
        fetchTasks();
      }
      setSelectedTask(null);
      setCheckinTask(null);
    } catch (err: any) {
      console.error('Unexpected error:', err);
      showNotification(`Erro inesperado: ${err.message}`, 'error');
    }
  };

  const handleOpenDelivery = async (task: ServiceTask) => {

    // Find the service to get its price
    const { data: serviceData } = await supabase
      .from('services')
      .select('price_pequeno, price')
      .eq('name', task.serviceType)
      .single();

    const price = serviceData?.price_pequeno || serviceData?.price || 0;

    // Add used products cost
    const productsCost = (task.used_products || []).reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    setInitialPrice(price + productsCost);
    setDeliveryTask(task);
  };

  const handleConfirmDelivery = async (data: { amount: number, paymentMethod: string, status: string, sendWhatsApp: boolean }) => {
    if (!deliveryTask) return;

    try {
      // 1. Update Appointment Status to 'finished'
      const { error: apptError } = await supabase
        .from('appointments')
        .update({ status: 'finished' })
        .eq('id', deliveryTask.appointmentId);

      if (apptError) throw apptError;

      // 2. Register Financial Transaction
      const { error: txError } = await supabase
        .from('financial_transactions')
        .insert([{
          type: 'income',
          amount: data.amount,
          description: `Serviço: ${deliveryTask.serviceType} - Pet: ${deliveryTask.petName}`,
          status: data.status,
          client_id: deliveryTask.clientId,
          date: new Date().toISOString().split('T')[0]
        }]);

      if (txError) throw txError;

      showNotification(`${deliveryTask.petName} entregue com sucesso!`, 'success');

      // 3. Printing
      setPrintData({ amount: data.amount, paymentMethod: data.paymentMethod });

      // Wait a bit for state/DOM
      setTimeout(() => {
        const printContent = document.getElementById('print-receipt');
        if (printContent) {
          window.print();
          setPrintData(null); // Clear after print
        }
      }, 500);

      // Reset
      setDeliveryTask(null);
      setSelectedTask(null);
      fetchTasks();

    } catch (err: any) {
      console.error('Error confirming delivery:', err);
      showNotification(`Erro ao finalizar entrega: ${err.message}`, 'error');
    }
  };

  const categories = ['TODOS', 'BANHO & TOSA', 'VETERINÁRIO', 'DAY CARE', 'FINALIZADOS'];
  const filteredTasks = categoryFilter === 'TODOS'
    ? tasks.filter(t => t.status !== 'finished')
    : categoryFilter === 'FINALIZADOS'
      ? tasks.filter(t => t.status === 'finished')
      : tasks.filter(t => t.category === categoryFilter && t.status !== 'finished');

  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;

  const getBorderColor = (category: string) => {
    switch (category) {
      case 'Banho & Tosa': return 'border-l-indigo-600';
      case 'Veterinário': return 'border-l-amber-500';
      case 'Tosa Higiênica': return 'border-l-emerald-500';
      default: return 'border-l-primary';
    }
  };

  const getButtonColor = (category: string) => {
    switch (category) {
      case 'Banho & Tosa': return 'bg-indigo-600 hover:bg-indigo-700';
      case 'Veterinário': return 'bg-amber-500 hover:bg-amber-600';
      case 'Tosa Higiênica': return 'bg-emerald-500 hover:bg-emerald-600';
      default: return 'bg-primary hover:bg-primary-hover';
    }
  };

  if (loading && tasks.length === 0) return <div className="flex h-screen items-center justify-center"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#111] overflow-hidden animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-receipt, #print-receipt * { visibility: visible; }
          #print-receipt { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            height: auto;
          }
        }
      `}</style>

      {selectedTask && <CheckoutModal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} onConfirm={handleUpdateProgress} task={selectedTask} availableProducts={products} />}
      {checkinTask && <CheckinModal isOpen={!!checkinTask} onClose={() => setCheckinTask(null)} onConfirm={(checkedIds, data) => handleUpdateProgress(checkedIds, data, undefined, checkinTask)} task={checkinTask} />}
      {detailsTask && <TimelineDetailsModal isOpen={!!detailsTask} onClose={() => { setDetailsTask(null); setDetailsPhoto(undefined); }} task={detailsTask} finalPhoto={detailsPhoto} />}
      {deliveryTask && (
        <DeliveryModal
          isOpen={!!deliveryTask}
          onClose={() => setDeliveryTask(null)}
          onConfirm={handleConfirmDelivery}
          task={deliveryTask}
          initialPrice={initialPrice}
        />
      )}

      {printData && deliveryTask && <PrintReceipt task={deliveryTask} amount={printData.amount} paymentMethod={printData.paymentMethod} />}

      {/* Header */}
      <header className="p-8 border-b border-gray-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-5xl font-black tracking-tight uppercase leading-tight">
              <div className="text-slate-900 dark:text-white">SERVIÇOS</div>
              <div className="text-primary italic">EM EXECUÇÃO</div>
            </h1>
            <p className="text-xs text-gray-400 mt-2">Monitoramento em tempo real do workflow.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-4 bg-gray-900 rounded-2xl border border-gray-800">
              <p className="text-3xl font-black text-white mb-1">{tasks.length}</p>
              <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Total</p>
            </div>
            <div className="text-center px-6 py-4 bg-indigo-600 rounded-2xl">
              <p className="text-3xl font-black text-white mb-1">{inProgressCount}</p>
              <p className="text-[9px] font-bold uppercase text-purple-200 tracking-wider">Andamento</p>
            </div>
            <div className="text-center px-6 py-4 bg-emerald-500 rounded-2xl border border-emerald-400">
              <p className="text-3xl font-black text-white mb-1">{tasks.filter(t => t.status === 'finished').length}</p>
              <p className="text-[9px] font-bold uppercase text-emerald-100 tracking-wider">Finalizados</p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-8 border-b border-gray-800">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`pb-3 text-xs font-bold uppercase tracking-wide transition-colors relative ${categoryFilter === cat ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {cat}
              {categoryFilter === cat && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${cat === 'BANHO & TOSA' ? 'bg-indigo-600' : cat === 'VETERINÁRIO' ? 'bg-amber-500' : cat === 'DAY CARE' ? 'bg-emerald-500' : cat === 'PRONTOS' ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-600 to-blue-500'}`}></div>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Task List */}
      <main className="flex-1 overflow-y-auto p-8 space-y-4">
        {filteredTasks.map(task => (
          <div key={task.id} className={`bg-gray-900 border-l-4 ${getBorderColor(task.category)} rounded-2xl p-6 hover:bg-gray-850 transition-all`}>
            <div className="flex items-center gap-6">
              {/* Pet Avatar */}
              <img src={task.petAvatar} className="w-20 h-20 rounded-full border-4 border-gray-800 object-cover" alt={task.petName} />

              {/* Service Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-gray-800 text-white text-[9px] font-black uppercase rounded-full">{task.serviceType}</span>
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic">{task.petName}</h3>
                {task.status === 'finished' ? (
                  <p className="text-xs uppercase font-bold mb-1 text-emerald-400">SERVIÇO FINALIZADO</p>
                ) : (
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-xs uppercase font-bold" style={{ color: task.category === 'Banho & Tosa' ? '#7c3aed' : task.category === 'Veterinário' ? '#f59e0b' : '#10b981' }}>EM ANDAMENTO</p>
                    {task.status === 'in-progress' && <ExecutionTimer startTime={task.execution_started_at} duration={task.duration} />}
                  </div>
                )}
                <p className="text-xs text-gray-400 uppercase">{task.breed} • {task.ownerName}</p>

                {/* Progress Bar */}
                <div className="mt-4 mb-3">
                  <div className="flex justify-between mb-2">
                    {task.steps.map((step, idx) => (
                      <div key={idx} className="flex-1 flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${idx <= task.currentStepIndex ? '' : 'bg-gray-700 border-gray-600'}`}
                          style={idx <= task.currentStepIndex ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
                        ></div>
                        {idx < task.steps.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 ${idx < task.currentStepIndex ? '' : 'bg-gray-700'}`}
                            style={idx < task.currentStepIndex ? { backgroundColor: 'var(--color-primary)' } : {}}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {task.steps.map((step, idx) => (
                      <p
                        key={idx}
                        className={`text-[9px] font-bold uppercase ${idx <= task.currentStepIndex ? '' : 'text-gray-600'}`}
                        style={idx <= task.currentStepIndex ? { color: 'var(--color-primary)' } : {}}
                      >{step.label}</p>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <p className="text-xs text-gray-500 italic">"{task.notes || 'Sem observações'}"</p>
              </div>

              {/* Responsible & Action */}
              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-2">
                  <img src={task.responsibleAvatar} className="w-8 h-8 rounded-full border-2 border-gray-700" alt="" />
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase font-bold">Responsável</p>
                    <p className="text-xs text-white font-bold">{task.responsible}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (task.status === 'finished') openDetailsModal(task);
                    else if (task.status === 'ready') handleOpenDelivery(task);
                    else if (task.status === 'waiting') setCheckinTask(task);
                    else setSelectedTask(task);
                  }}
                  className={`px-6 py-3 ${task.status === 'finished' ? 'bg-gray-700 hover:bg-gray-600' : task.status === 'ready' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : getButtonColor(task.category)} text-white text-sm font-black rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2`}
                >
                  {task.status === 'finished' ? (
                    <>
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      VER DETALHES
                    </>
                  ) : task.status === 'ready' ? (
                    <>
                      <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                      ENTREGAR PET
                    </>
                  ) : task.currentStepIndex === 1 ? (
                    <>
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      CHECK-OUT
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      CHECK-IN
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">Nenhum serviço em execução</p>
          </div>
        )}
      </main>
    </div>
  );
};