import { supabase } from '../src/lib/supabase';

// Define the order of tables for import to respect foreign keys
// Tenants first, then independent tables, then dependent ones
const TABLES = [
    'tenants',
    'profiles', // Users/Team
    'clients',
    'services',
    'inventory_items', // Products
    'suppliers',
    'resources',
    'system_settings',
    'size_configs',
    'pets', // Depends on clients
    'marketing_campaigns',
    'subscriptions', // Depends on clients
    'chats', // Depends on clients/profiles
    'chat_messages', // Depends on chats
    'appointments', // Depends on pets, services, profiles
    'medical_records', // Depends on pets, appointments
    'inventory_movements', // Depends on inventory_items
    'financial_transactions',
    'expenses'
];

export interface BackupData {
    version: string;
    timestamp: string;
    data: {
        [table: string]: any[];
    };
}

export const BackupService = {
    /**
     * Exports all data from the defined tables to a JSON object.
     */
    exportData: async (): Promise<BackupData> => {
        const backup: BackupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {}
        };

        for (const table of TABLES) {
            try {
                // Fetch all data for the table
                // Basic pagination handling might be needed for very large datasets, 
                // but for now we fetch up to 10000 rows which covers typical SMB usage.
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(10000);

                if (error) {
                    console.error(`Error exporting table ${table}:`, error);
                    throw new Error(`Falha ao exportar tabela ${table}: ${error.message}`);
                }

                backup.data[table] = data || [];
            } catch (error) {
                console.error(`Unexpected error exporting ${table}:`, error);
                // Continue or throw? Let's throw to ensure integrity
                throw error;
            }
        }

        return backup;
    },

    /**
     * Imports data from a backup object.
     * Uses upsert to either insert new records or update existing ones.
     */
    importData: async (backup: BackupData, onProgress?: (message: string) => void): Promise<void> => {
        if (!backup.data) {
            throw new Error('Arquivo de backup inválido: dados ausentes.');
        }

        // Iterate through tables in the defined order
        for (const table of TABLES) {
            const rows = backup.data[table];
            if (rows && rows.length > 0) {
                if (onProgress) onProgress(`Restaurando ${table} (${rows.length} registros)...`);

                // Process in chunks to avoid payload limits
                const chunkSize = 100;
                for (let i = 0; i < rows.length; i += chunkSize) {
                    const chunk = rows.slice(i, i + chunkSize);

                    const { error } = await supabase
                        .from(table)
                        .upsert(chunk, { onConflict: 'id' }); // Assuming 'id' is always the PK

                    if (error) {
                        console.error(`Error importing ${table} chunk ${i}:`, error);
                        // We might want to continue best-effort or fail hard.
                        // For backup restore, maybe fail hard is safer to avoid partial inconsistent state?
                        // But sometimes FK issues might block one row, we don't want to abort everything.
                        // Let's log and continue, but throw at the end if strictness is required.
                        throw new Error(`Erro ao importar ${table}: ${error.message}`);
                    }
                }
            }
        }

        if (onProgress) onProgress('Restauração concluída!');
    },

    /**
     * Triggers a browser download for the backup JSON.
     */
    downloadBackup: async () => {
        const data = await BackupService.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `flowpet_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
