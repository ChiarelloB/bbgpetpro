import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljtxdwishwopggrrxada.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZgAncoSVPMe1Gk0Aoc8Biw_VkfL8uZL'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Using default Supabase credentials in Super Admin. Please check your .env file for production use.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
