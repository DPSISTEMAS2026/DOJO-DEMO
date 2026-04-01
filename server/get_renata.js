import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Searching for student Renata");
    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .ilike('name', '%Renata%')
        .maybeSingle();

    if (error) {
        console.error("Error searching student:", error.message);
        return;
    }

    if (student) {
        console.log(`ID: ${student.id} | Name: ${student.name} | Fee: ${student.monthlyfee}`);
    } else {
        console.log("Renata not found.");
    }
}
run();
