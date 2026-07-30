import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
    console.log("🔧 Registrando pagos adelantados de Pedro Barria (Jul / Ago / Sep 2026)...\n");

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
        console.log(`   [${i+1}] ${h.date} | $${h.amount} | TX: ${h.transaction_id}`);
    });

    // Los 3 TX IDs reales de los pagos del 30 de julio
    // El primero (170362422467) ya está registrado como JULIO
    // Agregamos los otros 2 como AGOSTO y SEPTIEMBRE
    const TX_AGO = '171256447758';
    const TX_SEP = '171256928400';
    const AMOUNT = 36391;

    // Verificar que no estén ya en el historial
    const yaExisteAgo = history.some(h => h.transaction_id === TX_AGO);
    const yaExisteSep = history.some(h => h.transaction_id === TX_SEP);

    const newEntries = [];

    if (!yaExisteAgo) {
        newEntries.push({
            date: '2026-08-30',
            status: 'Completado',
            amount: AMOUNT,
            method: 'Mercado Pago (Adelanto)',
            transaction_id: TX_AGO,
            note: 'Pago adelantado — Agosto 2026'
        });
    }

    if (!yaExisteSep) {
        newEntries.push({
            date: '2026-09-30',
            status: 'Completado',
            amount: AMOUNT,
            method: 'Mercado Pago (Adelanto)',
            transaction_id: TX_SEP,
            note: 'Pago adelantado — Septiembre 2026'
        });
    }

    if (newEntries.length === 0) {
        console.log('\n⚠️  Los pagos ya están registrados en el historial.');
        return;
    }

    const updatedHistory = [...history, ...newEntries];

    // El último pago válido (más lejano en el futuro) es septiembre
    const lastPay = [...updatedHistory].sort((a, b) => b.date.localeCompare(a.date))[0];

    console.log(`\n✅ Historial actualizado (${updatedHistory.length} entradas):`);
    updatedHistory.forEach((h, i) => {
        console.log(`   [${i+1}] ${h.date} | $${h.amount} | ${h.method} | TX: ${h.transaction_id}`);
    });

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
        console.log(`\n🎉 ¡Listo!`);
        console.log(`   - ${newEntries.length} pagos adelantados registrados`);
        console.log(`   - Pagado hasta: ${lastPay.date} (${lastPay.date.substring(0, 7)})`);
        console.log(`   - Pedro está al día hasta Septiembre 2026`);
    }
}

run();
