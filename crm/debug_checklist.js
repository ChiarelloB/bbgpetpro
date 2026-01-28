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

async function testFinal() {
    console.log('--- DB Schema Debug ---');
    console.log('Project URL:', supabaseUrl);

    // 1. Insert and Select
    const mockTenantId = 'b6507b1b-0c93-4220-a152-bb71f141bc43';
    console.log('Inserting test row into size_configs...');

    const { data: insData, error: insError } = await supabase
        .from('size_configs')
        .insert([{
            category: 'test_cat',
            label: 'Test Label',
            max_weight: 10,
            tenant_id: mockTenantId
        }])
        .select();

    if (insError) {
        console.error('Insert FAILED!');
        console.error('Message:', insError.message);
        console.error('Details:', insError.details);
    } else {
        console.log('Insert SUCCESSFUL.');
        console.log('Inserted Data:', insData[0]);
    }

    // 2. Test appointments checklist_data
    console.log('\nChecking appointments checklist_data column...');
    const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .select('id, checklist_data')
        .limit(1);

    if (apptError) {
        console.error('appointments.checklist_data check FAILED!');
        console.error('Message:', apptError.message);
    } else {
        console.log('appointments.checklist_data check PASSED.');
    }
}

testFinal();
