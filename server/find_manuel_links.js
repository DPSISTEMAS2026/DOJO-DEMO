import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Searching for any relationship with manuelplazaarenas@gmail.com");
    // Search for students where email matches or some other field might contain it
    const { data: students, error } = await supabase
        .from('students')
        .select('*');

    if (error) {
        console.error("Error fetching students:", error.message);
        return;
    }

    students.forEach(s => {
        const sStr = JSON.stringify(s).toLowerCase();
        if (sStr.includes("manuelplazaarenas")) {
            console.log(`\nFound student: ${s.name} (ID: ${s.id})`);
            console.log(`Email: ${s.email}`);
        }
    });
}
run();
