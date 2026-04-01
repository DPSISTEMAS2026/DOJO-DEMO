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
        console.log("--- Listing All RECENT payments (Last 2 hours) ---");
        const since = new Date(Date.now() - 2 * 3600000).toISOString();
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: since,
                end_date: new Date().toISOString(),
                limit: 100,
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            console.log(JSON.stringify(p, null, 2));
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
