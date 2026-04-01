import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Searching for: Esparza or Inostroza");
    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .or('name.ilike.%Esparza%,name.ilike.%Inostroza%');

    if (error) {
        console.error("Error searching students:", error.message);
        return;
    }

    if (student && student.length > 0) {
        console.log(`Found ${student.length} students:`);
        student.forEach(s => {
            console.log(`\nID: ${s.id}`);
            console.log(`Name: ${s.name}`);
            console.log(`Email: ${s.email}`);
            console.log(`Status: ${s.payment_status}`);
            console.log(`Last Payment: ${s.last_payment_date}`);
        });
    } else {
        console.log("No students found.");
    }
}
run();
