import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
    // Obtener el access token de la sede 1
    const { data: sedeRecord } = await supabase
        .from('sedes')
        .select('mp_access_token')
        .eq('id', 1)
        .maybeSingle();

    const accessToken = sedeRecord?.mp_access_token || process.env.VITE_MP_ACCESS_TOKEN;
    
    const mpClient = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
    const mpPayment = new Payment(mpClient);
    
    const txIds = ['170362422467', '171256447758', '171256928400'];
    
    console.log("🔍 Verificando los 3 pagos del 30 de julio de Pedro Barria:\n");
    
    for (const txId of txIds) {
        try {
            const details = await mpPayment.get({ id: txId });
            console.log("=".repeat(60));
            console.log(`🆔 TX ID:        ${details.id}`);
            console.log(`📅 Creado:       ${details.date_created}`);
            console.log(`✅ Estado:       ${details.status} - ${details.status_detail}`);
            console.log(`💰 Monto TX:     $${details.transaction_amount}`);
            console.log(`💳 Cuotas:       ${details.installments}`);
            console.log(`🔗 Ext. Ref:     ${details.external_reference}`);
            console.log(`📧 Payer Email:  ${details.payer?.email}`);
            console.log(`📝 Descripción:  ${details.description}`);
            console.log(`🏷️  Tipo Pago:    ${details.payment_type_id}`);
            console.log(`🔄 Op. Tipo:     ${details.operation_type}`);
        } catch (e) {
            console.log(`❌ Error con TX ${txId}: ${e.message}`);
        }
        console.log("");
    }
}

run();
