import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
    console.log("🔧 Limpiando historial de Pedro Barria...\n");
    
    // Obtener datos actuales
    const { data: student, error } = await supabase
        .from('students')
        .select('id, name, history, ispaid, lastpaymentdate, lastpaymentmonth')
        .eq('id', 12)
        .maybeSingle();

    if (error || !student) {
        console.error("❌ Error obteniendo estudiante:", error);
        return;
    }

    console.log(`👤 Alumno: ${student.name} (ID: ${student.id})`);
    
    const history = Array.isArray(student.history) ? student.history : [];
    console.log(`📜 Historial actual (${history.length} entradas):`);
    history.forEach((h, i) => {
        console.log(`   [${i+1}] ${h.date} | $${h.amount} | ${h.transaction_id}`);
    });

    // Filtrar: mantener todos los pagos de julio EXCEPTO los 2 duplicados
    // Conservar solo el PRIMER pago de julio (TX 170362422467) y eliminar los otros 2
    const TX_IDS_TO_REMOVE = ['171256447758', '171256928400'];
    
    const cleanHistory = history.filter(h => !TX_IDS_TO_REMOVE.includes(h.transaction_id));
    
    console.log(`\n✅ Historial limpio (${cleanHistory.length} entradas):`);
    cleanHistory.forEach((h, i) => {
        console.log(`   [${i+1}] ${h.date} | $${h.amount} | ${h.transaction_id}`);
    });

    // El último pago válido es el primero de julio
    const lastPay = [...cleanHistory].sort((a, b) => b.date.localeCompare(a.date))[0];
    
    console.log(`\n💾 Guardando cambios...`);
    
    const { error: updateError } = await supabase
        .from('students')
        .update({
            history: cleanHistory,
            ispaid: true,
            lastpaymentdate: lastPay.date,
            lastpaymentmonth: lastPay.date.substring(0, 7)
        })
        .eq('id', 12);

    if (updateError) {
        console.error("❌ Error actualizando:", updateError);
    } else {
        console.log(`✅ ¡Historial actualizado exitosamente!`);
        console.log(`   - Eliminados ${TX_IDS_TO_REMOVE.length} pagos duplicados`);
        console.log(`   - Último pago válido: ${lastPay.date} | $${lastPay.amount} | TX: ${lastPay.transaction_id}`);
    }
}

run();
