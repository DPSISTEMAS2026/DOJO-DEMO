import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const tables = ['students', 'payments', 'transactions', 'news', 'videos', 'gallery', 'pagos', 'historial'];
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
