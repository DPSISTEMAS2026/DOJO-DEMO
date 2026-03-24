import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new MercadoPagoConfig({
    accessToken: process.env.VITE_MP_ACCESS_TOKEN || '',
    options: { timeout: 10000 }
});

const mpPayment = new Payment(client);

async function run() {
    try {
        console.log("--- Mercado Pago Payment Search ---");
        console.log("Token setup:", process.env.VITE_MP_ACCESS_TOKEN ? "Exists" : "MISSING");
        
        console.log(`Searching without date restrictions...`);
        
        const result = await mpPayment.search();

        
        console.log("\n--- Results ---");
        const payments = result.results || [];
        console.log(`Total payments found: ${payments.length}`);
        
        if (payments.length > 0) {
            payments.forEach(p => {
                console.log(`[${p.date_created.split('T')[0]}] ID: ${p.id} | Status: ${p.status} | Amount: ${p.transaction_amount} | Payer: ${p.payer.email}`);
            });
        } else {
             console.log("No payments items in response.");
        }
        
    } catch (error) {
        console.error("Search Failed:", error.message || error);
    }
}

run();
