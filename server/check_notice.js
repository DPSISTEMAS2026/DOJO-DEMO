
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

async function checkNotice() {
    try {
        const { data: currentNotice, error } = await supabase.from('news').select('*').eq('id', 999999).maybeSingle();
        if (error) {
            console.error('Error fetching notice:', error);
            process.exit(1);
        }
        console.log('Current Notice (Internal ID 999999):');
        console.log(JSON.stringify(currentNotice, null, 2));

        const { data: students, error: studentError } = await supabase.from('students').select('*');
        if (studentError) {
            console.error('Error fetching students:', studentError);
            process.exit(1);
        }
        
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const searchDate = `-${mm}-${dd}`;
        
        console.log('Today Search Date: ' + searchDate);
        
        const birthdayStudents = students.filter(s => s.birthdate && s.birthdate.includes(searchDate));
        console.log('Birthday Students found: ' + birthdayStudents.length);
        birthdayStudents.forEach(s => console.log('- ' + s.name + ' (' + s.birthdate + ')'));
        
        // Let's also check if Sofia is in the database at all
        const sofia = students.find(s => s.name.toLowerCase().includes('sofia'));
        if (sofia) {
            console.log('Sofia record in DB: ' + JSON.stringify(sofia, null, 2));
        } else {
            console.log('Sofia NOT found in DB');
        }
    } catch (e) {
        console.error('Unexpected error:', e);
        process.exit(1);
    }
}

checkNotice();
