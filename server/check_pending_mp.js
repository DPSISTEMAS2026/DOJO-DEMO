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
        console.log("--- Checking for PENDING/IN_PROCESS Today ---");
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: "2026-03-31T00:00:00.000Z",
                end_date: new Date().toISOString(),
                status: 'pending,in_process,authorized,in_mediation,rejected,cancelled',
                limit: 100,
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            console.log(`ID: ${p.id} | Status: ${p.status} | Amount: ${p.transaction_amount}`);
            console.log(`Payer: ${p.payer?.email} | Desc: ${p.description}`);
        });

        if (payments.length === 0) console.log("No pending/rejected payments found today.");

    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
