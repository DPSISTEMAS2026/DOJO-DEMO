import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import path from 'path';
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
        console.log("--- Detailed Inspection of Today's Payments ---");
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: "2026-03-31T00:00:00.000Z",
                end_date: "2026-03-31T23:59:59.000Z",
                limit: 100
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            console.log(`\n--- ID: ${p.id} ---`);
            console.log(`Status: ${p.status} | Operation Type: ${p.operation_type} | Payment Type: ${p.payment_type_id}`);
            console.log(`Amount: ${p.transaction_amount} | Payer: ${p.payer?.email}`);
            console.log(`Description: ${p.description}`);
            console.log(`External Reference: ${p.external_reference}`);
        });

    } catch (error) {
        console.error("Failed:", error.message);
    }
}

run();
