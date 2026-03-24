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

async function searchFeb(year) {
    const beginDate = `${year}-02-01T00:00:00.000Z`;
    const endDate = `${year}-03-01T00:00:00.000Z`;
    
    console.log(`\n--- Searching February ${year} ---`);
    const result = await mpPayment.search({
        options: {
            range: 'date_created',
            begin_date: beginDate,
            end_date: endDate,
        }
    });
    
    const payments = result.results || [];
    console.log(`Found: ${payments.length} payments.`);
    
    payments.forEach(p => {
        console.log(`[${p.date_created.split('T')[0]}] ID: ${p.id} | Status: ${p.status} | Amount: ${p.transaction_amount} | Payer: ${p.payer?.email || 'No email'}`);
    });
}

async function run() {
    try {
         await searchFeb('2025');
         await searchFeb('2026');
    } catch (error) {
         console.error("Search Failed:", error.message || error);
    }
}

run();
