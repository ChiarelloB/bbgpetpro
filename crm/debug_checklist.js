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

async function testUpdate() {
    console.log('Connecting to Supabase:', supabaseUrl);

    // 1. Fetch a pending or confirmed appointment
    const { data: appointments, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .limit(1);

    if (fetchError) {
        console.error('Error fetching appointments:', fetchError);
        return;
    }

    if (!appointments || appointments.length === 0) {
        console.log('No appointments found to test.');
        return;
    }

    const appt = appointments[0];
    console.log('Found appointment:', { id: appt.id, status: appt.status });

    // 2. Try to update status ONLY (mirroring the fix in Schedule.tsx)
    console.log('Attempting to update status to in-progress (WITHOUT checklist_data)...');
    const { data: updateData, error: updateError } = await supabase
        .from('appointments')
        .update({
            status: 'in-progress'
            // checklist_data is excluded
        })
        .eq('id', appt.id)
        .select();

    if (updateError) {
        console.error('Update FAILED!');
        console.error('Code:', updateError.code);
        console.error('Message:', updateError.message);
        console.error('Details:', updateError.details);
        console.error('Hint:', updateError.hint);
    } else {
        console.log('Update SUCCESSFUL!');
        console.log('Updated data:', updateData);
    }
}

testUpdate();
