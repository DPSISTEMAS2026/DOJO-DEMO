import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new MercadoPagoConfig({
    accessToken: process.env.VITE_MP_ACCESS_TOKEN || '',
    options: { timeout: 10000 }
});

const mpPayment = new Payment(client);

async function run() {
    try {
        console.log("--- Cruce de Excel y Mercado Pago ---");
        
        // 1. Cargar pagos de Excel
        const excelPath = path.join(__dirname, '../excel_payments.json');
        if (!fs.existsSync(excelPath)) {
            console.log("Error: No se encontró excel_payments.json");
            return;
        }
        const excelPayments = JSON.parse(fs.readFileSync(excelPath, 'utf-8'));
        
        // 2. Buscar pagos en Mercado Pago
        const result = await mpPayment.search({
            options: {
                status: 'approved',
                range: 'date_created',
                begin_date: "2026-02-01T00:00:00.000Z",
                end_date: "2026-03-01T00:00:00.000Z",
            }
        });
        const mpPayments = result.results || [];
        
        console.log(`Pagos en Excel: ${excelPayments.length}`);
        console.log(`Pagos en Mercado Pago: ${mpPayments.length}`);
        
        const matched = [];
        const unmatched = [];
        
        excelPayments.forEach(ex => {
             let match = null;
             
             for (let mp of mpPayments) {
                  const desc = (mp.description || '').toLowerCase();
                  const amt = mp.transaction_amount;
                  const payerEmail = (mp.payer?.email || '').toLowerCase();
                  
                  // Evitar gastos obvios
                  const isExpense = desc.includes('copec') || 
                                    desc.includes('lider') || 
                                    desc.includes('panaderia') || 
                                    desc.includes('parking') || 
                                    desc.includes('gourmet') ||
                                    desc.includes('sb');
                                    
                  if (isExpense) continue;

                  const nameMatch = desc.includes(ex.name.toLowerCase());
                  const amountMatch = amt === ex.amount;
                  const emailMatch = payerEmail.includes(ex.name.toLowerCase().split(' ')[0]); // fallback email match

                  if (nameMatch || emailMatch || amountMatch) {
                       match = mp;
                       break;
                  }
             }
             
             if (match) {
                 matched.push({ name: ex.name, amount: ex.amount, mp_desc: match.description });
                 // Eliminar de los evaluables para evitar que un mismo pago MP empate a dos alumnos del mismo monto
                 mpPayments.splice(mpPayments.indexOf(match), 1); 
             } else {
                 unmatched.push(ex);
             }
        });
        
        console.log(`\n✅ EMPAREJADOS CON ÉXITO: ${matched.length}`);
        matched.forEach(m => console.log(`- ${m.name} | Monto: $${m.amount} | Desc MP: ${m.mp_desc || 'Sin descripcion'}`));
        
        console.log(`\n❌ EN EXCEL PERO NO HALLADOS EN MERCADO PAGO: ${unmatched.length}`);
        unmatched.forEach(u => console.log(`- ${u.name} | Monto: $${u.amount} | Fecha Excel: ${u.date}`));
        
    } catch (error) {
         console.error("Match Failed:", error.message || error);
    }
}

run();
