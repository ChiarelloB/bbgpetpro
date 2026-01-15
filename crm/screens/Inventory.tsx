import React, { useState, useEffect } from 'react';
import { useNotification } from '../NotificationContext';
import { getGeminiModel } from '../src/lib/gemini';
import { supabase } from '../src/lib/supabase';
import { useSecurity } from '../SecurityContext';

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: 'normal' | 'low' | 'out';
  sku: string;
  validity: string;
  img: string;
  barcode: string;
  unit_type: string;
  supplier: { name: string; type: string; lastBuy: string };
  movements: { type: 'in' | 'out'; qty: number; date: string; desc: string }[];
}

const UNIT_TYPES = [
  { value: 'unidades', label: 'Unidades' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'litros', label: 'Litros' },
  { value: 'gramas', label: 'Gramas (g)' },
  { value: 'kg', label: 'Quilogramas (kg)' },
];


// --- Product Modal (Create & Edit) ---
const ProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (p: any) => void;
  initialData?: Product;
  title: string;
  saveLabel: string;
}> = ({ isOpen, onClose, onSave, initialData, title, saveLabel }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '', category: 'Rações', price: '', stock: 10, sku: '', img: '', unit_type: 'unidades'
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        price: initialData.price.replace('R$ ', '').replace(',', '.'),
        stock: initialData.stock,
        sku: initialData.sku,
        img: initialData.img || '',
        unit_type: initialData.unit_type || 'unidades'
      });
    } else {
      setFormData({ name: '', category: 'Rações', price: '', stock: 10, sku: '', img: '', unit_type: 'unidades' });
    }

  }, [initialData, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `products/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('pets').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('pets').getPublicUrl(fileName);
      setFormData({ ...formData, img: data.publicUrl });
      showNotification('Foto carregada!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Erro ao fazer upload da foto', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (!initialData) setFormData({ name: '', category: 'Rações', price: '', stock: 10, sku: '', img: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Foto do Produto</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 border-2 border-dashed border-slate-300 dark:border-gray-600">
                {formData.img ? (
                  <img src={formData.img} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">image</span>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="productImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('productImage')?.click()}
                  disabled={uploadingImage}
                  className="w-full px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  {formData.img ? 'Alterar Foto' : 'Adicionar Foto'}
                </button>
                {formData.img && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, img: '' })}
                    className="w-full mt-2 px-4 py-2 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                  >
                    Remover Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="Ex: Coleira Verde" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Categoria</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm">
                <option>Rações</option>
                <option>Brinquedos</option>
                <option>Higiene</option>
                <option>Acessórios</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Preço</label>
              <input type="text" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="45.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">SKU</label>
              <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" placeholder="REF-000" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Estoque</label>
              <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipo de Unidade</label>
            <select value={formData.unit_type} onChange={e => setFormData({ ...formData, unit_type: e.target.value })} className="w-full rounded-xl border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white text-sm">
              {UNIT_TYPES.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg">{saveLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas Categorias');
  const [moveQty, setMoveQty] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisContent, setAnalysisContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { showNotification } = useNotification();
  const { tenant } = useSecurity();

  const fetchProducts = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, inventory_movements(*)')
      .eq('tenant_id', tenant.id);

    if (error) {
      console.error('Error fetching inventory:', error);
      showNotification('Erro ao carregar inventário', 'error');
    } else {
      const mapped = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || 'Geral',
        price: `R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        stock: item.stock_quantity,
        status: item.stock_quantity === 0 ? 'out' : item.stock_quantity <= item.min_stock ? 'low' : 'normal',
        sku: (item as any).sku || 'N/A',
        validity: (item as any).validity || '-',
        img: item.img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvyHcgiB1pX8YR7CDk85jEQ4Scc68dpwnL57OG4DqD0zDZJ-ayYLLPSzU4xJyFhhi9vcrzWC14CyH1WrS_IrLlPqnJZcpsr7OrqIwiE81MiVq4pTdKg2b72mg3Jk4pcSTx-fqlBtwgD0yVWOV8CI4nBWiRl3yW5e6StmHkPasENoR7zCZ_H5dmnys_egKQgrPDR1L8lCzId89YeXfaA9ppAjXQh8FV1Ra96Ijio0-zChWqLJeB72RfhYI917eIeDamjBl4JU5J4QQ',
        barcode: (item as any).barcode || '-',
        unit_type: (item as any).unit_type || 'unidades',
        supplier: { name: 'Fornecedor', type: 'F', lastBuy: '-' },
        movements: (item.inventory_movements || []).map((m: any) => ({
          type: m.type,
          qty: m.quantity,
          date: new Date(m.created_at).toLocaleString('pt-BR'),
          desc: m.reason || 'Movimentação'
        })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));

      setProducts(mapped);
      if (mapped.length > 0 && !selectedProductId) {
        setSelectedProductId(mapped[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleAddProduct = async (data: any) => {
    const { data: itemData, error } = await supabase
      .from('inventory_items')
      .insert([{
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        stock_quantity: data.stock,
        min_stock: 5,
        img: data.img || null,
        unit_type: data.unit_type || 'unidades',
        sku: data.sku,
        tenant_id: tenant?.id
      }])
      .select();


    if (error) {
      console.error('Error adding product:', error);
      showNotification('Erro ao cadastrar produto', 'error');
    } else {
      await supabase.from('inventory_movements').insert([{
        item_id: itemData[0].id,
        type: 'in',
        quantity: data.stock,
        reason: 'Estoque Inicial',
        tenant_id: tenant?.id
      }]);
      fetchProducts();
      showNotification('Produto cadastrado com sucesso!', 'success');
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!selectedProductId) return;
    const { error } = await supabase
      .from('inventory_items')
      .update({
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        stock_quantity: data.stock,
        img: data.img || null,
        unit_type: data.unit_type || 'unidades',
        sku: data.sku
      })
      .eq('id', selectedProductId);


    if (error) {
      console.error('Error updating product:', error);
      showNotification('Erro ao atualizar produto', 'error');
    } else {
      fetchProducts();
      showNotification('Produto atualizado!', 'success');
    }
  };

  const handleStockUpdate = async (type: 'in' | 'out') => {
    if (!selectedProduct) return;
    const qty = parseInt(moveQty);
    if (!qty || qty <= 0) {
      showNotification('Insira uma quantidade válida', 'error');
      return;
    }

    const { error: moveError } = await supabase
      .from('inventory_movements')
      .insert([{
        item_id: selectedProduct.id,
        type,
        quantity: qty,
        reason: 'Ajuste Manual',
        tenant_id: tenant?.id
      }]);

    if (moveError) {
      console.error('Error recording movement:', moveError);
      showNotification('Erro ao registrar movimentação', 'error');
      return;
    }

    const newStock = type === 'in' ? selectedProduct.stock + qty : Math.max(0, selectedProduct.stock - qty);

    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ stock_quantity: newStock })
      .eq('id', selectedProduct.id);

    if (updateError) {
      console.error('Error updating stock count:', updateError);
    } else {
      fetchProducts();
      const action = type === 'in' ? 'adicionadas ao' : 'removidas do';
      showNotification(`${qty} unidades ${action} estoque.`, 'success');
      setMoveQty('');
    }
  };

  const handleAnalyzeInventory = async () => {
    setIsAnalysisOpen(true);
    setAnalysisContent('');
    setIsAnalyzing(true);

    try {
      const model = getGeminiModel();
      const prompt = `
            Você é um gerente de estoque especialista. Analise a seguinte lista de produtos:
            ${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, status: p.status, price: p.price })))}
            
            Crie um relatório curto em Markdown que:
            1. Identifique os itens críticos (estoque baixo ou zerado).
            2. Sugira uma lista de compra prioritária.
            3. Aponte possíveis excessos de estoque (se houver).
            4. Dê uma dica geral de gestão para este mix de produtos.
        `;

      const result = await model.generateContent(prompt);
      const response = result.response;

      setAnalysisContent(response.text() || "Sem análise disponível.");
    } catch (error) {
      console.error(error);
      setAnalysisContent("Erro ao gerar análise de estoque.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas Categorias' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading && products.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#111]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto animate-in fade-in duration-500">
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProduct}
        title="Novo Produto"
        saveLabel="Cadastrar"
      />

      {selectedProduct && (
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateProduct}
          initialData={selectedProduct}
          title="Editar Produto"
          saveLabel="Atualizar"
        />
      )}

      {/* AI Analysis Modal */}
      {isAnalysisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAnalysisOpen(false)}></div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-100 dark:border-gray-800 flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#222]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase italic text-slate-900 dark:text-white leading-none">Insights de Estoque</h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">Análise preditiva de reposição</p>
                </div>
              </div>
              <button onClick={() => setIsAnalysisOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg mb-2">Analisando níveis de estoque...</p>
                  <p className="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto">Calculando giro de produtos e prioridades de compra.</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-gray-300 leading-relaxed">
                    {analysisContent}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222] flex justify-end gap-3">
              <button
                onClick={() => setIsAnalysisOpen(false)}
                className="px-6 py-2.5 rounded-lg text-slate-500 font-bold text-sm hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                Fechar
              </button>
              <button
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                onClick={() => showNotification('Pedido de compra rascunhado.', 'success')}
              >
                <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span> Gerar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 mb-2">
            <span className="hover:text-primary cursor-pointer">CRM</span>
            <span>/</span>
            <span className="text-primary font-bold">Inventário Detalhado</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gerenciamento de Estoque</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Controle total de entradas, saídas e análise de produtos.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAnalyzeInventory}
            className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-blue-600 dark:text-blue-400 font-bold h-12 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span> Insights IA
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/30 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined">add</span> Novo Produto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Valor em Estoque', value: 'R$ 0', icon: 'attach_money', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' },
          { label: 'Produtos Totais', value: products.length.toString(), icon: 'inventory_2', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Estoque Baixo', value: `${products.filter(p => p.status === 'low').length} itens`, icon: 'warning', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20', border: 'border-l-4 border-l-orange-500' },
          { label: 'A Receber', value: '0 Pedidos', icon: 'local_shipping', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-[#1a1a1a] rounded-xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm flex items-center justify-between ${stat.border || ''}`}>
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column: Filters & Table */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Tabs Row */}
          <div className="flex gap-6 border-b border-slate-200 dark:border-gray-800 w-full overflow-x-auto no-scrollbar">
            {['Todas Categorias', 'Rações', 'Brinquedos', 'Higiene', 'Acessórios'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`pb-3 border-b-4 font-bold text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${categoryFilter === cat
                  ? 'border-primary text-black dark:text-white'
                  : 'border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full md:w-auto">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-slate-50 dark:bg-[#111] text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-shadow outline-none"
                placeholder="Buscar por nome, SKU..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-[#111] border-b border-slate-200 dark:border-gray-800">
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Produto</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Categoria</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 text-center">Qtd.</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
                  {filteredProducts.map(product => (
                    <tr
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`cursor-pointer transition-colors ${selectedProductId === product.id ? 'bg-purple-50 dark:bg-purple-900/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-white/5 border-l-4 border-l-transparent hover:border-l-slate-300 dark:hover:border-l-gray-600'}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-white dark:bg-[#222] flex-shrink-0 overflow-hidden border border-slate-200 dark:border-gray-700">
                            <img src={product.img} alt={product.name} className={`h-full w-full object-cover ${product.status === 'out' ? 'opacity-50 grayscale' : ''}`} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</p>
                            <p className="text-xs text-slate-500 dark:text-gray-400">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-gray-400">{product.category}</td>
                      <td className={`py-3 px-4 text-center font-bold ${product.status === 'out' ? 'text-slate-400' : product.status === 'low' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>{product.stock} <span className="text-xs font-normal text-slate-400">{product.unit_type}</span></td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${product.status === 'normal' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                          product.status === 'low' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400' :
                            'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300'
                          }`}>
                          {product.status === 'normal' ? 'Normal' : product.status === 'low' ? 'Baixo' : 'Esgotado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-gray-400 text-sm">Nenhum produto encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="xl:col-span-1 xl:sticky xl:top-6">
          {selectedProduct ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-gray-800 shadow-lg overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300" key={selectedProduct.id}>
              {/* Detail Header */}
              <div className="p-5 border-b border-slate-200 dark:border-gray-800 flex justify-between items-start bg-slate-50 dark:bg-[#111]">
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-lg bg-white dark:bg-[#222] p-1 border border-slate-200 dark:border-gray-700 shadow-sm flex-shrink-0">
                    <img src={selectedProduct.img} alt={selectedProduct.name} className="h-full w-full object-cover rounded" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-gray-400">{selectedProduct.sku}</span>
                    </div>
                    <div className="mt-2 text-primary font-bold">{selectedProduct.price}</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"
                  title="Editar Produto"
                >
                  <span className="material-symbols-outlined">edit_square</span>
                </button>
              </div>

              {/* Detail Body */}
              <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar">
                {/* Quick Stock Action */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-2">Movimentação Rápida</label>
                  <div className="bg-slate-50 dark:bg-[#111] p-4 rounded-xl border border-dashed border-slate-300 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Estoque Atual:</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{selectedProduct.stock} <span className="text-xs font-normal text-slate-400">{selectedProduct.unit_type}</span></span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={moveQty}
                        onChange={(e) => setMoveQty(e.target.value)}
                        className="w-full text-center rounded-lg border-slate-200 dark:border-gray-700 bg-white dark:bg-[#252525] dark:text-white focus:ring-primary focus:border-primary outline-none"
                      />
                      <button
                        onClick={() => handleStockUpdate('in')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg px-3 py-2 flex items-center justify-center transition-colors shadow-sm"
                        title="Registrar Entrada"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                      <button
                        onClick={() => handleStockUpdate('out')}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg px-3 py-2 flex items-center justify-center transition-colors shadow-sm"
                        title="Registrar Saída"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Movements */}
                <div>
                  <p className="text-[10px] uppercase text-slate-500 dark:text-gray-400 font-bold mb-2">Movimentações Recentes</p>
                  <div className="space-y-3">
                    {selectedProduct.movements.length > 0 ? selectedProduct.movements.map((mov, idx) => (
                      <div key={idx} className="flex gap-3 text-sm animate-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full ${mov.type === 'in' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div className="w-0.5 h-full bg-slate-100 dark:bg-gray-800 my-0.5"></div>
                        </div>
                        <div className="pb-2">
                          <p className="text-slate-900 dark:text-white font-medium text-xs">{mov.type === 'in' ? 'Entrada' : 'Saída'}: {mov.qty} unidades</p>
                          <p className="text-slate-500 dark:text-gray-400 text-[10px]">{mov.date} - {mov.desc}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 italic">Sem movimentações recentes.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-[#1a1a1a] rounded-xl border border-dashed border-slate-300">
              <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
              <p className="font-bold italic">Selecione um produto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};