const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function cleanHistory() {
    try {
        const { data: students, error } = await supabase.from('students').select('id, name, history');
        if (error) throw error;

        console.log(`Checking ${students.length} students...`);
        let totalCleaned = 0;

        for (const student of students) {
            const history = Array.isArray(student.history) ? student.history : [];
            if (history.length === 0) continue;

            const seen = new Set();
            const uniqueHistory = [];
            let studentCleaned = false;

            for (const item of history) {
                // Key: date + amount
                const key = `${item.date}_${item.amount}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueHistory.push(item);
                } else {
                    // Duplicate found
                    console.log(`Duplicate found for ${student.name}: ${key}`);
                    studentCleaned = true;
                    totalCleaned++;
                }
            }

            if (studentCleaned) {
                const { error: updErr } = await supabase.from('students').update({ history: uniqueHistory }).eq('id', student.id);
                if (updErr) console.error(`Error updating ${student.name}:`, updErr);
                else console.log(`✅ Cleaned history for ${student.name}`);
            }
        }
        console.log(`--- Done! Total duplicates removed: ${totalCleaned} ---`);
    } catch (e) {
        console.error("Fatal error:", e);
    }
}

cleanHistory();
