import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';

interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    type: 'product' | 'service';
    image_url: string;
    stock?: number;
}

interface Product {
    id: string;
    name: string;
    price: number;
    stock_quantity?: number;
    category: string;
    type: 'product' | 'service';
    image_url: string;
}

export const POS: React.FC<{ initialState?: any }> = ({ initialState }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<{ id: string, name: string }[]>([]);
    const [selectedClient, setSelectedClient] = useState<{ id: string, name: string } | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'cash' | 'pix'>('credit');
    const [discount, setDiscount] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
    const [customItem, setCustomItem] = useState({ name: '', price: '' });
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, svcRes, clientRes] = await Promise.all([
                supabase.from('inventory_items').select('*'),
                supabase.from('services').select('*'),
                supabase.from('clients').select('id, name').order('name')
            ]);

            // Debug: Log the data to see field names
            console.log('Inventory items sample:', invRes.data?.[0]);
            console.log('Services sample:', svcRes.data?.[0]);

            const allProducts: Product[] = [
                ...(invRes.data || []).map(p => ({
                    id: p.id,
                    name: p.name,
                    price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
                    stock_quantity: p.stock_quantity,
                    category: p.category || 'Produtos',
                    type: 'product' as const,
                    image_url: p.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=6366f1&color=fff&size=200`
                })),
                ...(svcRes.data || []).map(s => ({
                    id: s.id,
                    name: s.name,
                    // Use price_pequeno as default, fallback to price field
                    price: s.price_pequeno || (typeof s.price === 'number' ? s.price : parseFloat(s.price) || 0),
                    category: s.category || 'Serviços',
                    type: 'service' as const,
                    image_url: s.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=8b5cf6&color=fff&size=200`
                }))
            ];

            setProducts(allProducts);
            setClients(clientRes.data || []);
            if (clientRes.data?.length) setSelectedClient(clientRes.data[0]);
        } catch (error) {
            console.error('Error fetching POS data:', error);
            showNotification('Erro ao carregar dados do PDV', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (initialState && products.length > 0 && clients.length > 0) {
            console.log('Applying POS initial state:', initialState);

            // 1. Set Client
            if (initialState.client) {
                const client = clients.find(c => c.id === initialState.client.id) || initialState.client;
                setSelectedClient(client);
            }

            // 2. Add Item to Cart
            if (initialState.item) {
                const item = initialState.item;
                setCart(prev => {
                    const existing = prev.find(i => i.id === item.id);
                    if (existing) return prev; // Avoid duplicates
                    return [...prev, {
                        ...item,
                        qty: 1,
                        image_url: item.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=8b5cf6&color=fff&size=200`
                    }];
                });
            }
        }
    }, [initialState, products, clients]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1, image_url: product.image_url }];
        });
    };

    const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const total = Math.max(0, subtotal - discount);

    const handleCheckout = async () => {
        if (cart.length === 0) return showNotification('Carrinho vazio!', 'error');

        setLoading(true);
        try {
            // 1. Create Transaction
            const { data: tx, error: txErr } = await supabase
                .from('financial_transactions')
                .insert([{
                    type: 'income',
                    category: 'Venda PDV',
                    amount: total,
                    status: 'pago',
                    description: `Venda para ${selectedClient?.name || 'Consumidor'} - ${paymentMethod.toUpperCase()}`,
                    client_id: selectedClient?.id,
                    date: new Date().toISOString().split('T')[0]
                }])
                .select()
                .single();

            if (txErr) throw txErr;

            // 2. Update Inventory for products
            for (const item of cart) {
                if (item.type === 'product') {
                    // Add movement
                    await supabase.from('inventory_movements').insert([{
                        item_id: item.id,
                        type: 'out',
                        quantity: item.qty,
                        reason: `Venda PDV ID: ${tx.id}`
                    }]);

                    // Update stock (decrement)
                    const prod = products.find(p => p.id === item.id);
                    if (prod && prod.stock_quantity !== undefined) {
                        await supabase.from('inventory_items')
                            .update({ stock_quantity: prod.stock_quantity - item.qty })
                            .eq('id', item.id);
                    }
                }
            }

            setIsSuccess(true);
            setCart([]);
            setDiscount(0);
            showNotification('Venda concluída e registrada!', 'success');
            fetchData(); // Refresh stock
        } catch (err) {
            console.error(err);
            showNotification('Erro ao processar venda.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'Todos' ||
            (categoryFilter === 'Produtos' && p.type === 'product') ||
            (categoryFilter === 'Serviços' && p.type === 'service');
        return matchesSearch && matchesCategory;
    });

    if (isSuccess) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] h-full animate-in fade-in">
                <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-bounce">
                    <span className="material-symbols-outlined text-5xl">verified</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase italic">Venda Registrada</h1>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-8">Stock e Finanças atualizados em tempo real</p>
                <button onClick={() => setIsSuccess(false)} className="px-12 py-3 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all">Nova Venda</button>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-slate-50 dark:bg-[#111] overflow-hidden animate-in fade-in duration-500">
            {/* Catalog */}
            <div className="flex-1 flex flex-col border-r border-slate-100 dark:border-gray-800">
                <div className="p-8 bg-white dark:bg-[#1a1a1a] border-b border-slate-100 dark:border-gray-800 shrink-0">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-black italic uppercase text-slate-900 dark:text-white">PDV <span className="text-primary tracking-tighter">Live</span></h1>
                        <div className="flex gap-2">
                            {['Todos', 'Produtos', 'Serviços'].map(cat => (
                                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">search</span>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Busque itens..." className="w-full pl-16 pr-8 py-5 rounded-3xl border-none bg-slate-50 dark:bg-[#222] text-slate-900 dark:text-white placeholder:text-slate-300 font-bold text-lg shadow-inner focus:ring-2 focus:ring-primary/20" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 nike-scroll">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(p => (
                            <div key={p.id} onClick={() => addToCart(p)} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 hover:border-primary/30 transition-all cursor-pointer group hover:shadow-2xl hover:-translate-y-1">
                                <div className="aspect-square rounded-[2rem] bg-slate-50 dark:bg-white/5 mb-6 overflow-hidden relative flex items-center justify-center">
                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    {p.type === 'service' && <span className="absolute top-4 right-4 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg">Serviço</span>}
                                    {p.type === 'product' && <span className="absolute bottom-4 left-4 bg-white/80 dark:bg-black/60 px-2 py-1 rounded-lg text-[8px] font-black uppercase">{p.stock_quantity} em stock</span>}
                                </div>
                                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase italic mb-2 leading-tight truncate">{p.name}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic">R$ {p.price.toFixed(2)}</span>
                                    <div className="size-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Checkout Sidebar */}
            <div className="w-[450px] bg-white dark:bg-[#1a1a1a] flex flex-col shrink-0 border-l border-slate-100 dark:border-gray-800 shadow-2xl z-20">
                <div className="p-8 border-b border-slate-50 dark:border-gray-900 bg-slate-50/50 dark:bg-white/5">
                    <div className="relative">
                        <button onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#222] border-slate-200 dark:border-gray-700 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">person</span></div>
                                <p className="text-xs font-black uppercase italic text-slate-900 dark:text-white">{selectedClient?.name || 'Selecione o Cliente'}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">expand_more</span>
                        </button>
                        {isClientDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#222] rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 z-50 p-2">
                                {clients.map(c => (
                                    <button key={c.id} onClick={() => { setSelectedClient(c); setIsClientDropdownOpen(false); }} className="w-full text-left p-4 hover:bg-primary/5 rounded-xl text-xs font-bold uppercase transition-colors">{c.name}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 nike-scroll">
                    {cart.map(item => (
                        <div key={item.id} className="flex gap-6 mb-8 items-center animate-in slide-in-from-right-4">
                            <div className="size-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-gray-800 p-2"><img src={item.image_url} className="w-full h-full object-cover opacity-80" /></div>
                            <div className="flex-1">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase italic truncate">{item.name}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl">
                                        <button onClick={() => updateQty(item.id, -1)} className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-sm">remove</span></button>
                                        <span className="text-[10px] font-black dark:text-white">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-sm">add</span></button>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white italic">R$ {(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                    ))}
                    {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-300"><span className="material-symbols-outlined text-6xl opacity-20 mb-4">shopping_cart</span><p className="font-black uppercase text-[10px] tracking-widest">Carrinho Vazio</p></div>}
                </div>

                <div className="p-10 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-gray-900">
                    <div className="space-y-4 mb-10">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Investimento Final</span>
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">R$ {total.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {['credit', 'pix', 'cash', 'debit'].map(m => (
                                <button key={m} onClick={() => setPaymentMethod(m as any)} className={`py-4 rounded-2xl border transition-all text-[9px] font-black uppercase ${paymentMethod === m ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-white dark:bg-[#222] border-slate-100 dark:border-gray-800 text-slate-400'}`}>{m}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleCheckout} disabled={loading || cart.length === 0} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-16 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3">
                        {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <>PROCESSAR VENDA <span className="material-symbols-outlined">arrow_forward</span></>}
                    </button>
                </div>
            </div>
        </div>
    );
};