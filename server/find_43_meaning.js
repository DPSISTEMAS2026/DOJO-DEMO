import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Searching for students where RUT or any field has '43'");
    const { data: students, error } = await supabase
        .from('students')
        .select('*');

    if (error) {
        console.error("Error fetching students:", error.message);
        return;
    }

    students.forEach(s => {
        const sStr = JSON.stringify(s).toLowerCase();
        if (sStr.includes("43")) {
            console.log(`\nPotential Match: ${s.name} (ID: ${s.id})`);
            // List fields that have 43
            for (const key in s) {
                if (String(s[key]).includes("43")) {
                    console.log(`- ${key}: ${s[key]}`);
                }
            }
        }
    });
}
run();
