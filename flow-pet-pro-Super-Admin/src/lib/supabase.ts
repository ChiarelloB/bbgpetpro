import { createClient } from '@supabase/supabase-js'

console.log('SUPABASE: Initializing client with Legacy Anon Key...');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljtxdwishwopggrrxada.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHhkd2lzaHdvcGdncnJ4YWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNzczMjEsImV4cCI6MjA4MTc1MzMyMX0.pduBz4dZmR2QjEPLq-bUFE1KwqkWSyalLCLYS8Xmg6w'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Using default Supabase credentials in Super Admin. Please check your .env file for production use.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
