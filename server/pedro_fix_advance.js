import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
    console.log("🔧 Actualizando pagos adelantados de Pedro Barria...\n");

    const { data: student, error } = await supabase
        .from('students')
        .select('id, name, history')
        .eq('id', 12)
        .maybeSingle();

    if (error || !student) {
        console.error("❌ Error:", error);
        return;
    }

    const history = Array.isArray(student.history) ? student.history : [];

    // Actualizar los TX IDs de agosto y septiembre con fecha y método correctos
    const updatedHistory = history.map(h => {
        if (h.transaction_id === '171256447758') {
            return {
                ...h,
                date: '2026-08-30',
                method: 'Mercado Pago (Adelanto)',
                note: 'Pago adelantado — Agosto 2026'
            };
        }
        if (h.transaction_id === '171256928400') {
            return {
                ...h,
                date: '2026-09-30',
                method: 'Mercado Pago (Adelanto)',
                note: 'Pago adelantado — Septiembre 2026'
            };
        }
        return h;
    });

    // Ordenar por fecha para mostrar claramente
    const sorted = [...updatedHistory].sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`📜 Historial final (${sorted.length} entradas):`);
    sorted.forEach((h, i) => {
        console.log(`   [${i+1}] ${h.date} | $${h.amount} | ${h.method} | TX: ${h.transaction_id}`);
    });

    // El último pago es septiembre
    const lastPay = sorted[sorted.length - 1];

    const { error: updateError } = await supabase
        .from('students')
        .update({
            history: updatedHistory,
            ispaid: true,
            lastpaymentdate: lastPay.date,
            lastpaymentmonth: lastPay.date.substring(0, 7)
        })
        .eq('id', 12);

    if (updateError) {
        console.error("❌ Error actualizando:", updateError);
    } else {
        console.log(`\n🎉 ¡Listo! Pedro Barría está al día hasta ${lastPay.date}`);
        console.log(`   💡 El sistema lo marcará como vencido solo a partir de Octubre 2026`);
    }
}

run();
