import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("🧹 Cleaning emails and passwords in database...");

    // 1. Clean Admins
    console.log("Admins:");
    const { data: admins, error: errAdmins } = await supabase.from('admins').select('*');
    if (errAdmins) {
        console.error("Error reading admins:", errAdmins);
    } else {
        for (const admin of admins) {
            const cleanEmail = admin.email ? admin.email.trim().toLowerCase() : null;
            const cleanPass = admin.password_hash ? admin.password_hash.trim() : null;
            if (cleanEmail !== admin.email || cleanPass !== admin.password_hash) {
                console.log(`Updating admin ${admin.id}: "${admin.email}" -> "${cleanEmail}"`);
                const { error: updErr } = await supabase
                    .from('admins')
                    .update({ email: cleanEmail, password_hash: cleanPass })
                    .eq('id', admin.id);
                if (updErr) console.error("Error updating admin:", updErr);
            }
        }
    }

    // 2. Clean Students
    console.log("\nStudents:");
    const { data: students, error: errStudents } = await supabase.from('students').select('*');
    if (errStudents) {
        console.error("Error reading students:", errStudents);
    } else {
        let count = 0;
        for (const student of students) {
            const cleanEmail = student.email ? student.email.trim().toLowerCase() : null;
            const cleanPass = student.password ? student.password.trim() : null;
            if (cleanEmail !== student.email || cleanPass !== student.password) {
                console.log(`Updating student ${student.id} (${student.name}): "${student.email}" -> "${cleanEmail}", password: "${student.password}" -> "${cleanPass}"`);
                const { error: updErr } = await supabase
                    .from('students')
                    .update({ email: cleanEmail, password: cleanPass })
                    .eq('id', student.id);
                if (updErr) {
                    console.error("Error updating student:", updErr);
                } else {
                    count++;
                }
            }
        }
        console.log(`Finished. Updated ${count} students.`);
    }
}

run();
