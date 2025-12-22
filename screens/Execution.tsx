import React, { useState, useEffect } from 'react';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';

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
  checklist: ChecklistItem[];
  checkedItems: string[]; // IDs of checked items
  notes: string;
  responsible: string;
  responsibleAvatar: string;
  category: string;
  petId: string;
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
    { icon: task.category === 'Banho & Tosa' ? 'shower' : 'handyman', label: task.category === 'Banho & Tosa' ? 'Banho' : 'Execução', gradient: 'from-violet-400 to-purple-500', bgLight: 'bg-violet-50 dark:bg-violet-900/20', textColor: 'text-violet-600 dark:text-violet-400', borderColor: 'border-violet-200 dark:border-violet-800' },
    { icon: task.category === 'Banho & Tosa' ? 'content_cut' : 'task_alt', label: task.category === 'Banho & Tosa' ? 'Tosa' : 'Finalização', gradient: 'from-rose-400 to-pink-500', bgLight: 'bg-rose-50 dark:bg-rose-900/20', textColor: 'text-rose-600 dark:text-rose-400', borderColor: 'border-rose-200 dark:border-rose-800' },
    { icon: 'sentiment_very_satisfied', label: 'Entrega', gradient: 'from-emerald-400 to-teal-500', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-800' }
  ];

  // Distribute checklist items across steps (skip first step - check-in)
  const getChecklistForStep = (stepIndex: number) => {
    if (task.checklist.length === 0 || stepIndex === 0) return [];
    const relevantSteps = 3; // banho, tosa, entrega
    const itemsPerStep = Math.ceil(task.checklist.length / relevantSteps);
    const adjustedIndex = stepIndex - 1;
    const start = adjustedIndex * itemsPerStep;
    return task.checklist.slice(start, start + itemsPerStep);
  };

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


// --- Checklist Modal ---
const ChecklistModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checkedIds: string[], afterPhotoUrl?: string) => void;
  task: ServiceTask;
}> = ({ isOpen, onClose, onConfirm, task }) => {
  const { showNotification } = useNotification();
  const [checkedIds, setCheckedIds] = useState<string[]>(task.checkedItems || []);
  const [afterPhoto, setAfterPhoto] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCheckedIds(task.checkedItems || []);
      setAfterPhoto('');
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allChecked = task.checklist.every(item => checkedIds.includes(item.id));
  const isLastStep = task.currentStepIndex === task.steps.length - 2; // Penultimate step (before "finished")

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `services/${task.appointmentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('pets').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('pets').getPublicUrl(fileName);
      setAfterPhoto(data.publicUrl);
      showNotification('Foto carregada! Clique em Concluir para salvar.', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Erro ao fazer upload da foto', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-8 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-2">Execução: {task.petName}</h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 font-bold uppercase">{task.steps[task.currentStepIndex].label}</p>

        <div className="space-y-3 mb-6">
          {task.checklist.map((item) => (
            <label key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checkedIds.includes(item.id) ? 'bg-primary border-primary text-white scale-110' : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-[#222]'}`}>
                {checkedIds.includes(item.id) && <span className="material-symbols-outlined text-sm font-bold">check</span>}
              </div>
              <input type="checkbox" className="hidden" checked={checkedIds.includes(item.id)} onChange={() => toggleCheck(item.id)} />
              <span className={`text-sm font-black uppercase tracking-tight ${checkedIds.includes(item.id) ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-gray-300'}`}>{item.text}</span>
            </label>
          ))}
          {task.checklist.length === 0 && <p className="text-xs text-slate-400 text-center italic">Nenhum checklist configurado para este serviço.</p>}
        </div>

        {/* Photo Upload - Only on last step */}
        {isLastStep && (
          <div className="mb-6 p-4 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">photo_camera</span>
              <h3 className="text-xs font-black uppercase text-primary">Foto do Resultado</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">Tire uma foto do resultado final para a galeria do pet!</p>

            {afterPhoto ? (
              <div className="relative">
                <img src={afterPhoto} className="w-full h-48 object-cover rounded-xl mb-3" alt="Resultado" />
                <button
                  type="button"
                  onClick={() => setAfterPhoto('')}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="afterPhoto"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('afterPhoto')?.click()}
                  disabled={uploadingPhoto}
                  className="w-full px-4 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                >
                  {uploadingPhoto ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Carregando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                      Adicionar Foto
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 rounded-xl hover:bg-slate-100">Fechar</button>
          <button
            onClick={() => onConfirm(checkedIds, afterPhoto || undefined)}
            disabled={(!allChecked && task.checklist.length > 0)}
            className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastStep ? 'Finalizar & Salvar Foto' : 'Próxima Etapa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Execution: React.FC = () => {
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [detailsTask, setDetailsTask] = useState<ServiceTask | null>(null);
  const [detailsPhoto, setDetailsPhoto] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const { showNotification } = useNotification();

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
    const { data: appts, error } = await supabase
      .from('appointments')
      .select('*, pets(id, name, breed, img), clients(name)')
      .order('start_time', { ascending: true });

    if (!error && appts) {
      const { data: services } = await supabase.from('services').select('name, checklist, category');

      const mapped: ServiceTask[] = appts.filter(a => a.status !== 'cancelled').map(a => {
        const svcInfo = services?.find(s => s.name === a.service);
        return {
          id: a.id,
          appointmentId: a.id,
          petId: a.pet_id,
          petName: a.pets?.name || 'Pet',
          breed: a.pets?.breed || 'SRD',
          ownerName: a.clients?.name || 'Dono',
          petAvatar: a.pets?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.pets?.name || 'P')}&background=random`,
          serviceType: a.service,
          category: svcInfo?.category || 'Geral',
          status: (a.status as ServiceStage) || 'waiting',
          currentStepIndex: a.current_step || 0,
          checklist: svcInfo?.checklist || [],
          checkedItems: a.checklist_state || [],
          steps: [
            { label: 'Check-in', key: 'waiting' },
            { label: svcInfo?.category === 'Banho & Tosa' ? 'Banho' : 'Execução', key: 'in-progress' },
            { label: svcInfo?.category === 'Banho & Tosa' ? 'Tosa' : 'Finalização', key: 'ready' },
            { label: 'Retirada', key: 'finished' }
          ],
          notes: a.notes || '',
          responsible: a.professional || 'Não designado',
          responsibleAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.professional || 'NA')}&background=random`
        };
      });
      setTasks(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleUpdateProgress = async (checkedIds: string[], afterPhotoUrl?: string) => {
    if (!selectedTask) return;

    try {
      let nextStatus = selectedTask.status;
      let nextStep = selectedTask.currentStepIndex;

      const isLastStep = selectedTask.currentStepIndex === selectedTask.steps.length - 1;

      if (!isLastStep) {
        nextStep += 1;
        nextStatus = selectedTask.steps[nextStep].key as ServiceStage;
      } else {
        // When finishing the last step, set to 'ready' for delivery, not 'finished'
        nextStatus = 'ready';
      }

      console.log('=== UPDATE PROGRESS DEBUG ===');
      console.log('Appointment ID:', selectedTask.appointmentId);
      console.log('Current step:', selectedTask.currentStepIndex);
      console.log('Next step:', nextStep);
      console.log('Next status:', nextStatus);
      console.log('Checked IDs:', checkedIds);

      const { error } = await supabase
        .from('appointments')
        .update({
          checklist_state: checkedIds,
          current_step: nextStep,
          status: nextStatus
        })
        .eq('id', selectedTask.appointmentId);

      if (error) {
        console.error('Update error:', error);
        showNotification(`Erro ao atualizar: ${error.message}`, 'error');
        return;
      }

      // If there's an after photo, add it to the pet's gallery
      if (afterPhotoUrl && selectedTask.petId) {
        const { data: petData, error: fetchError } = await supabase
          .from('pets')
          .select('gallery')
          .eq('id', selectedTask.petId)
          .single();

        if (fetchError) {
          console.error('Error fetching pet:', fetchError);
        } else if (petData) {
          const currentGallery = petData.gallery || [];
          const newGallery = [...currentGallery, afterPhotoUrl];

          const { error: galleryError } = await supabase
            .from('pets')
            .update({ gallery: newGallery })
            .eq('id', selectedTask.petId);

          if (galleryError) {
            console.error('Error saving to gallery:', galleryError);
            showNotification('Progresso salvo, mas erro ao adicionar foto à galeria', 'warning');
          } else {
            showNotification(`✅ ${selectedTask.petName} - Foto adicionada à galeria!`, 'success');
          }
        }
      }

      showNotification(`${selectedTask.petName} avançou para ${selectedTask.steps[nextStep].label}!`, 'success');
      fetchTasks();
      setSelectedTask(null);
    } catch (err: any) {
      console.error('Unexpected error:', err);
      showNotification(`Erro inesperado: ${err.message}`, 'error');
    }
  };

  const categories = ['TODOS', 'BANHO & TOSA', 'VETERINÁRIO', 'DAY CARE', 'PRONTOS', 'FINALIZADOS'];
  const filteredTasks = categoryFilter === 'TODOS'
    ? tasks.filter(t => t.status !== 'finished')
    : categoryFilter === 'FINALIZADOS'
      ? tasks.filter(t => t.status === 'finished')
      : categoryFilter === 'PRONTOS'
        ? tasks.filter(t => t.status === 'ready')
        : tasks.filter(t => t.category === categoryFilter && t.status !== 'finished');

  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;

  const getBorderColor = (category: string) => {
    switch (category) {
      case 'Banho & Tosa': return 'border-l-purple-500';
      case 'Veterinário': return 'border-l-amber-500';
      case 'Tosa Higiênica': return 'border-l-emerald-500';
      default: return 'border-l-primary';
    }
  };

  const getButtonColor = (category: string) => {
    switch (category) {
      case 'Banho & Tosa': return 'bg-purple-500 hover:bg-purple-600';
      case 'Veterinário': return 'bg-amber-500 hover:bg-amber-600';
      case 'Tosa Higiênica': return 'bg-emerald-500 hover:bg-emerald-600';
      default: return 'bg-primary hover:bg-primary-hover';
    }
  };

  if (loading && tasks.length === 0) return <div className="flex h-screen items-center justify-center"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#111] overflow-hidden animate-in fade-in duration-500">
      {selectedTask && <ChecklistModal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} onConfirm={handleUpdateProgress} task={selectedTask} />}
      {detailsTask && <TimelineDetailsModal isOpen={!!detailsTask} onClose={() => { setDetailsTask(null); setDetailsPhoto(undefined); }} task={detailsTask} finalPhoto={detailsPhoto} />}

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
            <div className="text-center px-6 py-4 bg-purple-500 rounded-2xl">
              <p className="text-3xl font-black text-white mb-1">{inProgressCount}</p>
              <p className="text-[9px] font-bold uppercase text-purple-200 tracking-wider">Andamento</p>
            </div>
            <div className="text-center px-6 py-4 bg-emerald-500 rounded-2xl border border-emerald-400">
              <p className="text-3xl font-black text-white mb-1">{tasks.filter(t => t.status === 'ready').length}</p>
              <p className="text-[9px] font-bold uppercase text-emerald-100 tracking-wider">Prontos</p>
            </div>
            <div className="text-center px-6 py-4 bg-gray-900 rounded-2xl border border-gray-800">
              <p className="text-3xl font-black text-gray-400 mb-1">{tasks.filter(t => t.status === 'finished').length}</p>
              <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Finalizados</p>
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
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${cat === 'BANHO & TOSA' ? 'bg-purple-500' : cat === 'VETERINÁRIO' ? 'bg-amber-500' : cat === 'DAY CARE' ? 'bg-emerald-500' : cat === 'PRONTOS' ? 'bg-emerald-400' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}></div>
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
                {task.status === 'ready' ? (
                  <p className="text-xs uppercase font-bold mb-1 text-emerald-400 animate-pulse">PRONTO PARA ENTREGA / RETIRADA</p>
                ) : task.status === 'finished' ? (
                  <p className="text-xs uppercase font-bold mb-1 text-gray-400">FINALIZADO</p>
                ) : (
                  <p className="text-xs uppercase font-bold mb-1" style={{ color: task.category === 'Banho & Tosa' ? '#a855f7' : task.category === 'Veterinário' ? '#f59e0b' : '#10b981' }}>EM ANDAMENTO</p>
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
                  onClick={() => task.status === 'finished' ? openDetailsModal(task) : setSelectedTask(task)}
                  className={`px-6 py-3 ${task.status === 'finished' ? 'bg-gray-700 hover:bg-gray-600' : getButtonColor(task.category)} text-white text-sm font-black rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2`}
                >
                  {task.status === 'finished' ? (
                    <>
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      VER DETALHES
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      PRÓXIMA ETAPA
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