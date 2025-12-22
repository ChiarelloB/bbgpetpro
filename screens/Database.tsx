import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../NotificationContext';
import { useSecurity } from '../SecurityContext';
import { supabase } from '../src/lib/supabase';
import { BackupService } from '../utils/backupService';


interface DbRecord {
    id: string;
    type: 'client' | 'product' | 'service' | 'appointment' | 'pet' | 'team_member' | 'medical_record' | 'system_setting' | 'size_config' | 'financial_transaction' | 'supplier' | 'resource' | 'subscription' | 'chat' | 'marketing_campaign' | 'profile' | 'expense' | 'inventory_movement' | 'chat_message';
    name: string;
    detail: string;
    date: string;
    status: string;
    img?: string;
    email?: string;
    raw?: any;
}

const RecordEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    record: DbRecord | null;
    onSave: (id: string, table: string, data: any) => Promise<void>;
    onDelete: (id: string, table: string) => Promise<void>;
}> = ({ isOpen, onClose, record, onSave, onDelete }) => {
    const [editData, setEditData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (record) {
            setEditData({ ...record.raw });
        }
    }, [record]);

    if (!isOpen || !record || !editData) return null;

    const handleFieldChange = (key: string, value: any) => {
        setEditData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(record.id, tableName, editData);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir este registro permanentemente?')) {
            await onDelete(record.id, tableName);
            onClose();
        }
    };

    // Helper to translate table name to Supabase table
    const getTableName = (type: string) => {
        switch (type) {
            case 'product': return 'inventory_items';
            case 'financial_transaction': return 'financial_transactions';
            case 'medical_record': return 'medical_records';
            case 'size_config': return 'size_configs';
            case 'system_setting': return 'system_settings';
            case 'team_member': return 'team_members';
            case 'marketing_campaign': return 'marketing_campaigns';
            case 'expense': return 'expenses';
            case 'inventory_movement': return 'inventory_movements';
            case 'chat_message': return 'chat_messages';
            default: return type.endsWith('s') ? type : type + 's';
        }
    };

    const tableName = getTableName(record.type);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 border border-slate-200 dark:border-gray-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="font-black text-[10px] bg-primary text-white px-2 py-1 rounded-lg uppercase tracking-widest">{record.type}</span>
                        <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">Editor de Kernel</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-slate-50 dark:bg-[#0f0f0f]">
                    <div className="space-y-6">
                        {Object.keys(editData).map((key) => {
                            const value = editData[key];
                            const isId = key === 'id' || key === 'created_at';

                            return (
                                <div key={key} className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {key} {isId && '(Somente Leitura)'}
                                    </label>
                                    {typeof value === 'object' && value !== null ? (
                                        <textarea
                                            value={JSON.stringify(value, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    handleFieldChange(key, JSON.parse(e.target.value));
                                                } catch (err) { }
                                            }}
                                            className="w-full bg-slate-50 dark:bg-[#111] border-none rounded-xl px-4 py-3 text-xs font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                            rows={3}
                                            disabled={isId}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={value ?? ''}
                                            onChange={(e) => handleFieldChange(key, e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-[#111] border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                            disabled={isId}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] flex justify-between gap-3 shrink-0">
                    <button
                        onClick={handleDelete}
                        className="px-6 py-3 border border-rose-100 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                        Excluir Registro
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white">Cancelar</button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Matriz'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Database: React.FC = () => {
    const { showNotification } = useNotification();
    const { dbPassword, isDbUnlocked, setIsDbUnlocked } = useSecurity();

    const [records, setRecords] = useState<DbRecord[]>([]);
    const [images, setImages] = useState<{ name: string, url: string, size: number, created_at: string }[]>([]);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Geral');
    const [searchTerm, setSearchTerm] = useState('');
    const [password, setPassword] = useState('');
    const [shake, setShake] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<DbRecord | null>(null);
    const [selectedImage, setSelectedImage] = useState<{ name: string, url: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isDbUnlocked) fetchData();
    }, [isDbUnlocked, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let all: DbRecord[] = [];

            // Helper to fetch and map table data
            const getRecords = async (table: string, type: DbRecord['type'], limit: number = 200) => {
                try {
                    const query = supabase.from(table).select('*').limit(limit).order('created_at', { ascending: false });
                    const { data, error } = await query;

                    if (error || !data) return [];
                    return data.map((r: any) => {
                        let name = r.name || r.full_name || r.title || r.id || 'Sem nome';
                        let detail = r.email || r.category || r.status || r.type || 'Sem detalhes';

                        if (type === 'appointment') name = `Agendamento: ${r.service}`;
                        if (type === 'inventory_movement') name = `Mov: ${r.type} (${r.quantity} un)`;
                        if (type === 'chat_message') name = `Msg: ${r.text?.substring(0, 30)}...`;
                        if (type === 'financial_transaction') name = `${r.type === 'income' ? 'Receita' : 'Despesa'}: ${r.category}`;
                        if (type === 'expense') name = `Despesa: ${r.title}`;

                        return {
                            id: r.id || '',
                            type,
                            name,
                            detail,
                            date: (r.created_at || r.updated_at || r.date) ? new Date(r.created_at || r.updated_at || r.date).toLocaleString() : 'Data desconhecida',
                            status: r.status || 'active',
                            raw: r
                        };
                    });
                } catch (e) {
                    console.error(`Error fetching ${table}:`, e);
                    return [];
                }
            };

            if (activeTab === 'Geral') {
                const results = await Promise.all([
                    getRecords('clients', 'client', 10),
                    getRecords('pets', 'pet', 10),
                    getRecords('inventory_items', 'product', 10),
                    getRecords('services', 'service', 10),
                    getRecords('appointments', 'appointment', 10)
                ]);
                all = results.flat();
            } else if (activeTab === 'Clientes') {
                all = await getRecords('clients', 'client');
            } else if (activeTab === 'Pets') {
                all = await getRecords('pets', 'pet');
            } else if (activeTab === 'Estoque') {
                const results = await Promise.all([
                    getRecords('inventory_items', 'product'),
                    getRecords('inventory_movements', 'inventory_movement')
                ]);
                all = results.flat();
            } else if (activeTab === 'Serviços') {
                all = await getRecords('services', 'service');
            } else if (activeTab === 'Agenda') {
                all = await getRecords('appointments', 'appointment');
            } else if (activeTab === 'Equipe') {
                all = await getRecords('profiles', 'profile');
            } else if (activeTab === 'Médico') {
                all = await getRecords('medical_records', 'medical_record');
            } else if (activeTab === 'Financeiro') {
                const results = await Promise.all([
                    getRecords('financial_transactions', 'financial_transaction'),
                    getRecords('expenses', 'expense')
                ]);
                all = results.flat();
            } else if (activeTab === 'Logística') {
                const results = await Promise.all([
                    getRecords('suppliers', 'supplier'),
                    getRecords('resources', 'resource')
                ]);
                all = results.flat();
            } else if (activeTab === 'CRM') {
                const results = await Promise.all([
                    getRecords('subscriptions', 'subscription'),
                    getRecords('chats', 'chat'),
                    getRecords('chat_messages', 'chat_message')
                ]);
                all = results.flat();
            } else if (activeTab === 'Mkt') {
                all = await getRecords('marketing_campaigns', 'marketing_campaign');
            } else if (activeTab === 'Sistema') {
                const results = await Promise.all([
                    getRecords('system_settings', 'system_setting'),
                    getRecords('size_configs', 'size_config'),
                    getRecords('profiles', 'profile')
                ]);
                all = results.flat();
            } else if (activeTab === 'Fotos') {
                // Fetch images from Supabase Storage
                try {
                    const buckets = ['images', 'pets', 'products', 'services', 'avatars'];
                    const allImages: { name: string, url: string, size: number, created_at: string }[] = [];

                    for (const bucket of buckets) {
                        try {
                            const { data: files, error } = await supabase.storage
                                .from(bucket)
                                .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

                            if (!error && files) {
                                for (const file of files) {
                                    if (file.name && !file.name.startsWith('.')) {
                                        const { data: { publicUrl } } = supabase.storage
                                            .from(bucket)
                                            .getPublicUrl(file.name);
                                        allImages.push({
                                            name: `${bucket}/${file.name}`,
                                            url: publicUrl,
                                            size: file.metadata?.size || 0,
                                            created_at: file.created_at || ''
                                        });
                                    }
                                }
                                // Also check subfolders
                                const folders = files.filter(f => !f.metadata);
                                for (const folder of folders) {
                                    if (folder.name) {
                                        const { data: subFiles } = await supabase.storage
                                            .from(bucket)
                                            .list(folder.name, { limit: 50 });
                                        if (subFiles) {
                                            for (const subFile of subFiles) {
                                                if (subFile.name && subFile.metadata) {
                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from(bucket)
                                                        .getPublicUrl(`${folder.name}/${subFile.name}`);
                                                    allImages.push({
                                                        name: `${bucket}/${folder.name}/${subFile.name}`,
                                                        url: publicUrl,
                                                        size: subFile.metadata?.size || 0,
                                                        created_at: subFile.created_at || ''
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(`Bucket ${bucket} not found or inaccessible`);
                        }
                    }
                    setImages(allImages);
                } catch (err) {
                    console.error('Error fetching images:', err);
                }
            }

            setRecords(all);
        } catch (err) {
            console.error('Error fetching Data Core:', err);
            showNotification('Erro ao carregar dados do núcleo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRecord = async (id: string, table: string, data: any) => {
        const { error } = await supabase.from(table).update(data).eq('id', id);
        if (error) {
            showNotification(`Erro ao salvar: ${error.message}`, 'error');
            throw error;
        }
        showNotification('Registro sincronizado com sucesso!', 'success');
        fetchData();
    };

    const handleDeleteRecord = async (id: string, table: string) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) {
            showNotification(`Erro ao excluir: ${error.message}`, 'error');
            throw error;
        }
        showNotification('Registro removido da matriz.', 'info');
        fetchData();
    };

    const handleDeleteImage = async (imagePath: string, skipConfirm = false) => {
        if (!skipConfirm && !confirm('Tem certeza que deseja excluir esta imagem?')) return;

        setIsDeleting(true);
        const parts = imagePath.split('/');
        const bucket = parts[0];
        const filePath = parts.slice(1).join('/');

        console.log('Deleting image:', { bucket, filePath });

        const { error, data } = await supabase.storage.from(bucket).remove([filePath]);
        console.log('Delete result:', { error, data });

        if (error) {
            showNotification(`Erro ao excluir: ${error.message}`, 'error');
            setIsDeleting(false);
            return false;
        } else {
            setImages(prev => prev.filter(img => img.name !== imagePath));
            setSelectedImage(null);
            setSelectedImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(imagePath);
                return newSet;
            });
            setIsDeleting(false);
            return true;
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedImages.size === 0) return;
        if (!confirm(`Excluir ${selectedImages.size} imagem(ns) selecionada(s)?`)) return;

        setIsDeleting(true);
        let successCount = 0;
        let errorCount = 0;

        for (const imagePath of selectedImages) {
            const parts = imagePath.split('/');
            const bucket = parts[0];
            const filePath = parts.slice(1).join('/');

            const { error } = await supabase.storage.from(bucket).remove([filePath]);
            if (error) {
                console.error('Error deleting:', imagePath, error);
                errorCount++;
            } else {
                successCount++;
                setImages(prev => prev.filter(img => img.name !== imagePath));
            }
        }

        setSelectedImages(new Set());
        setIsDeleting(false);

        if (errorCount > 0) {
            showNotification(`${successCount} excluída(s), ${errorCount} erro(s)`, 'warning');
        } else {
            showNotification(`${successCount} imagem(ns) excluída(s)!`, 'success');
        }
    };

    const toggleImageSelection = (imagePath: string) => {
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imagePath)) {
                newSet.delete(imagePath);
            } else {
                newSet.add(imagePath);
            }
            return newSet;
        });
    };

    const selectAllImages = () => {
        const filteredImages = images.filter(img => img.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setSelectedImages(new Set(filteredImages.map(img => img.name)));
    };

    const clearSelection = () => {
        setSelectedImages(new Set());
    };

    useEffect(() => {
        if (isDbUnlocked) fetchData();
    }, [isDbUnlocked]);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        // Skip password check for demo or use provided one
        if (password === dbPassword || !dbPassword) {
            setIsDbUnlocked(true);
            showNotification('Base de dados desbloqueada.', 'success');
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            showNotification('Senha inválida.', 'error');
        }
    };

    const filtered = records.filter(r => {
        const matchesSearch = (r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.id?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTab = activeTab === 'Geral' ||
            (activeTab === 'Clientes' && r.type === 'client') ||
            (activeTab === 'Pets' && r.type === 'pet') ||
            (activeTab === 'Estoque' && (r.type === 'product' || r.type === 'inventory_movement')) ||
            (activeTab === 'Serviços' && r.type === 'service') ||
            (activeTab === 'Agenda' && r.type === 'appointment') ||
            (activeTab === 'Equipe' && r.type === 'team_member') ||
            (activeTab === 'Médico' && r.type === 'medical_record') ||
            (activeTab === 'Financeiro' && (r.type === 'financial_transaction' || r.type === 'expense')) ||
            (activeTab === 'Logística' && (r.type === 'supplier' || r.type === 'resource')) ||
            (activeTab === 'CRM' && (r.type === 'subscription' || r.type === 'chat' || r.type === 'chat_message')) ||
            (activeTab === 'Mkt' && r.type === 'marketing_campaign') ||
            (activeTab === 'Sistema' && (r.type === 'system_setting' || r.type === 'size_config' || r.type === 'profile'));
        return matchesSearch && matchesTab;
    });

    if (!isDbUnlocked) {
        return (
            <div className="flex-1 flex flex-col h-full items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                <div className={`w-full max-w-md bg-white dark:bg-[#111] rounded-[3rem] shadow-2xl border border-slate-100 dark:border-gray-800 p-12 text-center transition-transform relative z-10 ${shake ? 'animate-shake' : ''}`}>
                    <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-100 dark:border-rose-900/30">
                        <span className="material-symbols-outlined text-5xl text-rose-500">lock</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic leading-none">Database <span className="text-rose-500">Lock</span></h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Acesso Restrito ao Núcleo de Dados</p>
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha Mestra" className="w-full h-14 bg-slate-50 dark:bg-[#1a1a1a] border-none rounded-2xl px-6 text-center text-lg font-black tracking-widest text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300" />
                        <button type="submit" className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-primary hover:text-white shadow-2xl transition-all active:scale-95">Desbloquear Kernel</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden animate-in fade-in duration-500">
            <RecordEditModal
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
                onSave={handleSaveRecord}
                onDelete={handleDeleteRecord}
            />

            <header className="p-10 border-b border-slate-100 dark:border-gray-900 bg-white dark:bg-[#111] flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-slate-900 dark:text-white">Data <span className="text-primary tracking-tight">Core</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Exploração Profunda de Estruturas Cloud</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchData} className="px-6 py-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary rounded-2xl flex items-center gap-2 transition-all"><span className={`${loading ? 'animate-spin' : ''} material-symbols-outlined text-lg`}>refresh</span></button>

                    <button
                        onClick={() => document.getElementById('import-input')?.click()}
                        className="bg-primary/10 text-primary h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">upload</span> Import Restore
                    </button>
                    <input
                        type="file"
                        id="import-input"
                        accept=".json"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (!confirm('ATENÇÃO: A importação irá SOBRESCREVER dados existentes com o mesmo ID. Deseja continuar?')) {
                                e.target.value = '';
                                return;
                            }

                            const reader = new FileReader();
                            reader.onload = async (event) => {
                                try {
                                    const json = JSON.parse(event.target?.result as string);
                                    setLoading(true);
                                    showNotification('Iniciando restauração...', 'info');

                                    await BackupService.importData(json, (msg) => console.log(msg));

                                    showNotification('Backup restaurado com sucesso!', 'success');
                                    fetchData();
                                } catch (err: any) {
                                    console.error(err);
                                    showNotification(`Erro na importação: ${err.message}`, 'error');
                                } finally {
                                    setLoading(false);
                                    if (e.target) e.target.value = '';
                                }
                            };
                            reader.readAsText(file);
                        }}
                    />

                    <button
                        onClick={async () => {
                            try {
                                showNotification('Gerando backup...', 'info');
                                await BackupService.downloadBackup();
                                showNotification('Exportação concluída!', 'success');
                            } catch (err: any) {
                                showNotification(`Erro na exportação: ${err.message}`, 'error');
                            }
                        }}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">download</span> Full Export
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto nike-scroll p-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8 items-end mb-10">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">manage_search</span>
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Busque por ID ou Identificador..." className="w-full h-16 bg-white dark:bg-[#111] border-none rounded-[2rem] px-16 text-lg font-bold text-slate-900 dark:text-white shadow-xl focus:ring-4 focus:ring-primary/5 placeholder:text-slate-200" />
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {['Geral', 'Clientes', 'Pets', 'Estoque', 'Serviços', 'Agenda', 'Equipe', 'Médico', 'Financeiro', 'Logística', 'CRM', 'Mkt', 'Sistema', 'Fotos'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-[#111] text-slate-400 border border-slate-100 dark:border-gray-800'}`}>
                                    {tab === 'Fotos' && <span className="material-symbols-outlined text-sm mr-1 align-middle">photo_library</span>}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-[3rem] border border-slate-100 dark:border-gray-800 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-gray-800">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID Sincronizado</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Destaque</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Metadata</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-gray-900">
                                    {filtered.map(r => (
                                        <tr key={r.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                            <td className="px-8 py-6">
                                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded italic">#{String(r.id || '').substring(0, 13)}...</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-lg">description</span></div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[200px]">{r.name}</p>
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{r.type}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[11px] font-bold text-slate-500 italic">"{r.detail}"</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic">{r.date}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => setSelectedRecord(r)} className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/10 transition-all"><span className="material-symbols-outlined text-lg font-black">edit_square</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Images Gallery for Fotos tab */}
                    {activeTab === 'Fotos' && (
                        <>
                            {/* Image Preview Modal */}
                            {selectedImage && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedImage(null)} />
                                    <div className="relative z-10 bg-white dark:bg-[#111] rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic">{selectedImage.name.split('/').pop()}</h3>
                                                <p className="text-xs text-slate-400">{selectedImage.name}</p>
                                            </div>
                                            <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-white">
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                        <img src={selectedImage.url} alt={selectedImage.name} className="w-full rounded-2xl mb-4" />
                                        <div className="flex gap-3">
                                            <a href={selectedImage.url} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase hover:bg-primary-hover transition-colors">
                                                <span className="material-symbols-outlined">open_in_new</span> Abrir Original
                                            </a>
                                            <button onClick={() => handleDeleteImage(selectedImage.name)} className="h-12 px-6 bg-rose-500 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase hover:bg-rose-600 transition-colors">
                                                <span className="material-symbols-outlined">delete</span> Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-[#111] rounded-[3rem] border border-slate-100 dark:border-gray-800 shadow-xl p-8 mt-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">
                                        <span className="material-symbols-outlined text-primary align-middle mr-2">photo_library</span>
                                        Galeria de Imagens ({images.length})
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedImages.size > 0 && (
                                            <>
                                                <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                                                    {selectedImages.size} selecionada(s)
                                                </span>
                                                <button onClick={clearSelection} className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-sm font-bold text-slate-500 hover:text-primary flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">close</span> Limpar
                                                </button>
                                                <button
                                                    onClick={handleDeleteSelected}
                                                    disabled={isDeleting}
                                                    className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-rose-600 disabled:opacity-50"
                                                >
                                                    {isDeleting ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    )}
                                                    Excluir Selecionadas
                                                </button>
                                            </>
                                        )}
                                        <button onClick={selectAllImages} className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-sm font-bold text-slate-500 hover:text-primary flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">select_all</span> Selecionar Todas
                                        </button>
                                        <button onClick={fetchData} className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-sm font-bold text-slate-500 hover:text-primary flex items-center gap-2">
                                            <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span> Atualizar
                                        </button>
                                    </div>
                                </div>

                                {images.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-gray-700 mb-4">photo_library</span>
                                        <p className="text-slate-400 font-bold">Nenhuma imagem encontrada no storage.</p>
                                        <p className="text-slate-300 text-sm">As imagens enviadas pelo sistema aparecerão aqui.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {images.filter(img => img.name.toLowerCase().includes(searchTerm.toLowerCase())).map((img, idx) => (
                                            <div
                                                key={idx}
                                                className={`group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 cursor-pointer transition-all ${selectedImages.has(img.name) ? 'ring-4 ring-primary shadow-lg scale-[0.98]' : 'hover:ring-4 hover:ring-primary/30'}`}
                                                onClick={() => setSelectedImage(img)}
                                            >
                                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Error'; }} />

                                                {/* Selection checkbox */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleImageSelection(img.name); }}
                                                    className={`absolute top-2 left-2 size-7 rounded-lg flex items-center justify-center transition-all ${selectedImages.has(img.name) ? 'bg-primary text-white' : 'bg-white/80 dark:bg-black/60 text-slate-400 opacity-0 group-hover:opacity-100'}`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {selectedImages.has(img.name) ? 'check_box' : 'check_box_outline_blank'}
                                                    </span>
                                                </button>

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                                        <p className="text-white text-xs font-bold truncate">{img.name.split('/').pop()}</p>
                                                        <p className="text-white/60 text-[10px]">{img.name.split('/')[0]}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.name); }}
                                                    className="absolute top-2 right-2 size-8 bg-rose-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};
