import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
    const { error } = await supabase.from('videos').delete().neq('id', '0');
    if (error) {
        console.error("❌ Error deleting videos:", error);
    } else {
        console.log("✅ All videos deleted successfully from Supabase!");
    }
}

main();
