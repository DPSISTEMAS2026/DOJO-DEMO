import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("🔍 === INICIANDO VALIDACIÓN DE AISLAMIENTO MULTI-SEDE ===");
    
    // 1. Contar sedes
    const { data: sedes, error: sedesError } = await supabase.from('sedes').select('*');
    if (sedesError) {
        console.error("❌ Error consultando sedes:", sedesError.message);
        return;
    }
    console.log(`✅ Sedes en base de datos: ${sedes.length}`);
    sedes.forEach(s => console.log(`   - [ID: ${s.id}] Sede: ${s.name} (${s.address})`));

    // 2. Contar alumnos por sede
    const { data: students, error: studentsError } = await supabase.from('students').select('id, sede_id');
    if (studentsError) {
        console.error("❌ Error consultando estudiantes:", studentsError.message);
        return;
    }

    const concepcionCount = students.filter(s => s.sede_id === 1).length;
    const dpSistemasCount = students.filter(s => s.sede_id === 2).length;
    const unassignedCount = students.filter(s => s.sede_id === null).length;

    console.log(`\n📊 Distribución de Alumnos:`);
    console.log(`   - Concepción (Sede 1): ${concepcionCount} alumnos.`);
    console.log(`   - DP Sistemas (Sede 2): ${dpSistemasCount} alumnos.`);
    console.log(`   - Sin asignar (NULL):  ${unassignedCount} alumnos.`);

    // 3. Verificar cuentas administrativas
    const { data: admins, error: adminsError } = await supabase.from('admins').select('email, role, sede_id');
    if (adminsError) {
        console.error("❌ Error consultando admins:", adminsError.message);
        return;
    }
    console.log(`\n🔑 Cuentas Administrativas en base de datos:`);
    admins.forEach(a => console.log(`   - Admin: ${a.email} | Rol: ${a.role} | Sede ID: ${a.sede_id || 'Global (SuperAdmin)'}`));

    console.log("\n=======================================================");
    if (concepcionCount > 0 && dpSistemasCount === 0 && unassignedCount === 0) {
        console.log("🎉 ¡AISLAMIENTO INICIAL VERIFICADO CON ÉXITO! 🎉");
        console.log("Dojo Concepción conserva todos los alumnos intactos y DP Sistemas inicia limpio con 0 alumnos.");
    } else {
        console.log("⚠️ Advertencia: Algunos alumnos no están correctamente asignados.");
    }
    console.log("=======================================================\n");
}

run();
