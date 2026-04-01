import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Getting details for Nicolas Esparza...");
    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', '1774955689518')
        .single();

    if (error) {
        console.error("Error fetching student:", error.message);
        return;
    }

    console.log(JSON.stringify(student, null, 2));
}
run();
