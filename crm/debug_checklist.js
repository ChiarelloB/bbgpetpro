import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually since we might not have dotenv
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalAudit() {
    console.log('--- DB Schema AUDIT (Detailed) ---');
    console.log('Project:', supabaseUrl);

    // 1. Check all plans
    console.log('Fetching all subscription_plans...');
    const { data: subPlans, error: subErr } = await supabase
        .from('subscription_plans')
        .select('id, name');

    if (subErr) {
        console.error('subscription_plans check FAILED:', subErr.message);
    } else {
        console.log('Plan Names:', subPlans.map(p => p.name).join(', '));
        console.log('Total Plans:', subPlans.length);
    }

    // 2. Check current user's profile and tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        console.log('\nChecking profile for user:', user.email);
        const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('id, email, tenant_id')
            .eq('id', user.id)
            .single();

        if (profErr) {
            console.error('Profile fetch FAILED:', profErr.message);
        } else {
            console.log('User Profile tenant_id:', profile.tenant_id);
        }
    }
}

finalAudit();
