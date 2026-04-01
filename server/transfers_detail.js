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
        console.log("--- Detail of All Transfers to Manuel (Today 31) ---");
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: "2026-03-31T00:00:00.000Z",
                end_date: new Date().toISOString(),
                limit: 100
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            if (p.operation_type === 'account_fund' || p.operation_type === 'money_transfer' || p.payment_type_id === 'bank_transfer') {
                console.log(`\n--- Payment ID: ${p.id} ---`);
                console.log(`Amount: $${p.transaction_amount} | Status: ${p.status}`);
                console.log(`Description (Glosa): ${p.description}`);
                console.log(`Payer Email in MP: ${p.payer?.email}`);
                // In some transfers, the real name is in transaction_details or point_of_interaction
                console.log(`Transaction Data:`, JSON.stringify(p.point_of_interaction?.transaction_data || {}, null, 2));
                console.log(`Additional Info (Items):`, JSON.stringify(p.additional_info?.items || [], null, 2));
            }
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
