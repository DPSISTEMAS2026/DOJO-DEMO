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
        console.log("--- Deep Search for Nicolas Esparza (All Statuses) ---");
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: "2026-03-25T00:00:00.000Z",
                end_date: new Date().toISOString(),
                limit: 1000,
            }
        });

        const payments = result.results || [];
        console.log(`Analyzing ${payments.length} payments since March 25...`);
        
        const term = "ni.esparzai@gmail.com".toLowerCase();
        const matches = payments.filter(p => {
            const payerEmail = (p.payer?.email || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const pName = `${p.payer?.first_name || ''} ${p.payer?.last_name || ''}`.toLowerCase();
            return payerEmail.includes(term) || desc.includes("esparza") || desc.includes("nicolas") || 
                   pName.includes("nicolas") || pName.includes("esparza");
        });

        if (matches.length > 0) {
            matches.forEach(p => {
                console.log(JSON.stringify(p, null, 2));
            });
        } else {
            console.log("NO MATCHES FOUND in Mercado Pago.");
            // Print last 5 unique payers to see if something is weird
            const payers = [...new Set(payments.map(p => p.payer?.email))].slice(0, 10);
            console.log("Recent Payers in logs:", payers);
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
