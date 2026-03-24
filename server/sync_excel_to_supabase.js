import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: 'd:/DOJO DEMO/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        const data = JSON.parse(fs.readFileSync('excel_payments.json', 'utf8'));
        const { data: students, error } = await supabase.from('students').select('*');
        if (error) throw error;

        console.log(`Procesando ${data.length} registros del Excel...`);
        let count = 0;

        for (const item of data) {
            let student = students.find(s => s.name.toLowerCase() === item.name.toLowerCase());
            
            if (!student) {
                // Intento de cruce parcial por primer y último nombre
                const itemParts = item.name.toLowerCase().split(' ').filter(p => p.length > 2);
                if (itemParts.length >= 2) {
                    student = students.find(s => {
                        const sLower = s.name.toLowerCase();
                        return sLower.includes(itemParts[0]) && sLower.includes(itemParts[itemParts.length - 1]);
                    });
                }
            }

            if (student) {
                const history = Array.isArray(student.history) ? student.history : [];
                const transaction_id = `EXCEL_${item.date.replace(/-/g, '')}_${item.amount}`;

                if (!history.some(h => h.transaction_id === transaction_id)) {
                    history.push({
                        date: item.date,
                        status: 'Completado',
                        amount: item.amount,
                        method: 'Manual (Excel)',
                        transaction_id: transaction_id
                    });

                    const { error: updErr } = await supabase.from('students').update({
                        history: history,
                        ispaid: true,
                        lastpaymentdate: item.date,
                        lastpaymentmonth: item.date.substring(0, 7)
                    }).eq('id', student.id);

                    if (updErr) {
                        console.error(`Error actualizando ${student.name}:`, updErr.message);
                    } else {
                        console.log(`✅ Pago de ${item.amount} vinculado a ${student.name}`);
                        count++;
                    }
                }
            } else {
                console.warn(`⚠️ Alumno no encontrado para el pago: ${item.name}`);
            }
        }

        console.log(`--- Sincronización Finalizada ---`);
        console.log(`Se actualizaron ${count} pagos con éxito.`);

    } catch (e) {
        console.error("Error en sincronización:", e.message);
    }
}

run();
