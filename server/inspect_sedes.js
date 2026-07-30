import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('sedes').select('*');
    if (error) {
        console.error("Error querying sedes:", error);
    } else {
        console.log("Sedes data:", JSON.stringify(data, null, 2));
    }
}
run();
