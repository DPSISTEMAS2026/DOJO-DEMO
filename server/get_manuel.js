import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Searching for student with email: manuelplazaarenas@gmail.com");
    const { data: students, error } = await supabase
        .from('students')
        .select('id, name, email, ispaid, lastpaymentdate')
        .eq('email', 'manuelplazaarenas@gmail.com');

    if (error) {
        console.error("Error fetching students:", error.message);
        return;
    }

    if (students && students.length > 0) {
        students.forEach(s => {
            console.log(`ID: ${s.id} | Name: ${s.name} | Paid: ${s.ispaid} | Last Date: ${s.lastpaymentdate}`);
        });
    } else {
        console.log("No student found with that email.");
    }
}
run();
