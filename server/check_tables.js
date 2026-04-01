import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // There is no direct "list tables" method in Supabase JS, but we can try common ones
    // Or just try to get one row from common tables
    const tables = ['students', 'payments', 'transactions', 'registros_pagos', 'cuotas'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
            console.log(`Table exists: ${table}`);
        } else {
            console.log(`Table NOT found: ${table} (${error.message})`);
        }
    }
}
run();
