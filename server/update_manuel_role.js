import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("⚡ Shifting Manuel to Sede Admin (Concepción)...");
    const { data, error } = await supabase
        .from('admins')
        .update({ role: 'admin_sede', sede_id: 1 })
        .eq('email', 'manuelplazaarenas@gmail.com')
        .select();
        
    if (error) {
        console.error("❌ Error updating Manuel:", error);
    } else {
        console.log("✅ Manuel successfully updated:", JSON.stringify(data, null, 2));
    }
}
run();
