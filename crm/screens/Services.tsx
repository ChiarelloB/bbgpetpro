import React, { useState, useEffect, useMemo } from 'react';
import { useSecurity } from '../SecurityContext';
import { useNotification } from '../NotificationContext';
import { useResources } from '../ResourceContext';
import { supabase } from '../src/lib/supabase';
import { TemplateBuilderModal, AdvancedChecklistTemplate, loadAdvancedTemplates, saveAdvancedTemplates } from '../components/TemplateBuilder';


interface ChecklistItem {
  id: string;
  text: string;
  requiresPhoto: boolean;
}

interface CostItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistItem[];
}

interface ItemsPorPorte {
  mini: CostItem[];
  pequeno: CostItem[];
  medio: CostItem[];
  grande: CostItem[];
  gigante: CostItem[];
}



const CHECKLIST_TEMPLATES_KEY = 'flowpet_checklist_templates';

const loadTemplates = (): ChecklistTemplate[] => {
  try {
    const saved = localStorage.getItem(CHECKLIST_TEMPLATES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveTemplates = (templates: ChecklistTemplate[]) => {
  localStorage.setItem(CHECKLIST_TEMPLATES_KEY, JSON.stringify(templates));
};


interface ServiceItem {
  id: string;
  name: string;
  description: string;
  ref: string;
  category: string;
  price: number; // Legacy field, kept for backwards compatibility
  price_mini: number;
  price_pequeno: number;
  price_medio: number;
  price_grande: number;
  price_gigante: number;
  duration: number;
  duration_mini?: number;
  duration_pequeno?: number;
  duration_medio?: number;
  duration_grande?: number;
  duration_gigante?: number;

  icon: string;
  image_url: string;
  checklist: ChecklistItem[];
  variations: Record<string, string>;
  costs?: CostItem[];
  items_mini?: CostItem[];
  items_pequeno?: CostItem[];
  items_medio?: CostItem[];
  items_grande?: CostItem[];
  items_gigante?: CostItem[];
  checkin_checklist?: AdvancedChecklistTemplate;
  checkout_checklist?: AdvancedChecklistTemplate;
}



// --- Shared Form Logic Component ---
const ServiceForm: React.FC<{
  initialData?: Partial<ServiceItem>,
  onClose: () => void,
  onSave: (service: any) => void,
  title: string,
  saveLabel: string
}> = ({ initialData, onClose, onSave, title, saveLabel }) => {
  const { tenant } = useSecurity();
  const { sizeSettings } = useResources();
  const [products, setProducts] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || 'Banho');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [priceMini, setPriceMini] = useState(initialData?.price_mini?.toString() || '');
  const [pricePequeno, setPricePequeno] = useState(initialData?.price_pequeno?.toString() || '');
  const [priceMedio, setPriceMedio] = useState(initialData?.price_medio?.toString() || '');
  const [priceGrande, setPriceGrande] = useState(initialData?.price_grande?.toString() || '');
  const [priceGigante, setPriceGigante] = useState(initialData?.price_gigante?.toString() || '');
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '');
  const [durationMini, setDurationMini] = useState(initialData?.duration_mini?.toString() || '');
  const [durationPequeno, setDurationPequeno] = useState(initialData?.duration_pequeno?.toString() || '');
  const [durationMedio, setDurationMedio] = useState(initialData?.duration_medio?.toString() || '');
  const [durationGrande, setDurationGrande] = useState(initialData?.duration_grande?.toString() || '');
  const [durationGigante, setDurationGigante] = useState(initialData?.duration_gigante?.toString() || '');

  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialData?.checklist || []);
  const [newItemText, setNewItemText] = useState('');
  const [costs, setCosts] = useState<CostItem[]>(initialData?.costs || []);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState('1');
  const [variations, setVariations] = useState<Record<string, string>>(initialData?.variations || {});
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(loadTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [advancedTemplates, setAdvancedTemplates] = useState<AdvancedChecklistTemplate[]>(loadAdvancedTemplates());
  const [isTemplateBuilderOpen, setIsTemplateBuilderOpen] = useState(false);
  const [activePorteTab, setActivePorteTab] = useState<'mini' | 'pequeno' | 'medio' | 'grande' | 'gigante'>('pequeno');
  const [itemsPorPorte, setItemsPorPorte] = useState<ItemsPorPorte>({
    mini: initialData?.items_mini || [],
    pequeno: initialData?.items_pequeno || [],
    medio: initialData?.items_medio || [],
    grande: initialData?.items_grande || [],
    gigante: initialData?.items_gigante || []
  });
  const [checkinChecklist, setCheckinChecklist] = useState<AdvancedChecklistTemplate | null>(initialData?.checkin_checklist || null);
  const [checkoutChecklist, setCheckoutChecklist] = useState<AdvancedChecklistTemplate | null>(initialData?.checkout_checklist || null);
  const [editingChecklistType, setEditingChecklistType] = useState<'checkin' | 'checkout' | null>(null);
  const [selectedPorteProductId, setSelectedPorteProductId] = useState('');
  const [selectedPorteQty, setSelectedPorteQty] = useState('1');
  const [activeTab, setActiveTab] = useState<'info' | 'price' | 'products' | 'checklist'>('info');




  useEffect(() => {
    const fetchInv = async () => {
      if (!tenant?.id) return;
      const { data } = await supabase
        .from('inventory_items')
        .select('id, name, price')
        .eq('tenant_id', tenant.id);
      if (data) setProducts(data);
    };
    fetchInv();
  }, [tenant?.id]);

  useEffect(() => {
    if (sizeSettings.length > 0 && Object.keys(variations).length === 0) {
      const initVariations: Record<string, string> = {};
      setVariations(initVariations);
    }
  }, [sizeSettings]);

  const totalCosts = useMemo(() => {
    return costs.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [costs]);

  const profit = parseFloat(price) - totalCosts;
  const margin = parseFloat(price) > 0 ? (profit / parseFloat(price)) * 100 : 0;

  // Calculate profit and margin per size
  const profitPerSize = useMemo(() => {
    const calcCosts = (items: CostItem[]) => items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);

    const miniCosts = calcCosts(itemsPorPorte.mini);
    const pequenoCosts = calcCosts(itemsPorPorte.pequeno);
    const medioCosts = calcCosts(itemsPorPorte.medio);
    const grandeCosts = calcCosts(itemsPorPorte.grande);
    const giganteCosts = calcCosts(itemsPorPorte.gigante);

    const miniPriceNum = parseFloat(priceMini) || 0;
    const pequenoPriceNum = parseFloat(pricePequeno) || 0;
    const medioPriceNum = parseFloat(priceMedio) || 0;
    const grandePriceNum = parseFloat(priceGrande) || 0;
    const gigantePriceNum = parseFloat(priceGigante) || 0;

    return {
      mini: {
        costs: miniCosts,
        profit: miniPriceNum - miniCosts,
        margin: miniPriceNum > 0 ? ((miniPriceNum - miniCosts) / miniPriceNum) * 100 : 0
      },
      pequeno: {
        costs: pequenoCosts,
        profit: pequenoPriceNum - pequenoCosts,
        margin: pequenoPriceNum > 0 ? ((pequenoPriceNum - pequenoCosts) / pequenoPriceNum) * 100 : 0
      },
      medio: {
        costs: medioCosts,
        profit: medioPriceNum - medioCosts,
        margin: medioPriceNum > 0 ? ((medioPriceNum - medioCosts) / medioPriceNum) * 100 : 0
      },
      grande: {
        costs: grandeCosts,
        profit: grandePriceNum - grandeCosts,
        margin: grandePriceNum > 0 ? ((grandePriceNum - grandeCosts) / grandePriceNum) * 100 : 0
      },
      gigante: {
        costs: giganteCosts,
        profit: gigantePriceNum - giganteCosts,
        margin: gigantePriceNum > 0 ? ((gigantePriceNum - giganteCosts) / gigantePriceNum) * 100 : 0
      }
    };
  }, [itemsPorPorte, priceMini, pricePequeno, priceMedio, priceGrande, priceGigante]);



  const handleAddCost = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const newItem: CostItem = {
      productId: prod.id,
      name: prod.name,
      quantity: parseFloat(selectedQty) || 1,
      unitPrice: prod.price
    };
    setCosts([...costs, newItem]);
    setSelectedProductId('');
    setSelectedQty('1');
  };

  const handleAddItemPorte = () => {
    if (!selectedPorteProductId) return;
    const prod = products.find(p => p.id === selectedPorteProductId);
    if (!prod) return;

    const newItem: CostItem = {
      productId: prod.id,
      name: prod.name,
      quantity: parseFloat(selectedPorteQty) || 1,
      unitPrice: prod.price
    };
    setItemsPorPorte({
      ...itemsPorPorte,
      [activePorteTab]: [...itemsPorPorte[activePorteTab], newItem]
    });
    setSelectedPorteProductId('');
    setSelectedPorteQty('1');
  };

  const handleRemoveItemPorte = (index: number) => {
    setItemsPorPorte({
      ...itemsPorPorte,
      [activePorteTab]: itemsPorPorte[activePorteTab].filter((_, i) => i !== index)
    });
  };


  const handleAddChecklistItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = { id: Math.random().toString(36).substr(2, 9), text: newItemText, requiresPhoto: false };
    setChecklist([...checklist, newItem]);
    setNewItemText('');
  };


  const handleApplyTemplate = (templateId: string) => {
    // Check if it's an advanced template from Builder
    if (templateId.startsWith('advanced_')) {
      const actualId = templateId.replace('advanced_', '');
      const advTemplate = advancedTemplates.find(t => t.id === actualId);
      if (advTemplate) {
        // Convert advanced template sections/fields to simple checklist items for now
        const items: ChecklistItem[] = [];
        advTemplate.sections.forEach(section => {
          section.fields.forEach(field => {
            items.push({
              id: Math.random().toString(36).substr(2, 9),
              text: `[${section.title}] ${field.label}`,
              requiresPhoto: field.type === 'photo'
            });
          });
        });
        setChecklist(items);
      }
    } else {
      // Simple template
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setChecklist(template.items.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) })));
      }
    }
    setSelectedTemplateId(templateId);
  };


  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim() || checklist.length === 0) return;
    const newTemplate: ChecklistTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTemplateName,
      items: checklist
    };
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
    setNewTemplateName('');
    setShowSaveTemplate(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
  };

  const handleSaveAdvancedTemplate = (template: AdvancedChecklistTemplate) => {
    const existing = advancedTemplates.findIndex(t => t.id === template.id);
    let updated: AdvancedChecklistTemplate[];
    if (existing >= 0) {
      updated = advancedTemplates.map(t => t.id === template.id ? template : t);
    } else {
      updated = [...advancedTemplates, template];
    }
    setAdvancedTemplates(updated);
    saveAdvancedTemplates(updated);

    // If we're editing a specific checklist for the service, update it too
    if (editingChecklistType === 'checkin') {
      setCheckinChecklist(template);
    } else if (editingChecklistType === 'checkout') {
      setCheckoutChecklist(template);
    }
  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `service-${Date.now()}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Erro ao fazer upload da imagem. Tente usar uma URL direta.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...initialData,
      name,
      description,
      checklist,
      category,
      price: parseFloat(price) || 0,
      price_mini: parseFloat(priceMini) || 0,
      price_pequeno: parseFloat(pricePequeno) || 0,
      price_medio: parseFloat(priceMedio) || 0,
      price_grande: parseFloat(priceGrande) || 0,
      price_gigante: parseFloat(priceGigante) || 0,
      duration: parseInt(duration) || 0,
      duration_mini: parseInt(durationMini) || 0,
      duration_pequeno: parseInt(durationPequeno) || 0,
      duration_medio: parseInt(durationMedio) || 0,
      duration_grande: parseInt(durationGrande) || 0,
      duration_gigante: parseInt(durationGigante) || 0,
      variations,
      costs,
      image_url: imageUrl,
      items_mini: itemsPorPorte.mini,
      items_pequeno: itemsPorPorte.pequeno,
      items_medio: itemsPorPorte.medio,
      items_grande: itemsPorPorte.grande,
      items_gigante: itemsPorPorte.gigante,
      checkin_checklist: checkinChecklist,
      checkout_checklist: checkoutChecklist
    });
  };



  return (
    <>
      <TemplateBuilderModal
        isOpen={isTemplateBuilderOpen}
        onClose={() => {
          setIsTemplateBuilderOpen(false);
          setEditingChecklistType(null);
        }}
        onSave={handleSaveAdvancedTemplate}
        initialData={editingChecklistType === 'checkin' ? checkinChecklist : editingChecklistType === 'checkout' ? checkoutChecklist : null}
      />
      <div className="bg-[#111] rounded-3xl shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-white/5">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <div className="flex border-b border-white/5 px-8">
          {[
            { id: 'info', label: 'Informações', icon: 'info' },
            { id: 'price', label: 'Preços e Prazos', icon: 'payments' },
            { id: 'products', label: 'Insumos e Custos', icon: 'inventory_2' },
            { id: 'checklist', label: 'Checklists', icon: 'checklist' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-white' : 'border-transparent text-white/40 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 h-[60vh] overflow-y-auto nike-scroll">
          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Nome do Serviço</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full h-14 rounded-2xl border-white/5 bg-white/5 text-white text-lg font-bold focus:ring-primary focus:border-primary px-6" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Imagem do Serviço</label>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-white/20">image</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="Cole a URL da imagem..."
                      className="w-full h-12 rounded-xl border-white/5 bg-white/5 text-white text-sm font-bold focus:ring-primary px-4"
                    />
                    <div className="flex gap-2">
                      <label className="flex-1 h-12 rounded-xl bg-white/10 border border-dashed border-white/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/20 transition-colors">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        {uploadingImage ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-lg text-white/60">upload</span>
                            <span className="text-xs font-bold text-white/60">Upload</span>
                          </>
                        )}
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-14 rounded-2xl border-white/5 bg-white/5 text-white font-bold focus:ring-primary px-6">
                  <option value="Banho">Banho</option>
                  <option value="Estética">Estética</option>
                  <option value="Saúde Animal">Saúde Animal</option>
                  <option value="Hospedagem">Hospedagem</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Descrição Curta</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-2xl border-white/5 bg-white/5 text-white text-sm font-bold focus:ring-primary p-6 resize-none" placeholder="Breve descrição para o catálogo..." />
              </div>
            </div>
          )}

          {/* PRICE TAB */}
          {activeTab === 'price' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Duração Padrão (Min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} required className="w-full h-14 rounded-2xl border-white/5 bg-white/5 text-white text-lg font-bold focus:ring-primary px-6" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Preço Base (Legado)</label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full h-14 rounded-2xl border-white/5 bg-white/10 text-white/60 text-lg font-bold px-6" placeholder="Opcional" />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-[10px] font-black uppercase text-primary mb-4 tracking-widest">💰 Preços por Porte</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(['mini', 'pequeno', 'medio', 'grande', 'gigante'] as const).map(porte => (
                    <div key={porte} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
                      <label className="block text-[10px] font-black uppercase text-white/60 tracking-widest text-center mb-1">{porte.charAt(0).toUpperCase() + porte.slice(1)}</label>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="text-emerald-500 text-[10px] font-bold">R$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={porte === 'mini' ? priceMini : porte === 'pequeno' ? pricePequeno : porte === 'medio' ? priceMedio : porte === 'grande' ? priceGrande : priceGigante}
                          onChange={e => {
                            const v = e.target.value;
                            if (porte === 'mini') setPriceMini(v);
                            else if (porte === 'pequeno') setPricePequeno(v);
                            else if (porte === 'medio') setPriceMedio(v);
                            else if (porte === 'grande') setPriceGrande(v);
                            else setPriceGigante(v);
                          }}
                          className="w-full h-10 rounded-xl border-white/10 bg-white/5 text-white font-black text-sm focus:ring-emerald-500/50 focus:border-emerald-500 pl-7 pr-2 text-center"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-white/40 text-[14px]">schedule</span>
                        </div>
                        <input
                          type="number"
                          value={porte === 'mini' ? durationMini : porte === 'pequeno' ? durationPequeno : porte === 'medio' ? durationMedio : porte === 'grande' ? durationGrande : durationGigante}
                          onChange={e => {
                            const v = e.target.value;
                            if (porte === 'mini') setDurationMini(v);
                            else if (porte === 'pequeno') setDurationPequeno(v);
                            else if (porte === 'medio') setDurationMedio(v);
                            else if (porte === 'grande') setDurationGrande(v);
                            else setDurationGigante(v);
                          }}
                          className="w-full h-10 rounded-xl border-white/10 bg-white/5 text-white font-black text-sm focus:ring-primary focus:border-primary pl-7 pr-2 text-center"
                          placeholder="Min"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/40 mt-3 italic">O sistema calculará automaticamente o preço correto no agendamento baseado no porte do pet.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-white/40 mb-4 tracking-widest">Variação de Preço por Porte (Avançado)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sizeSettings.map(size => (
                    <div key={size.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <label className="block text-[9px] font-black uppercase text-white/40 mb-2 tracking-widest">{size.label}</label>
                      <input type="number" value={variations[size.id] || 0} onChange={e => setVariations({ ...variations, [size.id]: e.target.value })} className="w-full h-10 rounded-xl border-white/5 bg-white/5 text-white text-center font-bold px-2 focus:ring-primary" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-[10px] font-black uppercase text-primary mb-4 tracking-widest">📦 Itens Usados por Porte</h3>

                <div className="flex gap-1 mb-4">
                  {(['mini', 'pequeno', 'medio', 'grande', 'gigante'] as const).map(porte => (
                    <button
                      key={porte}
                      type="button"
                      onClick={() => setActivePorteTab(porte)}
                      className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activePorteTab === porte
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                        }`}
                    >
                      {porte === 'mini' ? 'Mini' : porte === 'pequeno' ? 'Peq' : porte === 'medio' ? 'Méd' : porte === 'grande' ? 'Gra' : 'Gig'}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <select
                    value={selectedPorteProductId}
                    onChange={e => setSelectedPorteProductId(e.target.value)}
                    className="flex-1 h-10 rounded-xl border-white/10 bg-white/5 text-white text-xs font-bold px-3 min-w-0"
                  >
                    <option value="">Selecionar produto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={selectedPorteQty}
                      onChange={e => setSelectedPorteQty(e.target.value)}
                      placeholder="Qtd"
                      className="w-20 h-10 rounded-xl border-white/10 bg-white/5 text-white text-xs font-bold px-3 text-center"
                    />
                    <button
                      type="button"
                      onClick={handleAddItemPorte}
                      className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-all shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>

                {itemsPorPorte[activePorteTab].length > 0 ? (
                  <div className="space-y-2">
                    {itemsPorPorte[activePorteTab].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white">{item.name}</span>
                          <span className="text-xs text-white/40">x{item.quantity}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemPorte(idx)}
                          className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30 text-center py-4 italic">Nenhum item configurado para este porte</p>
                )}
                <p className="text-xs text-white/40 mt-3 italic">Configure os produtos do estoque que serão consumidos para cada porte.</p>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {(['mini', 'pequeno', 'medio', 'grande', 'gigante'] as const).map(porte => {
                    const data = profitPerSize[porte];
                    const porteName = porte === 'mini' ? 'Mini' : porte === 'pequeno' ? 'Peq' : porte === 'medio' ? 'Méd' : porte === 'grande' ? 'Gra' : 'Gig';
                    return (
                      <div key={porte} className={`p-2 rounded-xl ${activePorteTab === porte ? 'bg-primary/10 border border-primary/30' : 'bg-white/5 border border-white/10'}`}>
                        <p className="text-[8px] font-black uppercase text-white/40 mb-1">{porteName}</p>
                        <p className="text-[10px] text-white/60">
                          <span className="text-rose-400 font-bold">R$ {data.costs.toFixed(0)}</span>
                        </p>
                        <p className="text-[10px] text-white/60">
                          <span className={`font-bold ${data.profit >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                            R$ {data.profit.toFixed(0)}
                          </span>
                        </p>
                        <p className="text-[10px] text-white/60">
                          <span className={`font-bold ${data.margin >= 20 ? 'text-green-400' : data.margin >= 0 ? 'text-yellow-400' : 'text-rose-400'}`}>
                            {data.margin.toFixed(0)}%
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-8 border border-white/5 space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Composição de Custos (Geral)</h3>
                  <p className="text-white font-black italic text-sm">Total: <span className="text-rose-500">R$ {totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                </div>

                <div className="flex gap-3">
                  <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="flex-1 h-12 rounded-xl border-white/5 bg-white/10 text-white text-xs font-bold px-4 min-w-0"
                  >
                    <option value="">Selecione o produto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                    ))}
                  </select>
                  <input type="number" value={selectedQty} onChange={e => setSelectedQty(e.target.value)} className="w-20 h-12 rounded-xl border-white/5 bg-white/10 text-white text-center font-bold px-2" />
                  <button type="button" onClick={handleAddCost} className="bg-[#10b981] text-white w-12 h-12 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined">add</span></button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto nike-scroll pr-2">
                  {costs.map(item => (
                    <div key={item.productId} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div>
                        <p className="text-xs font-bold text-white uppercase italic">{item.name}</p>
                        <p className="text-[10px] text-white/40 font-black">{item.quantity} un x R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <button type="button" onClick={() => setCosts(costs.filter(c => c.productId !== item.productId))} className="text-rose-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#7c3aed30] border border-primary/20 p-6 rounded-3xl text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><span className="material-symbols-outlined text-4xl">savings</span></div>
                    <p className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Lucro Estimado</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-[#f59e0b30] border border-[#f59e0b]/20 p-6 rounded-3xl text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><span className="material-symbols-outlined text-4xl">trending_up</span></div>
                    <p className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Margem</p>
                    <p className={`text-2xl font-black italic tracking-tighter ${margin > 30 ? 'text-[#f59e0b]' : 'text-rose-500'}`}>{margin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHECKLIST TAB */}
          {activeTab === 'checklist' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-[10px] font-black uppercase text-primary mb-4 tracking-widest">📋 Checklists Avançados</h3>
                <div className="space-y-4">
                  {/* Check-in */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Checklist de Início (Check-in)</label>
                    <div className="flex gap-2">
                      <select
                        value={checkinChecklist?.id || ''}
                        onChange={(e) => {
                          const template = advancedTemplates.find(t => t.id === e.target.value);
                          setCheckinChecklist(template || null);
                        }}
                        className="flex-1 h-10 rounded-xl border-white/10 bg-white/5 text-white text-xs font-bold px-3 min-w-0"
                      >
                        <option value="">Nenhum (Usar Padrão)</option>
                        {advancedTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChecklistType('checkin');
                          setIsTemplateBuilderOpen(true);
                        }}
                        className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">{checkinChecklist ? 'edit' : 'add'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Check-out */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Checklist de Finalização (Check-out)</label>
                    <div className="flex gap-2">
                      <select
                        value={checkoutChecklist?.id || ''}
                        onChange={(e) => {
                          const template = advancedTemplates.find(t => t.id === e.target.value);
                          setCheckoutChecklist(template || null);
                        }}
                        className="flex-1 h-10 rounded-xl border-white/10 bg-white/5 text-white text-xs font-bold px-3 min-w-0"
                      >
                        <option value="">Nenhum (Usar Padrão)</option>
                        {advancedTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChecklistType('checkout');
                          setIsTemplateBuilderOpen(true);
                        }}
                        className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">{checkoutChecklist ? 'edit' : 'add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-white/30 mt-3 italic leading-tight">Combine o Checklist de Execução com templates detalhados de entrada e saída.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Checklist de Execução (Etapas)</label>

                {/* Template Selector */}
                <div className="flex gap-2 mb-4">
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleApplyTemplate(e.target.value)}
                    className="flex-1 h-12 rounded-xl border-white/5 bg-white/10 text-white text-xs font-bold px-4 min-w-0"
                  >
                    <option value="">Selecionar template...</option>
                    <optgroup label="Templates Avançados (Builder)">
                      {advancedTemplates.map(t => (
                        <option key={t.id} value={`advanced_${t.id}`}>{t.name} ({t.sections.length} seções)</option>
                      ))}
                    </optgroup>
                    <optgroup label="Templates Simples">
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.items.length} itens)</option>
                      ))}
                    </optgroup>
                  </select>

                  <button
                    type="button"
                    onClick={() => setIsTemplateBuilderOpen(true)}
                    className="h-12 px-4 rounded-xl bg-primary/20 text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all text-xs font-bold"
                    title="Criar novo template profissional"
                  >
                    <span className="material-symbols-outlined text-sm">dashboard_customize</span>
                    Builder
                  </button>

                  {templates.length > 0 && selectedTemplateId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(selectedTemplateId)}
                      className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                      title="Excluir template"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>

                {/* Add Item */}
                <div className="flex gap-3 mb-4">
                  <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)} className="flex-1 h-12 rounded-xl border-white/5 bg-white/5 text-white text-sm px-6" placeholder="Nova etapa..." />
                  <button type="button" onClick={handleAddChecklistItem} className="bg-[#10b981] text-white w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"><span className="material-symbols-outlined">add</span></button>
                </div>

                {/* Checklist Items */}
                <div className="space-y-2 bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
                  {checklist.length === 0 ? (
                    <p className="text-center text-white/20 text-xs font-bold py-4 italic">Nenhuma etapa configurada.</p>
                  ) : checklist.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl text-xs font-bold">
                      <span className="text-white">{(idx + 1).toString().padStart(2, '0')}. {item.text}</span>
                      <button type="button" onClick={() => setChecklist(checklist.filter(i => i.id !== item.id))} className="text-rose-500 hover:scale-110"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  ))}
                </div>

                {/* Save as Template */}
                {checklist.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    {showSaveTemplate ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="Nome do template..."
                          className="flex-1 h-10 rounded-xl border-white/5 bg-white/5 text-white text-xs px-4"
                        />
                        <button type="button" onClick={handleSaveAsTemplate} className="px-4 h-10 bg-primary text-white text-xs font-bold rounded-xl">Salvar</button>
                        <button type="button" onClick={() => setShowSaveTemplate(false)} className="px-4 h-10 bg-white/10 text-white/60 text-xs font-bold rounded-xl">Cancelar</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSaveTemplate(true)}
                        className="flex items-center gap-2 text-xs font-bold text-primary hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">bookmark_add</span>
                        Salvar como Template
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="col-span-full pt-8 flex justify-end gap-6 h-auto sticky bottom-0 bg-[#111] py-8 border-t border-white/5 mt-8 z-20">
            <button type="button" onClick={onClose} className="text-white/40 hover:text-white font-black text-xs uppercase tracking-widest px-8 transition-colors">Cancelar</button>
            <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-widest px-10 py-4 rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-2 transition-all active:scale-95 group">
              <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">check</span>
              {saveLabel}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const { showNotification } = useNotification();
  const { tenant } = useSecurity();
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [mainAdvancedTemplates, setMainAdvancedTemplates] = useState<AdvancedChecklistTemplate[]>(loadAdvancedTemplates());
  const [editingTemplate, setEditingTemplate] = useState<AdvancedChecklistTemplate | null>(null);

  const handleSaveMainAdvancedTemplate = (template: AdvancedChecklistTemplate) => {
    const existing = mainAdvancedTemplates.findIndex(t => t.id === template.id);
    let updated: AdvancedChecklistTemplate[];
    if (existing >= 0) {
      updated = mainAdvancedTemplates.map(t => t.id === template.id ? template : t);
    } else {
      updated = [...mainAdvancedTemplates, template];
    }
    setMainAdvancedTemplates(updated);
    saveAdvancedTemplates(updated);
    showNotification('Template salvo com sucesso!', 'success');
    setEditingTemplate(null);
  };

  const handleDeleteAdvancedTemplate = (templateId: string) => {
    const updated = mainAdvancedTemplates.filter(t => t.id !== templateId);
    setMainAdvancedTemplates(updated);
    saveAdvancedTemplates(updated);
    showNotification('Template excluído!', 'success');
  };

  const handleEditTemplate = (template: AdvancedChecklistTemplate) => {
    setEditingTemplate(template);
    setIsBuilderModalOpen(true);
  };


  const fetchServices = async () => {
    try {
      setLoading(true);
      if (!tenant?.id) return;
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('name');
      if (error) throw error;
      if (data) {
        setServices(data.map(s => ({
          ...s,
          id: String(s.id),
          ref: String(s.id).slice(0, 5).toUpperCase(),
          price: parseFloat(String(s.price)) || 0,
          duration: parseInt(String(s.duration)) || 0,
          duration_mini: s.duration_mini || 0,
          duration_pequeno: s.duration_pequeno || 0,
          duration_medio: s.duration_medio || 0,
          duration_grande: s.duration_grande || 0,
          duration_gigante: s.duration_gigante || 0,
          price_mini: s.price_mini || 0,
          price_pequeno: s.price_pequeno || 0,
          price_medio: s.price_medio || 0,
          price_grande: s.price_grande || 0,
          price_gigante: s.price_gigante || 0,
          image_url: s.img || s.image_url || '',
          checklist: s.checklist || [],
          variations: s.variations || {},
          costs: s.costs || []
        })));
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      showNotification('Erro ao carregar serviços', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSaveService = async (service: ServiceItem) => {
    try {
      const dbService = {
        name: service.name,
        description: service.description || '',
        category: service.category,
        price: service.price?.toString() || '0', // Keep for backwards compatibility
        duration: service.duration?.toString() || '60',
        duration_mini: Number(service.duration_mini) || 0,
        duration_pequeno: Number(service.duration_pequeno) || 0,
        duration_medio: Number(service.duration_medio) || 0,
        duration_grande: Number(service.duration_grande) || 0,
        duration_gigante: Number(service.duration_gigante) || 0,
        price_mini: Number(service.price_mini) || 0,
        price_pequeno: Number(service.price_pequeno) || 0,
        price_medio: Number(service.price_medio) || 0,
        price_grande: Number(service.price_grande) || 0,
        price_gigante: Number(service.price_gigante) || 0,
        icon: service.icon || 'pets',
        img: service.image_url || null,
        costs: service.costs || [],
        checklist: service.checklist || [],
        items_mini: service.items_mini || [],
        items_pequeno: service.items_pequeno || [],
        items_medio: service.items_medio || [],
        items_grande: service.items_grande || [],
        items_gigante: service.items_gigante || [],
        checkin_checklist: service.checkin_checklist || null,
        checkout_checklist: service.checkout_checklist || null,
        tenant_id: tenant?.id
      };

      const { data: result, error } = service.id && service.id !== 'undefined' && service.id !== 'null'
        ? await supabase.from('services').update(dbService).eq('id', service.id).select()
        : await supabase.from('services').insert([dbService]).select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!result || result.length === 0) {
        throw new Error('Permissão negada ou serviço não encontrado (RLS).');
      }

      showNotification(service.id ? 'Serviço atualizado!' : 'Serviço criado!', 'success');
      fetchServices();
      setIsModalOpen(false);
      setSelectedService(null);
    } catch (err: any) {
      console.error('Error saving service:', err);
      showNotification(`Erro ao salvar serviço: ${err.message || 'Erro desconhecido'}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remover este serviço do catálogo?')) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (!error) {
        showNotification('Serviço removido.', 'info');
        fetchServices();
      }
    }
  };

  const categories = ['TODOS', 'ESTÉTICA', 'SAÚDE ANIMAL', 'HOSPEDAGEM', 'OUTROS'];

  const filteredServices = useMemo(() => {
    if (activeTab === 'TODOS') return services;
    return services.filter(s => s.category.toUpperCase() === activeTab);
  }, [services, activeTab]);

  if (loading && services.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="paw-animation">
          {[1, 2, 3, 4].map(idx => (
            <span key={idx} className={`material-symbols-outlined text-primary paw-icon paw-${idx}`}>pets</span>
          ))}
          <p className="font-black text-primary uppercase italic text-xs tracking-widest ml-4">Carregando</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-6 lg:p-12 animate-in fade-in duration-700">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <ServiceForm initialData={selectedService || {}} onClose={() => setIsModalOpen(false)} onSave={handleSaveService} title={selectedService ? "Editar Serviço" : "Novo Serviço"} saveLabel="Salvar Serviço" />
        </div>
      )}

      <TemplateBuilderModal
        isOpen={isBuilderModalOpen}
        onClose={() => { setIsBuilderModalOpen(false); setEditingTemplate(null); }}
        onSave={handleSaveMainAdvancedTemplate}
        initialData={editingTemplate}
      />


      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none mb-4">Serviços</h1>
          <p className="text-white/40 font-bold uppercase text-xs tracking-widest max-w-sm">Gerencie o catálogo de serviços do seu pet shop com precisão e agilidade.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsBuilderModalOpen(true)} className="bg-white/10 text-white font-black text-xs uppercase tracking-widest h-14 px-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-all active:scale-95 flex items-center gap-3">
            <span className="material-symbols-outlined">dashboard_customize</span> Template Builder
          </button>
          <button onClick={() => { setSelectedService(null); setIsModalOpen(true); }} className="bg-primary text-white font-black text-xs uppercase tracking-widest h-14 px-10 rounded-2xl hover:bg-primary-hover shadow-2xl shadow-primary/40 transition-all active:scale-95 flex items-center gap-3">
            <span className="material-symbols-outlined font-black">add</span> ADICIONAR NOVO SERVIÇO
          </button>
        </div>
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Total de Serviços', value: services.length, badge: '+10%', icon: 'calendar_month', color: 'bg-primary' },
          { label: 'Serviços em Destaque', value: Math.ceil(services.length / 2), badge: 'Promo', icon: 'star', color: 'bg-amber-500' },
          { label: 'Serviços Personalizados', value: 8, badge: 'Solicitações', icon: 'construction', color: 'bg-emerald-500' }
        ].map((card, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-[40px] p-8 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">{card.label}</p>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black italic tracking-tighter">{card.value}</span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${card.color} text-white`}>{card.badge}</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Templates Section */}
      {mainAdvancedTemplates.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xs font-black uppercase text-white/40 tracking-widest mb-4">Templates de Checklist Salvos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainAdvancedTemplates.map(template => (
              <div key={template.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex justify-between items-center hover:border-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">checklist</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{template.name}</p>
                    <p className="text-xs text-white/40">{template.sections.length} seções • {template.sections.reduce((acc, s) => acc + s.fields.length, 0)} campos</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="w-9 h-9 rounded-lg bg-white/10 text-white/60 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                    title="Editar template"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAdvancedTemplate(template.id)}
                    className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                    title="Excluir template"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-4 rounded-[30px] border border-white/5 mb-8 gap-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar w-full md:w-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${activeTab === cat ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-white/40 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
        <button className="bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"><span className="material-symbols-outlined">tune</span></button>
      </div>

      {/* List Header */}
      <div className="bg-white/5 rounded-[40px] border border-white/5 overflow-hidden">
        <div className="grid grid-cols-12 p-8 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 items-center">
          <div className="col-span-4">Nome do Serviço</div>
          <div className="col-span-3">Breve Descrição</div>
          <div className="col-span-2 text-center">Preço Base</div>
          <div className="col-span-2 text-center">Duração Média</div>
          <div className="col-span-1 text-right">AÇÕES</div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-white/5">
          {filteredServices.map(service => (
            <div key={service.id} className="grid grid-cols-12 p-8 hover:bg-white/10 transition-all items-center group cursor-pointer" onClick={() => { setSelectedService(service); setIsModalOpen(true); }}>
              <div className="col-span-4 flex items-center gap-6">
                <div className="w-16 h-16 rounded-[22px] bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors border border-white/5 overflow-hidden">
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl">{service.icon}</span>
                  )}
                </div>
                <div>
                  <p className="text-xl font-black italic uppercase tracking-tight leading-none mb-1">{service.name}</p>
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-wider">Ref: {service.ref}</p>
                </div>
              </div>

              <div className="col-span-3 text-sm font-bold text-white/40 italic line-clamp-1 pr-6">
                {service.description || 'Nenhuma descrição disponível para este serviço.'}
              </div>

              <div className="col-span-2 text-center">
                <p className="text-2xl font-black italic tracking-tighter">R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="col-span-2 text-center flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary">schedule</span>
                <p className="text-sm font-black uppercase italic tracking-tighter">{service.duration} min</p>
              </div>

              <div className="col-span-1 flex justify-end gap-3" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setSelectedService(service); setIsModalOpen(true); }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"><span className="material-symbols-outlined text-lg">edit</span></button>
                <button onClick={() => handleDelete(service.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-white/20 gap-4">
              <span className="material-symbols-outlined text-8xl">content_paste_off</span>
              <p className="font-black uppercase tracking-widest text-sm">Nenhum serviço encontrado nesta categoria.</p>
            </div>
          )}
        </div>

        {/* Pagination/Status */}
        <div className="p-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
          <div>Mostrando {filteredServices.length} de {services.length}</div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center hover:text-white transition-all"><span className="material-symbols-outlined">chevron_left</span></button>
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40">1</div>
            <button className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center hover:text-white transition-all"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};