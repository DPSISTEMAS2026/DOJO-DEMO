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
        console.log("--- Listing ALL payments from the last 12 hours ---");
        const twelveHoursAgo = new Date(Date.now() - 12 * 3600000).toISOString();
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: twelveHoursAgo,
                end_date: new Date().toISOString(),
                limit: 100,
                sort: 'date_created',
                criteria: 'desc'
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            const payer = `${p.payer?.first_name || ''} ${p.payer?.last_name || ''} (${p.payer?.email || 'N/A'})`;
            console.log(`${p.date_created.split('T')[1]} | $${p.transaction_amount} | ${p.status} | ${payer} | Desc: ${p.description}`);
        });

    } catch (error) {
        console.error("Failed:", error.message);
    }
}

run();
