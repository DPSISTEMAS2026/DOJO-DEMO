import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Searching for student by email: ni.esparzai@gmail.com");
    const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', 'ni.esparzai@gmail.com');

    if (error) {
        console.error("Error searching student:", error.message);
        return;
    }

    if (students && students.length > 0) {
        students.forEach(s => {
            console.log(JSON.stringify(s, null, 2));
        });
    } else {
        console.log("Student not found.");
    }
}
run();
