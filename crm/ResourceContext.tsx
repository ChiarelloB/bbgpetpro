import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';

export interface Resource {
  id: string;
  name: string;
  type: string;
  staff: string | null;
  avatar: string | null;
  utilization: number;
  color: string;
}

export interface SizeConfig {
  id: string;
  label: string;
  maxWeight: number;
}

interface ResourceContextType {
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id'>) => Promise<void>;
  updateResource: (id: string, updated: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  // Size Config
  sizeSettings: SizeConfig[];
  updateSizeSettings: (newSettings: SizeConfig[]) => Promise<void>;
  calculateSize: (weight: number) => string;
  loading: boolean;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const ResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [sizeSettings, setSizeSettings] = useState<SizeConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching resources:', error);
    } else {
      setResources(data || []);
    }
  };

  const fetchSizeSettings = async () => {
    const { data, error } = await supabase.from('size_configs').select('*');
    if (error) {
      console.error('Error fetching size settings:', error);
    } else {
      const mapped: SizeConfig[] = (data || []).map(s => ({
        id: s.category, // using category as id for compatibility
        label: s.label,
        maxWeight: Number(s.max_weight)
      }));
      // Sort by maxWeight to ensure calculateSize logic works
      setSizeSettings(mapped.sort((a, b) => a.maxWeight - b.maxWeight));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchResources(), fetchSizeSettings()]);
      setLoading(false);
    };
    init();
  }, []);

  const addResource = async (resource: Omit<Resource, 'id'>) => {
    const { data, error } = await supabase.from('resources').insert([resource]).select();
    if (error) {
      console.error('Error adding resource:', error);
    } else if (data) {
      setResources(prev => [...prev, data[0]]);
    }
  };

  const updateResource = async (id: string, updated: Partial<Resource>) => {
    const { error } = await supabase.from('resources').update(updated).eq('id', id);
    if (error) {
      console.error('Error updating resource:', error);
    } else {
      setResources(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    }
  };

  const deleteResource = async (id: string) => {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) {
      console.error('Error deleting resource:', error);
    } else {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const updateSizeSettings = async (newSettings: SizeConfig[]) => {
    for (const setting of newSettings) {
      const { error } = await supabase.from('size_configs').upsert({
        category: setting.id,
        label: setting.label,
        max_weight: setting.maxWeight
      }, { onConflict: 'category' });
      if (error) console.error('Error upserting size config:', error);
    }
    setSizeSettings(newSettings.sort((a, b) => a.maxWeight - b.maxWeight));
  };

  const calculateSize = (weight: number): string => {
    if (sizeSettings.length === 0) return 'Desconhecido';

    // Assumes sizeSettings is sorted by maxWeight
    for (const config of sizeSettings) {
      if (weight <= config.maxWeight) return config.label;
    }
    return sizeSettings[sizeSettings.length - 1].label;
  };

  return (
    <ResourceContext.Provider value={{
      resources, addResource, updateResource, deleteResource,
      sizeSettings, updateSizeSettings, calculateSize, loading
    }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};
