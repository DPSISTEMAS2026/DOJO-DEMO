import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
    console.log("🔍 Buscando a Pedro Barria en la base de datos...\n");
    
    const { data, error } = await supabase
        .from('students')
        .select('id, name, email, ispaid, lastpaymentdate, lastpaymentmonth, history, sede_id')
        .ilike('name', '%barria%');

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("❌ No se encontró a ningún alumno con apellido Barria");
        return;
    }

    for (const student of data) {
        console.log("=".repeat(60));
        console.log(`👤 Nombre:       ${student.name}`);
        console.log(`🆔 ID:           ${student.id}`);
        console.log(`📧 Email:        ${student.email}`);
        console.log(`✅ isPaid:       ${student.ispaid}`);
        console.log(`📅 LastPay Date: ${student.lastpaymentdate}`);
        console.log(`📅 LastPay Month:${student.lastpaymentmonth}`);
        console.log(`🏠 Sede ID:      ${student.sede_id}`);
        console.log("\n📜 Historial de pagos:");
        
        const history = Array.isArray(student.history) ? student.history : [];
        if (history.length === 0) {
            console.log("   (sin historial)");
        } else {
            history.forEach((h, i) => {
                console.log(`   [${i+1}] Fecha: ${h.date} | Monto: $${h.amount} | Método: ${h.method} | Estado: ${h.status} | TX_ID: ${h.transaction_id}`);
            });
            
            // Verificar si hay duplicados
            const txIds = history.map(h => h.transaction_id).filter(Boolean);
            const uniqueTxIds = new Set(txIds);
            if (txIds.length !== uniqueTxIds.size) {
                console.log("\n⚠️  ¡ATENCIÓN! Se detectaron TRANSACCIONES DUPLICADAS en el historial");
            }
            
            // Ver si algún pago tiene monto triplicado
            const amounts = history.map(h => h.amount);
            console.log(`\n💰 Montos registrados: ${amounts.join(', ')}`);
            console.log(`💰 Total acumulado: $${amounts.reduce((a, b) => a + b, 0)}`);
        }
        console.log("=".repeat(60));
        console.log("");
    }
}

run();
