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
        const studentId = "1774955689518";
        console.log(`--- Searching for student ID ${studentId} in ALL MP labels ---`);
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: "2026-03-01T00:00:00.000Z",
                limit: 1000,
            }
        });

        const payments = result.results || [];
        payments.forEach(p => {
            const pStr = JSON.stringify(p);
            if (pStr.includes(studentId)) {
                console.log(`\nMATCH FOUND FOR ID ${studentId}:`);
                console.log(`ID: ${p.id} | Status: ${p.status} | Date: ${p.date_created}`);
                console.log(`Amount: ${p.transaction_amount} | Payer: ${p.payer?.email}`);
            }
        });

    } catch (error) {
        console.error("Failed:", error.message);
    }
}

run();
