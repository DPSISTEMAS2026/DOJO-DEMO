// AUDIT SCRIPT: Cross-reference ALL MP payments with student records
// Checks for phantom payments, missing payments, and transfer-type payments

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new MercadoPagoConfig({ accessToken: process.env.VITE_MP_ACCESS_TOKEN || '' });
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

async function fullAudit() {
    const results = {
        mpPayments: [],
        studentEmails: [],
        matchedByEmail: [],
        matchedByName: [],
        transfersVsPayments: [],
        studentsPaidNotInMP: [],
        mpPaymentsNotInStudents: [],
        studentsMarkedPaidWithNoHistory: [],
        phantomPayments: []
    };

    // Step 1: Get ALL students from Supabase
    console.log('📊 AUDITORÍA COMPLETA DE PAGOS');
    console.log('='.repeat(70));
    
    const { data: students, error: studErr } = await supabase.from('students').select('*');
    if (studErr) { console.error('Error getting students:', studErr); return; }
    console.log(`\n✅ ${students.length} alumnos cargados desde Supabase`);
    
    // Map student emails for quick lookup
    const emailToStudents = {};
    students.forEach(s => {
        if (s.email) {
            const key = s.email.trim().toLowerCase();
            if (!emailToStudents[key]) emailToStudents[key] = [];
            emailToStudents[key].push(s);
        }
    });

    // Step 2: Get ALL MP payments (last 12 months)
    const mpPayment = new Payment(client);
    let allPayments = [];
    
    // Fetch in monthly chunks to get more data
    for (let m = 0; m < 12; m++) {
        const end = new Date();
        end.setMonth(end.getMonth() - m);
        const start = new Date(end);
        start.setMonth(start.getMonth() - 1);
        
        try {
            const result = await mpPayment.search({
                options: {
                    range: 'date_created',
                    begin_date: start.toISOString(),
                    end_date: end.toISOString(),
                    limit: 100
                }
            });
            allPayments = allPayments.concat(result.results || []);
        } catch (e) {
            // Some months may have no data
        }
    }
    
    // Deduplicate by ID
    const seen = new Set();
    allPayments = allPayments.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });
    
    console.log(`✅ ${allPayments.length} pagos encontrados en Mercado Pago (últimos 12 meses)`);
    
    // Step 3: Classify ALL MP payments
    console.log('\n' + '='.repeat(70));
    console.log('📋 CLASIFICACIÓN DE TODOS LOS PAGOS EN MERCADO PAGO');
    console.log('='.repeat(70));
    
    const payments_regular = allPayments.filter(p => p.operation_type === 'regular_payment');
    const payments_transfer = allPayments.filter(p => p.operation_type === 'account_fund' || p.operation_type === 'transfer');
    const payments_pos = allPayments.filter(p => p.operation_type === 'pos_payment');
    const payments_other = allPayments.filter(p => !['regular_payment', 'account_fund', 'transfer', 'pos_payment'].includes(p.operation_type));
    
    console.log(`\n  Pagos regulares (Checkout): ${payments_regular.length}`);
    console.log(`  Transferencias recibidas:   ${payments_transfer.length}`);
    console.log(`  Pagos POS/QR:               ${payments_pos.length}`);
    console.log(`  Otros tipos:                ${payments_other.length}`);
    
    // Step 4: Detail ALL payments with operation types
    console.log('\n' + '='.repeat(70));
    console.log('📋 DETALLE DE TODOS LOS PAGOS (ordenados por fecha)');
    console.log('='.repeat(70));
    
    const approvedPayments = allPayments
        .filter(p => p.status === 'approved')
        .sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    
    console.log(`\nTotal pagos aprobados: ${approvedPayments.length}\n`);
    
    approvedPayments.forEach(p => {
        const date = p.date_created?.split('T')[0] || 'N/A';
        const email = p.payer?.email || 'sin-email';
        const desc = p.description || 'sin-desc';
        const opType = p.operation_type;
        const extRef = p.external_reference || 'N/A';
        const amount = p.transaction_amount;
        const fee = p.fee_details?.reduce((acc, f) => acc + f.amount, 0) || 0;
        
        // Check if this email matches any student
        const matchedStudents = emailToStudents[email.toLowerCase()] || [];
        const matchStatus = matchedStudents.length > 0 ? '✅ MATCH' : '❌ NO MATCH';
        const matchNames = matchedStudents.map(s => s.name).join(', ') || 'N/A';
        
        // Check if payment is in student history
        let inHistory = false;
        matchedStudents.forEach(s => {
            if (Array.isArray(s.history)) {
                if (s.history.some(h => h.transaction_id === p.id.toString())) {
                    inHistory = true;
                }
            }
        });
        
        console.log(`  ${date} | $${String(amount).padStart(6)} | ${opType.padEnd(18)} | ${email.padEnd(35)} | ${matchStatus} ${inHistory ? '📝 EN HISTORIAL' : '⚠️ NO EN HISTORIAL'}`);
        console.log(`           | Fee: $${fee} | ExtRef: ${extRef} | Desc: ${desc.substring(0, 50)}`);
        if (matchedStudents.length > 0) {
            console.log(`           | Alumno(s): ${matchNames}`);
        }
        console.log('');
    });
    
    // Step 5: Check for students marked as paid that have NO MP history
    console.log('\n' + '='.repeat(70));
    console.log('🔍 ALUMNOS PAGADOS SIN TRANSACCIÓN MP VERIFICABLE');
    console.log('='.repeat(70));
    
    let suspiciousCount = 0;
    students.forEach(s => {
        if (s.ispaid && Array.isArray(s.history) && s.history.length > 0) {
            // Check last payment - if it says Mercado Pago, verify it exists in MP
            const lastPayment = s.history[s.history.length - 1];
            if (lastPayment.method === 'Mercado Pago' && lastPayment.transaction_id) {
                const existsInMP = approvedPayments.some(p => p.id.toString() === lastPayment.transaction_id);
                if (!existsInMP) {
                    console.log(`\n  ⚠️ ${s.name}`);
                    console.log(`     MP Transaction: ${lastPayment.transaction_id}`);
                    console.log(`     Amount: $${lastPayment.amount}`);
                    console.log(`     Date: ${lastPayment.date}`);
                    console.log(`     NOTA: Esta transacción NO se encontró en los resultados de búsqueda de MP`);
                    suspiciousCount++;
                }
            }
        }
    });
    if (suspiciousCount === 0) console.log('\n  ✅ Ningún caso sospechoso encontrado');
    
    // Step 6: Check for MP payments from student emails NOT in their history
    console.log('\n' + '='.repeat(70));
    console.log('🔍 PAGOS EN MP DE ALUMNOS QUE NO ESTÁN EN SU HISTORIAL');
    console.log('='.repeat(70));
    
    let missingCount = 0;
    approvedPayments.forEach(p => {
        const email = p.payer?.email?.toLowerCase();
        if (!email) return;
        
        const matchedStudents = emailToStudents[email] || [];
        matchedStudents.forEach(s => {
            const history = Array.isArray(s.history) ? s.history : [];
            const inHistory = history.some(h => h.transaction_id === p.id.toString());
            if (!inHistory) {
                console.log(`\n  ❌ PAGO FALTANTE en historial de ${s.name}`);
                console.log(`     MP ID: ${p.id} | $${p.transaction_amount} | ${p.date_created?.split('T')[0]}`);
                console.log(`     Tipo: ${p.operation_type} | Desc: ${p.description}`);
                console.log(`     Email: ${email}`);
                missingCount++;
            }
        });
    });
    if (missingCount === 0) console.log('\n  ✅ Todos los pagos de MP están reflejados en historiales');
    
    // Step 7: TRANSFERS specifically - are any transfers being matched?
    console.log('\n' + '='.repeat(70));
    console.log('💸 TRANSFERENCIAS RECIBIDAS (¿Se están confundiendo con pagos?)');
    console.log('='.repeat(70));
    
    const transfers = allPayments.filter(p => 
        p.operation_type === 'account_fund' || 
        p.operation_type === 'transfer' || 
        p.operation_type === 'money_transfer'
    );
    
    if (transfers.length === 0) {
        console.log('\n  ℹ️ No se encontraron transferencias en los últimos 12 meses.');
        console.log('  Los pagos son todos de tipo "regular_payment" (checkout).');
    } else {
        console.log(`\n  Se encontraron ${transfers.length} transferencias:\n`);
        transfers.forEach(t => {
            const email = t.payer?.email || 'sin-email';
            const matchedStudents = emailToStudents[email.toLowerCase()] || [];
            const date = t.date_created?.split('T')[0] || 'N/A';
            
            console.log(`  ${date} | $${t.transaction_amount} | ${t.operation_type}`);
            console.log(`    Email: ${email}`);
            console.log(`    Desc: ${t.description || 'N/A'}`);
            console.log(`    Status: ${t.status}`);
            if (matchedStudents.length > 0) {
                console.log(`    ⚠️ COINCIDE CON: ${matchedStudents.map(s => s.name).join(', ')}`);
            }
            console.log('');
        });
    }
    
    // Step 8: Summary of all operation types
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN POR TIPO DE OPERACIÓN');
    console.log('='.repeat(70));
    
    const opTypes = {};
    allPayments.forEach(p => {
        const key = p.operation_type || 'unknown';
        if (!opTypes[key]) opTypes[key] = { count: 0, total: 0, statuses: {} };
        opTypes[key].count++;
        opTypes[key].total += p.transaction_amount || 0;
        const st = p.status || 'unknown';
        opTypes[key].statuses[st] = (opTypes[key].statuses[st] || 0) + 1;
    });
    
    Object.entries(opTypes).forEach(([type, data]) => {
        console.log(`\n  ${type}:`);
        console.log(`    Total transacciones: ${data.count}`);
        console.log(`    Monto total: $${data.total.toLocaleString('es-CL')}`);
        console.log(`    Estados: ${JSON.stringify(data.statuses)}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 AUDITORÍA COMPLETA');
    console.log('='.repeat(70));
}

fullAudit().catch(console.error);
