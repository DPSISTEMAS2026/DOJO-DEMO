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
        console.log("--- RAW INSPECTION of last 5 approved payments today ---");
        const result = await mpPayment.search({
            options: {
                status: 'approved',
                sort: 'date_created',
                criteria: 'desc',
                limit: 5,
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
