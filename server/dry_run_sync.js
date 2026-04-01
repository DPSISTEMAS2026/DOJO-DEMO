import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
const client = new MercadoPagoConfig({
    accessToken: process.env.VITE_MP_ACCESS_TOKEN || '',
    options: { timeout: 10000 }
});

async function run() {
    console.log('[DRY-RUN] Manual Sync Simulation...');
    
    // Get all students
    const { data: students, error: studErr } = await supabase.from('students').select('*');
    if (studErr) throw studErr;

    // Build email->students map
    const emailToStudents = {};
    students.forEach(s => {
        if (s.email) {
            const key = s.email.trim().toLowerCase();
            if (!emailToStudents[key]) emailToStudents[key] = [];
            emailToStudents[key].push(s);
        }
    });

    // Get MP payments from last 15 days
    const mpPayment = new Payment(client);
    const since = new Date();
    since.setDate(since.getDate() - 15);

    const result = await mpPayment.search({
        options: {
            range: 'date_created',
            begin_date: since.toISOString(),
            end_date: new Date().toISOString(),
            limit: 500,
            sort: 'date_created',
            criteria: 'desc'
        }
    });

    const payments = result.results || [];
    console.log(`Found ${payments.length} total payments in MP in the last 15 days.`);

    for (const payment of payments) {
        if (payment.status !== 'approved') continue;

        const payerEmail = payment.payer?.email?.toLowerCase();
        const extRef = payment.external_reference;
        const payDate = payment.date_created?.split('T')[0];
        const amount = payment.transaction_amount;
        const type = payment.operation_type;
        const desc = payment.description || '';

        console.log(`\n--- Inspecting Payment ${payment.id} | Type: ${type} | Amount: ${amount} | Desc: ${desc} | Payer: ${payerEmail} ---`);

        // Try to match by external_reference first (checkout payments)
        let matchedStudentIds = [];
        if (extRef && !extRef.startsWith('money_transfer') && !extRef.includes('-')) {
            matchedStudentIds = extRef.split(',').map(id => id.trim());
            console.log(`Match by extRef: ${matchedStudentIds.join(',')}`);
        }

        // Then try by email (transfers)
        if (matchedStudentIds.length === 0 && payerEmail) {
            const matched = emailToStudents[payerEmail] || [];
            matchedStudentIds = matched.map(s => s.id.toString());
            if (matchedStudentIds.length > 0) console.log(`Match by email: ${matchedStudentIds.join(',')}`);
        }

        // Search in description (glosa) for ID pattern or any registered email
        if (matchedStudentIds.length === 0 && desc) {
            const idMatch = desc.match(/\bID[:\s]*(\d+)\b/i);
            if (idMatch) {
                const potentialId = idMatch[1];
                console.log(`ID pattern found in desc: ${potentialId}`);
                const found = students.find(s => s.id.toString() === potentialId);
                if (found) {
                    matchedStudentIds.push(potentialId);
                    console.log(`Student found for ID ${potentialId}: ${found.name}`);
                }
            }
            
            if (matchedStudentIds.length === 0) {
                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                const emailsInDesc = desc.match(emailRegex);
                if (emailsInDesc) {
                    for (const emailToken of emailsInDesc) {
                        const normalized = emailToken.toLowerCase().trim();
                        const matches = emailToStudents[normalized];
                        if (matches && matches.length > 0) {
                            matchedStudentIds = matches.map(s => s.id.toString());
                            console.log(`Match by email in desc: ${matchedStudentIds.join(',')}`);
                            break;
                        }
                    }
                }
            }
        }

        if (matchedStudentIds.length > 0) {
            console.log(`✅ FINAL MATCH: ${matchedStudentIds.join(', ')}`);
        } else {
            console.log(`❌ NO MATCH FOUND`);
        }
    }
}

run();
