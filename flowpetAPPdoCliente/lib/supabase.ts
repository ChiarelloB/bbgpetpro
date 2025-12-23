import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljtxdwishwopggrrxada.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZgAncoSVPMe1Gk0Aoc8Biw_VkfL8uZL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
