import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Searching for any student with 'Esparza'");
    const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .ilike('name', '%Esparza%');

    if (error) {
        console.error("Error searching students:", error.message);
        return;
    }

    if (students && students.length > 0) {
        students.forEach(s => {
            console.log(`ID: ${s.id} | Name: ${s.name} | Email: ${s.email}`);
        });
    } else {
        console.log("No students found.");
    }
}
run();
