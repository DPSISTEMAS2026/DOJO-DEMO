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
        console.log("--- Comprehensive Audit of All Approved Payments Today ---");
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: "2026-03-31T00:00:00.000Z",
                end_date: new Date().toISOString(),
                limit: 100,
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            if (p.status === 'approved') {
                console.log(`\nID: ${p.id} | Amount: ${p.transaction_amount} | Type: ${p.operation_type}`);
                console.log(`Payer Name: ${p.payer?.first_name} ${p.payer?.last_name}`);
                console.log(`Payer Email: ${p.payer?.email}`);
                console.log(`Payer Identification: ${p.payer?.identification?.number}`);
                console.log(`Description: ${p.description}`);
                console.log(`External Reference: ${p.external_reference}`);
                console.log(`Additional Info:`, JSON.stringify(p.additional_info || {}, null, 2));
            }
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
