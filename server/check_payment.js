import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new MercadoPagoConfig({
    accessToken: process.env.VITE_MP_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
});

async function checkPayment() {
    const mpPayment = new Payment(client);
    
    // Buscar el pago por ID de operación
    const paymentId = '152220921268';
    
    try {
        console.log(`\n🔍 Buscando pago ID: ${paymentId}...`);
        const details = await mpPayment.get({ id: paymentId });
        
        console.log('\n=== DETALLES DEL PAGO ===');
        console.log('ID:', details.id);
        console.log('Status:', details.status);
        console.log('Status Detail:', details.status_detail);
        console.log('Monto:', details.transaction_amount);
        console.log('Monto neto:', details.net_received_amount);
        console.log('Fee:', details.fee_details);
        console.log('Fecha creación:', details.date_created);
        console.log('Fecha aprobación:', details.date_approved);
        console.log('Descripción:', details.description);
        console.log('External Reference:', details.external_reference);
        console.log('Operation Type:', details.operation_type);
        console.log('Payment Type:', details.payment_type_id);
        console.log('Payment Method:', details.payment_method_id);
        console.log('\n--- PAYER ---');
        console.log('Email:', details.payer?.email);
        console.log('ID:', details.payer?.id);
        console.log('Name:', details.payer?.first_name, details.payer?.last_name);
        console.log('Identification:', details.payer?.identification);
        
        console.log('\n--- COLLECTOR (Receptor) ---');
        console.log('Collector ID:', details.collector_id);
        
    } catch (error) {
        console.error('Error buscando pago:', error.message);
    }
    
    // Buscar pagos recientes del email del alumno
    try {
        console.log('\n\n🔍 Buscando pagos del email jmonsalvez.garcia@gmail.com (últimos 3 meses)...\n');
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: threeMonthsAgo.toISOString(),
                end_date: new Date().toISOString(),
                limit: 50
            }
        });
        
        const payments = result.results || [];
        const monsalvezPayments = payments.filter(p => {
            const email = p.payer?.email?.toLowerCase() || '';
            const desc = p.description?.toLowerCase() || '';
            return email.includes('monsalvez') || email.includes('monsalve') || 
                   desc.includes('monsalvez') || desc.includes('monsalve');
        });
        
        console.log(`Total pagos encontrados: ${payments.length}`);
        console.log(`Pagos de Monsálvez: ${monsalvezPayments.length}`);
        
        monsalvezPayments.forEach(p => {
            console.log(`\n  ID: ${p.id}`);
            console.log(`  Status: ${p.status}`);
            console.log(`  Amount: $${p.transaction_amount}`);
            console.log(`  Date: ${p.date_created}`);
            console.log(`  Email: ${p.payer?.email}`);
            console.log(`  Description: ${p.description}`);
            console.log(`  External Ref: ${p.external_reference}`);
            console.log(`  Operation Type: ${p.operation_type}`);
        });
        
        if (monsalvezPayments.length === 0) {
            console.log('\n⚠️ No se encontraron pagos de Monsálvez. Mostrando últimos 10 pagos:');
            payments.slice(0, 10).forEach(p => {
                console.log(`  ${p.id} | ${p.status} | $${p.transaction_amount} | ${p.payer?.email} | ${p.description} | type: ${p.operation_type}`);
            });
        }
        
    } catch (error) {
        console.error('Error buscando pagos:', error.message);
    }
}

checkPayment();
