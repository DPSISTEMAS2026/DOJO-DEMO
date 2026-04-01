import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Full profile for Nicolás Ignacio Esparza Inostroza");
    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('name', 'Nicolás Ignacio Esparza Inostroza')
        .maybeSingle();

    if (error) {
        console.error("Error fetching student:", error.message);
        return;
    }

    if (student) {
        console.log(JSON.stringify(student, null, 2));
    } else {
        console.log("Student not found.");
    }
}
run();
