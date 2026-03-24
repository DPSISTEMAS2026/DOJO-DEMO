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
        console.log("--- Inspecting February Payments ---");
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: "2026-02-01T00:00:00.000Z",
                end_date: "2026-03-01T00:00:00.000Z",
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            console.log(`\n--- ID: ${p.id} ---`);
            console.log(`Description: ${p.description}`);
            console.log(`External Reference: ${p.external_reference}`);
            console.log(`Additional Info:`, JSON.stringify(p.additional_info || {}, null, 2));
            console.log(`Payer:`, JSON.stringify(p.payer || {}, null, 2));
        });

    } catch (error) {
        console.error("Failed:", error.message);
    }
}

run();
