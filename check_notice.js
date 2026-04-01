
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

async function checkNotice() {
    const { data: currentNotice, error } = await supabase.from('news').select('*').eq('id', 999999).maybeSingle();
    if (error) {
        console.error('Error fetching notice:', error);
        return;
    }
    console.log('Current Notice (Internal ID 999999):');
    console.log(JSON.stringify(currentNotice, null, 2));

    const { data: students, error: studentError } = await supabase.from('students').select('*');
    if (studentError) {
        console.error('Error fetching students:', studentError);
        return;
    }
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const searchDate = `-${mm}-${dd}`;
    const birthdayStudents = students.filter(s => s.birthdate && s.birthdate.includes(searchDate));
    console.log('Birthday Students for today (' + searchDate + '):');
    birthdayStudents.forEach(s => console.log('- ' + s.name + ' (' + s.birthdate + ')'));
}

checkNotice();
