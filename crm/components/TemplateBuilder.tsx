import React, { useState, useEffect } from 'react';

// Types for visual template builder
export interface TemplateField {
    id: string;
    type: 'checkbox' | 'dropdown' | 'text' | 'textarea' | 'photo';
    label: string;
    options?: string[];
    placeholder?: string;
    required?: boolean;
}

export interface TemplateSection {
    id: string;
    title: string;
    icon: string;
    fields: TemplateField[];
}

export interface AdvancedChecklistTemplate {
    id: string;
    name: string;
    sections: TemplateSection[];
}

const ADVANCED_TEMPLATES_KEY = 'flowpet_advanced_checklist_templates';
const TEMPLATES_INITIALIZED_KEY = 'flowpet_templates_initialized';

// Default Templates
const DEFAULT_INITIAL_TEMPLATE: AdvancedChecklistTemplate = {
    id: 'default_initial',
    name: 'Checklist de Início (Padrão)',
    sections: [
        {
            id: 'sec_pertences',
            title: 'Pertences do Cliente',
            icon: 'inventory_2',
            fields: [
                { id: 'f1', type: 'checkbox', label: 'Coleira' },
                { id: 'f2', type: 'checkbox', label: 'Guia' },
                { id: 'f3', type: 'checkbox', label: 'Peitoral' },
                { id: 'f4', type: 'checkbox', label: 'Brinquedo' },
                { id: 'f5', type: 'text', label: 'Outros', placeholder: 'Descreva outros pertences...' },
            ]
        },
        {
            id: 'sec_analise',
            title: 'Análise Inicial',
            icon: 'spa',
            fields: [
                { id: 'f6', type: 'dropdown', label: 'Estado da Pelagem', options: ['Ótimo', 'Bom', 'Regular', 'Ruim', 'Muito Ruim'] },
                { id: 'f7', type: 'dropdown', label: 'Nível de Sujeira', options: ['Limpo', 'Pouco Sujo', 'Sujo', 'Muito Sujo'] },
                { id: 'f8', type: 'checkbox', label: 'Parasitas Visíveis' },
                { id: 'f9', type: 'checkbox', label: 'Feridas ou Lesões' },
            ]
        },
        {
            id: 'sec_orientacoes',
            title: 'Orientações para Tosa',
            icon: 'content_cut',
            fields: [
                { id: 'f10', type: 'text', label: 'Tosa a Tesoura', placeholder: 'Ex: Arredondar focinho, aparar patas...' },
                { id: 'f11', type: 'text', label: 'Tosa a Máquina', placeholder: 'Ex: Lâmina 7, corpo todo...' },
                { id: 'f12', type: 'dropdown', label: 'Tipo de Tosa Higiênica', options: ['Padrão', 'Completa', 'Não Solicitada'] },
            ]
        },
        {
            id: 'sec_obs',
            title: 'Observações Gerais',
            icon: 'edit_note',
            fields: [
                { id: 'f13', type: 'textarea', label: 'Observações', placeholder: 'Ex: Nervoso, Calmo, Agressivo, Medo de barulho...' },
            ]
        },
        {
            id: 'sec_fotos',
            title: 'Fotos Antes (até 5)',
            icon: 'photo_camera',
            fields: [
                { id: 'f14', type: 'photo', label: 'Fotos do Pet' },
            ]
        }
    ]
};

const DEFAULT_FINAL_TEMPLATE: AdvancedChecklistTemplate = {
    id: 'default_final',
    name: 'Checklist de Finalização (Padrão)',
    sections: [
        {
            id: 'sec_confirmacao',
            title: 'Confirmação do Serviço',
            icon: 'checklist',
            fields: [
                { id: 'ff1', type: 'checkbox', label: 'Banho realizado conforme solicitado' },
                { id: 'ff2', type: 'checkbox', label: 'Tosa realizada conforme orientações' },
                { id: 'ff3', type: 'checkbox', label: 'Orelhas limpas' },
                { id: 'ff4', type: 'checkbox', label: 'Unhas cortadas' },
                { id: 'ff5', type: 'checkbox', label: 'Glândulas verificadas' },
            ]
        },
        {
            id: 'sec_pertences_final',
            title: 'Devolução de Pertences',
            icon: 'inventory_2',
            fields: [
                { id: 'ff6', type: 'checkbox', label: 'Coleira devolvida' },
                { id: 'ff7', type: 'checkbox', label: 'Guia devolvida' },
                { id: 'ff8', type: 'checkbox', label: 'Peitoral devolvido' },
                { id: 'ff9', type: 'checkbox', label: 'Brinquedo devolvido' },
                { id: 'ff10', type: 'text', label: 'Outros itens devolvidos', placeholder: 'Descreva...' },
            ]
        },
        {
            id: 'sec_estado_final',
            title: 'Estado Final do Pet',
            icon: 'pets',
            fields: [
                { id: 'ff11', type: 'dropdown', label: 'Comportamento', options: ['Calmo', 'Agitado', 'Cansado', 'Normal'] },
                { id: 'ff12', type: 'textarea', label: 'Observações Finais', placeholder: 'Alguma observação para o tutor...' },
            ]
        },
        {
            id: 'sec_fotos_final',
            title: 'Fotos Depois (até 5)',
            icon: 'photo_camera',
            fields: [
                { id: 'ff13', type: 'photo', label: 'Fotos do Pet Finalizado' },
            ]
        }
    ]
};

export const loadAdvancedTemplates = (): AdvancedChecklistTemplate[] => {
    try {
        const saved = localStorage.getItem(ADVANCED_TEMPLATES_KEY);
        const templates = saved ? JSON.parse(saved) : [];

        // Initialize default templates on first load
        if (!localStorage.getItem(TEMPLATES_INITIALIZED_KEY)) {
            const defaults = [DEFAULT_INITIAL_TEMPLATE, DEFAULT_FINAL_TEMPLATE];
            localStorage.setItem(ADVANCED_TEMPLATES_KEY, JSON.stringify(defaults));
            localStorage.setItem(TEMPLATES_INITIALIZED_KEY, 'true');
            return defaults;
        }

        return templates;
    } catch { return []; }
};

export const saveAdvancedTemplates = (templates: AdvancedChecklistTemplate[]) => {
    localStorage.setItem(ADVANCED_TEMPLATES_KEY, JSON.stringify(templates));
};


const FIELD_TYPES = [
    { value: 'checkbox', label: 'Checkbox', icon: 'check_box' },
    { value: 'dropdown', label: 'Dropdown', icon: 'arrow_drop_down_circle' },
    { value: 'text', label: 'Texto', icon: 'text_fields' },
    { value: 'textarea', label: 'Área de Texto', icon: 'notes' },
    { value: 'photo', label: 'Foto', icon: 'photo_camera' },
];

const SECTION_ICONS = ['inventory_2', 'spa', 'content_cut', 'edit_note', 'photo_camera', 'pets', 'medical_services', 'cleaning_services'];

interface TemplateBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: AdvancedChecklistTemplate) => void;
    initialData?: AdvancedChecklistTemplate | null;
}

export const TemplateBuilderModal: React.FC<TemplateBuilderModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [templateName, setTemplateName] = useState('');
    const [sections, setSections] = useState<TemplateSection[]>([]);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setTemplateName(initialData.name);
            setSections(initialData.sections);
        } else {
            setTemplateName('');
            setSections([]);
        }
    }, [initialData, isOpen]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const handleAddSection = () => {
        const newSection: TemplateSection = {
            id: generateId(),
            title: 'Nova Seção',
            icon: 'inventory_2',
            fields: []
        };
        setSections([...sections, newSection]);
        setExpandedSection(newSection.id);
    };

    const handleUpdateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
        setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
    };

    const handleDeleteSection = (sectionId: string) => {
        setSections(sections.filter(s => s.id !== sectionId));
    };

    const handleAddField = (sectionId: string) => {
        const newField: TemplateField = {
            id: generateId(),
            type: 'checkbox',
            label: 'Novo Campo',
            required: false
        };
        setSections(sections.map(s =>
            s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
        ));
    };

    const handleUpdateField = (sectionId: string, fieldId: string, updates: Partial<TemplateField>) => {
        setSections(sections.map(s =>
            s.id === sectionId
                ? { ...s, fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) }
                : s
        ));
    };

    const handleDeleteField = (sectionId: string, fieldId: string) => {
        setSections(sections.map(s =>
            s.id === sectionId ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } : s
        ));
    };

    const handleSubmit = () => {
        if (!templateName.trim()) return;
        const template: AdvancedChecklistTemplate = {
            id: initialData?.id || generateId(),
            name: templateName,
            sections
        };
        onSave(template);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-[#111] rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-white/5 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
                    <div>
                        <h2 className="text-xl font-black uppercase italic text-white tracking-tight">Construtor de Template</h2>
                        <p className="text-xs text-white/40 mt-1">Crie checklists profissionais com seções e campos personalizados</p>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 nike-scroll">
                    {/* Template Name */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Nome do Template</label>
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Ex: Checklist Banho Completo"
                            className="w-full h-12 rounded-xl border-white/5 bg-white/5 text-white font-bold focus:ring-primary px-4"
                        />
                    </div>

                    {/* Sections */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Seções do Checklist</label>
                            <button
                                onClick={handleAddSection}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Adicionar Seção
                            </button>
                        </div>

                        {sections.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <span className="material-symbols-outlined text-4xl text-white/20 mb-3">playlist_add</span>
                                <p className="text-white/40 text-sm font-bold">Nenhuma seção criada</p>
                                <p className="text-white/20 text-xs mt-1">Clique em "Adicionar Seção" para começar</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sections.map((section, sectionIdx) => (
                                    <div key={section.id} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                        {/* Section Header */}
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                                    <span className="material-symbols-outlined">{section.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{section.title}</p>
                                                    <p className="text-xs text-white/40">{section.fields.length} campo(s)</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                                                    className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                                <span className={`material-symbols-outlined text-white/40 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </div>
                                        </div>

                                        {/* Section Content (Expanded) */}
                                        {expandedSection === section.id && (
                                            <div className="p-4 pt-0 border-t border-white/5 space-y-4">
                                                {/* Section Settings */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase text-white/30 mb-1">Título da Seção</label>
                                                        <input
                                                            type="text"
                                                            value={section.title}
                                                            onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                                                            className="w-full h-10 rounded-lg border-white/5 bg-white/5 text-white text-sm font-bold px-3"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase text-white/30 mb-1">Ícone</label>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {SECTION_ICONS.map(icon => (
                                                                <button
                                                                    key={icon}
                                                                    type="button"
                                                                    onClick={() => handleUpdateSection(section.id, { icon })}
                                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${section.icon === icon ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">{icon}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Fields */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-[10px] font-black uppercase text-white/30">Campos</label>
                                                        <button
                                                            onClick={() => handleAddField(section.id)}
                                                            className="text-xs text-primary font-bold hover:text-white transition-colors flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">add</span>
                                                            Adicionar Campo
                                                        </button>
                                                    </div>

                                                    {section.fields.length === 0 ? (
                                                        <p className="text-center text-white/20 text-xs py-4 italic">Nenhum campo. Adicione campos à seção.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {section.fields.map((field, fieldIdx) => (
                                                                <div key={field.id} className="p-3 bg-white/5 rounded-xl flex items-start gap-3">
                                                                    {/* Field Type */}
                                                                    <select
                                                                        value={field.type}
                                                                        onChange={(e) => handleUpdateField(section.id, field.id, { type: e.target.value as TemplateField['type'] })}
                                                                        className="h-9 rounded-lg border-white/5 bg-white/10 text-white text-xs font-bold px-2 w-28"
                                                                    >
                                                                        {FIELD_TYPES.map(t => (
                                                                            <option key={t.value} value={t.value}>{t.label}</option>
                                                                        ))}
                                                                    </select>

                                                                    {/* Field Label */}
                                                                    <input
                                                                        type="text"
                                                                        value={field.label}
                                                                        onChange={(e) => handleUpdateField(section.id, field.id, { label: e.target.value })}
                                                                        placeholder="Rótulo do campo"
                                                                        className="flex-1 h-9 rounded-lg border-white/5 bg-white/5 text-white text-xs font-bold px-3"
                                                                    />

                                                                    {/* Dropdown Options (if dropdown) */}
                                                                    {field.type === 'dropdown' && (
                                                                        <input
                                                                            type="text"
                                                                            value={field.options?.join(', ') || ''}
                                                                            onChange={(e) => handleUpdateField(section.id, field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                                                            placeholder="Opções (separar por vírgula)"
                                                                            className="w-40 h-9 rounded-lg border-white/5 bg-white/5 text-white text-xs font-bold px-3"
                                                                        />
                                                                    )}

                                                                    {/* Placeholder (if text/textarea) */}
                                                                    {(field.type === 'text' || field.type === 'textarea') && (
                                                                        <input
                                                                            type="text"
                                                                            value={field.placeholder || ''}
                                                                            onChange={(e) => handleUpdateField(section.id, field.id, { placeholder: e.target.value })}
                                                                            placeholder="Placeholder..."
                                                                            className="w-32 h-9 rounded-lg border-white/5 bg-white/5 text-white text-xs font-bold px-3"
                                                                        />
                                                                    )}

                                                                    {/* Delete Field */}
                                                                    <button
                                                                        onClick={() => handleDeleteField(section.id, field.id)}
                                                                        className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shrink-0"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-[#0a0a0a] flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-white/40 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!templateName.trim() || sections.length === 0}
                        className="px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">save</span>
                        Salvar Template
                    </button>
                </div>
            </div>
        </div>
    );
};
