import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Searching for students with phone: 985255975");
    const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .or('phone.eq.985255975,phone.ilike.%985255975%');

    if (error) {
        console.error("Error fetching students:", error.message);
        return;
    }

    if (students && students.length > 0) {
        students.forEach(s => {
            console.log(`ID: ${s.id} | Name: ${s.name} | Email: ${s.email}`);
        });
    } else {
        console.log("No students found with that phone.");
    }
}
run();
