import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const client = new MercadoPagoConfig({
    accessToken: process.env.VITE_MP_ACCESS_TOKEN || '',
    options: { timeout: 10000 }
});

const mpPayment = new Payment(client);

async function run() {
    try {
        console.log("--- Exhaustive Payer Search (Last 100 payments) ---");
        const result = await mpPayment.search({
            options: {
                sort: 'date_created',
                criteria: 'desc',
                limit: 100,
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            const payerInfo = `${p.payer?.first_name || ''} ${p.payer?.last_name || ''} <${p.payer?.email || ''}>`;
            const date = p.date_created.split('T')[0];
            const time = p.date_created.split('T')[1].split('.')[0];
            const desc = p.description || '';
            
            if (payerInfo.toLowerCase().includes("nicolas") || payerInfo.toLowerCase().includes("esparza") || 
                desc.toLowerCase().includes("nicolas") || desc.toLowerCase().includes("esparza") ||
                (p.payer?.email && p.payer.email.toLowerCase().includes("ni.esparzai"))) {
                console.log(`\n!!! POTENTIAL MATCH !!!`);
                console.log(`ID: ${p.id} | Date: ${date} ${time} | Status: ${p.status}`);
                console.log(`Payer: ${payerInfo}`);
                console.log(`Amount: $${p.transaction_amount} | Desc: ${p.description}`);
            }
        });
        
        console.log(`\nFinished scanning ${payments.length} recent payments.`);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
