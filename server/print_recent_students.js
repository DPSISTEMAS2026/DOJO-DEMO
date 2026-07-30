import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
    const { data: students, error } = await supabase
        .from('students')
        .select('id, name, email, sede_id, joindate')
        .order('id', { ascending: false });

    if (error) {
        console.error("Error fetching students:", error);
        return;
    }

    console.log("=== LISTADO DE TODOS LOS ALUMNOS Y SU SEDE ===");
    students.forEach((s, idx) => {
        // Imprimir los primeros 10 y los que no sean Sede 1
        if (idx < 15 || s.sede_id !== 1) {
            console.log(`- Alumno: ${s.name.padEnd(30)} | Email: ${(s.email || '').padEnd(30)} | Sede ID: ${s.sede_id} | joinDate: ${s.joinDate}`);
        }
    });
}

run();
