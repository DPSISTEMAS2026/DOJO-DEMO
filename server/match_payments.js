import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new MercadoPagoConfig({
    accessToken: process.env.VITE_MP_ACCESS_TOKEN || '',
    options: { timeout: 10000 }
});

const mpPayment = new Payment(client);

// Load students
const studentsFile = path.join(__dirname, 'data', 'students.json');
const students = JSON.parse(fs.readFileSync(studentsFile, 'utf-8'));

async function run() {
    try {
        console.log("--- Matching February 2026 Payments ---");
        
        const result = await mpPayment.search({
            options: {
                status: 'approved',
                range: 'date_created',
                begin_date: "2026-02-01T00:00:00.000Z",
                end_date: "2026-03-01T00:00:00.000Z",
            }
        });

        const payments = result.results || [];
        console.log(`Total approved payments found: ${payments.length}`);

        const matches = [];
        const nonMatches = [];

        payments.forEach(p => {
            const payerEmail = p.payer?.email?.toLowerCase() || '';
            const description = p.description?.toLowerCase() || '';
            
            // 1. Match by email
            let student = students.find(s => s.email?.toLowerCase() === payerEmail);
            
            // 2. Match by student name inside description
            if (!student) {
                student = students.find(s => s.name && description.includes(s.name.toLowerCase()));
            }

            if (student) {
                matches.push({ payment: p, student });
            } else {
                nonMatches.push(p);
            }
        });

        console.log(`\n✅ MATCHED: ${matches.length}`);
        matches.forEach(m => {
             console.log(`- Alumno: ${m.student.name} | Email: ${m.student.email} | Monto: ${m.payment.transaction_amount} | Desc: ${m.payment.description}`);
        });

        console.log(`\n❌ UNMATCHED (No coinciden con alumnos): ${nonMatches.length}`);
        nonMatches.forEach(p => {
             console.log(`- Payer: ${p.payer?.email || 'No email'} | Monto: ${p.transaction_amount} | Desc: ${p.description}`);
        });

    } catch (error) {
        console.error("Match Failed:", error.message || error);
    }
}

run();
