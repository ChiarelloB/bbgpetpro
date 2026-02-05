import React, { useState } from 'react';
import { AdvancedChecklistTemplate, TemplateSection, TemplateField } from './TemplateBuilder';

interface ExecutionChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Record<string, any>) => void;
    template: AdvancedChecklistTemplate | null;
    petName: string;
    title?: string;
}

export const ExecutionChecklistModal: React.FC<ExecutionChecklistModalProps> = ({
    isOpen,
    onClose,
    onSave,
    template,
    petName,
    title = 'Checklist de Início'
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [formData, setFormData] = useState<Record<string, any>>({});

    React.useEffect(() => {
        console.log('ExecutionChecklistModal MOUNTED');
        console.log('Props:', { isOpen, template, petName, hasOnSave: !!onSave });
        return () => console.log('ExecutionChecklistModal UNMOUNTED');
    }, [isOpen, template, petName, onSave]);

    React.useEffect(() => {
        // Initialize all sections as expanded
        if (template) {
            setExpandedSections(new Set(template.sections.map(s => s.id)));
        }
    }, [template]);

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const updateField = (fieldId: string, value: any) => {
        setFormData({ ...formData, [fieldId]: value });
    };

    const handleSubmit = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        window.alert('DEBUG: Botão clicado (ExecutionChecklistModal)');
        console.log('ExecutionChecklistModal: handleSubmit triggered');
        console.log('FormData:', formData);
        onSave(formData);
        onClose();
    };

    if (!isOpen || !template) return null;

    const renderField = (field: TemplateField) => {
        switch (field.type) {
            case 'checkbox':
                return (
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData[field.id] || false}
                            onChange={(e) => updateField(field.id, e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-primary transition-colors">{field.label}</span>
                    </label>
                );
            case 'dropdown':
                return (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">{field.label}</label>
                        <select
                            value={formData[field.id] || ''}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-[#252525] text-slate-700 dark:text-white text-sm px-3"
                        >
                            <option value="">Selecione</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                );
            case 'text':
                return (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">{field.label}</label>
                        <input
                            type="text"
                            value={formData[field.id] || ''}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full h-10 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-[#252525] text-slate-700 dark:text-white text-sm px-3"
                        />
                    </div>
                );
            case 'textarea':
                return (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">{field.label}</label>
                        <textarea
                            value={formData[field.id] || ''}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-[#252525] text-slate-700 dark:text-white text-sm p-3 resize-none"
                        />
                    </div>
                );
            case 'photo':
                return (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">{field.label}</label>
                        <div className="border-2 border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
                            <span className="material-symbols-outlined text-3xl text-blue-400 mb-2">cloud_upload</span>
                            <p className="text-sm text-slate-500 dark:text-gray-400">Clique para adicionar fotos</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderCheckboxGroup = (fields: TemplateField[]) => {
        const checkboxFields = fields.filter(f => f.type === 'checkbox');
        const otherFields = fields.filter(f => f.type !== 'checkbox');

        return (
            <>
                {checkboxFields.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {checkboxFields.map(field => (
                            <div key={field.id}>{renderField(field)}</div>
                        ))}
                    </div>
                )}
                {otherFields.map(field => (
                    <div key={field.id} className="mb-4">{renderField(field)}</div>
                ))}
            </>
        );
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 flex flex-col max-h-[90vh] pointer-events-auto">

                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-gray-800 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title} - {petName}</h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Preencha as informações antes de iniciar o serviço</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {template.sections.map((section) => (
                        <div key={section.id} className="bg-slate-50 dark:bg-[#111] rounded-xl overflow-hidden border border-slate-100 dark:border-gray-800">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-lg">{section.icon}</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{section.title}</span>
                                </div>
                                <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedSections.has(section.id) ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </button>

                            {/* Section Content */}
                            {expandedSections.has(section.id) && (
                                <div className="p-4 pt-0">
                                    {renderCheckboxGroup(section.fields)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 dark:text-gray-400 font-bold text-sm hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.alert('CLIQUE DE TESTE DIRETO');
                            handleSubmit(e);
                        }}
                        style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', padding: '15px', borderRadius: '10px', fontSize: '16px', zIndex: 999999, position: 'relative', border: '5px solid yellow' }}
                    >
                        BOTÃO DE TESTE DE DEBUG
                    </button>
                </div>
            </div>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '20px', background: 'red', zIndex: 999999, pointerEvents: 'none', content: '"TEST MODE ACTIVE"' }}></div>
        </div>
    );
};
