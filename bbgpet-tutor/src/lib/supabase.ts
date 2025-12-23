import { createClient } from '@supabase/supabase-js'

// Using same env as CRM for now (assuming identical backend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pndkdyogxosmbatqlyas.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
