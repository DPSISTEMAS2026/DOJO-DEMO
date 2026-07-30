import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check multiple env locations
const envPaths = [
    path.join(__dirname, '../../.env'), // e:\DOJO DEMO\.env
    path.join(__dirname, '../.env'),    // e:\DOJO DEMO\DOJO-DEMO\.env
    path.join(__dirname, './.env')      // e:\DOJO DEMO\DOJO-DEMO\server\.env
];

let loaded = false;
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        loaded = true;
        break;
    }
}

if (!loaded) {
    console.error("[ERROR] No se pudo encontrar el archivo .env.");
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const args = process.argv.slice(2);
const isTestMode = args.includes('--test');
const testEmailIndex = args.indexOf('--test');
const testEmail = testEmailIndex !== -1 ? args[testEmailIndex + 1] : null;

if (isTestMode && !testEmail) {
    console.error("[ERROR] Debes proporcionar un correo para el modo prueba. Ejemplo: node send_tester_invitation.mjs --test tu-correo@gmail.com");
    process.exit(1);
}

(async () => {
    try {
        console.log("Conectando con Supabase...");
        const { data: students, error } = await supabase
            .from('students')
            .select('email, name')
            .not('email', 'is', null);
            
        if (error) throw error;
        
        let targets = [];
        
        if (isTestMode) {
            console.log(`[MODO PRUEBA] Enviando invitación de prueba a: ${testEmail}`);
            targets = [{ name: 'Alumno de Prueba', email: testEmail }];
        } else {
            // Filter valid and unique emails
            const validStudents = students.filter(s => s.email && s.email.trim() !== '' && s.email.includes('@'));
            const uniqueEmails = new Set();
            for (const s of validStudents) {
                const cleanEmail = s.email.trim().toLowerCase();
                if (!uniqueEmails.has(cleanEmail)) {
                    uniqueEmails.add(cleanEmail);
                    targets.push({ name: s.name || 'Alumno', email: cleanEmail });
                }
            }
            
            console.log(`\n======================================================`);
            console.log(`PREPARANDO ENVÍO MASIVO A ${targets.length} ALUMNOS`);
            console.log(`======================================================\n`);
            console.log("¡IMPORTANTE! Asegúrate de haber copiado y pegado la lista de correos en Google Play Console antes de continuar.");
            console.log("Escribe 'SI' y presiona Enter para confirmar el envío masivo:");
            
            // Wait for user input to confirm in non-test mode
            await new Promise((resolve) => {
                process.stdin.once('data', (data) => {
                    const ans = data.toString().trim().toUpperCase();
                    if (ans !== 'SI') {
                        console.log("Envío cancelado.");
                        process.exit(0);
                    }
                    resolve();
                });
            });
        }
        
        console.log(`Iniciando envío de correos...`);
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < targets.length; i++) {
            const student = targets[i];
            const name = student.name;
            const email = student.email;
            
            const html = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; padding: 2.5rem; border-radius: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 2rem;">
        <!-- Logo placeholder style -->
        <div style="background: #020408; width: 80px; height: 80px; border-radius: 50%; border: 3px solid #4ade80; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
            <span style="color: #4ade80; font-size: 1.8rem; font-weight: bold;">🐸</span>
        </div>
        <h2 style="color: #020408; margin-top: 1.5rem; font-size: 1.8rem; font-weight: 800;">¡Hola ${name}!</h2>
        <p style="font-size: 1.1rem; color: #64748b; margin-top: 0.5rem; line-height: 1.5;">
            Te invitamos a ser parte del lanzamiento oficial de <strong>Ranapp</strong>, la nueva app móvil de <strong>Ranas Jiu Jitsu</strong>.
        </p>
    </div>
    
    <div style="background: #f8fafc; padding: 2rem; border-radius: 1.5rem; margin-bottom: 2rem; border: 1px solid #e2e8f0; line-height: 1.6;">
        <p style="margin: 0 0 1rem 0; font-weight: 800; font-size: 0.85rem; color: #020408; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #4ade80; padding-bottom: 5px;">¿POR QUÉ TE NECESITAMOS?</p>
        <p style="font-size: 0.95rem; color: #475569; margin: 0;">
            Para que Google apruebe y publique nuestra app de forma definitiva en la Play Store, **Google nos exige por normativa que al menos 20 personas instalen y prueben la aplicación en sus teléfonos Android de forma continua durante 14 días**. ¡Tu participación como alumno es fundamental!
        </p>
    </div>

    <div style="margin-top: 2rem; margin-bottom: 2rem;">
        <p style="font-weight: 800; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.5rem;">PASOS PARA SER TESTER OFICIAL:</p>
        
        <!-- Step 1 -->
        <div style="display: flex; margin-bottom: 1.5rem; align-items: flex-start;">
            <div style="background: #4ade80; color: #020408; width: 30px; height: 30px; border-radius: 50%; font-weight: bold; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">1</div>
            <div>
                <p style="margin: 0; font-weight: bold; font-size: 1rem; color: #020408;">Acepta la invitación de pruebas</p>
                <p style="margin: 5px 0 0 0; font-size: 0.95rem; color: #475569;">
                    Haz clic en el siguiente enlace desde tu teléfono:
                </p>
                <a href="https://play.google.com/apps/testing/cl.ranasjiujitsu.ranapp" target="_blank" style="display: inline-block; margin-top: 8px; color: #05a86a; font-weight: bold; text-decoration: underline;">
                    Unirse al programa de pruebas aquí ➔
                </a>
                <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #94a3b8; font-style: italic;">
                    (Debes iniciar sesión con el correo Gmail que usas en tu teléfono para descargar apps).
                </p>
            </div>
        </div>

        <!-- Step 2 -->
        <div style="display: flex; margin-bottom: 1.5rem; align-items: flex-start;">
            <div style="background: #4ade80; color: #020408; width: 30px; height: 30px; border-radius: 50%; font-weight: bold; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">2</div>
            <div>
                <p style="margin: 0; font-weight: bold; font-size: 1rem; color: #020408;">Descarga la aplicación</p>
                <p style="margin: 5px 0 0 0; font-size: 0.95rem; color: #475569;">
                    En la misma pantalla del enlace anterior, selecciona la opción **"Descargar en Google Play"** e instala la aplicación en tu celular.
                </p>
            </div>
        </div>

        <!-- Step 3 -->
        <div style="display: flex; margin-bottom: 1.5rem; align-items: flex-start;">
            <div style="background: #4ade80; color: #020408; width: 30px; height: 30px; border-radius: 50%; font-weight: bold; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">3</div>
            <div>
                <p style="margin: 0; font-weight: bold; font-size: 1rem; color: #020408;">Inicia sesión con tu cuenta</p>
                <p style="margin: 5px 0 0 0; font-size: 0.95rem; color: #475569;">
                    Abre la aplicación e ingresa con tu correo y contraseña habitual del portal (el que usas para reservar tus clases en la web).
                </p>
            </div>
        </div>

        <!-- Step 4 -->
        <div style="display: flex; margin-bottom: 1.5rem; align-items: flex-start;">
            <div style="background: #4ade80; color: #020408; width: 30px; height: 30px; border-radius: 50%; font-weight: bold; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">4</div>
            <div>
                <p style="margin: 0; font-weight: bold; font-size: 1rem; color: #020408;">Mantenla instalada por 14 días</p>
                <p style="margin: 5px 0 0 0; font-size: 0.95rem; color: #475569;">
                    Te pedimos encarecidamente mantener la app instalada en tu teléfono durante al menos 14 días. Puedes usarla diariamente para tus reservas y ver tu perfil.
                </p>
            </div>
        </div>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 1.5rem; text-align: center; color: #64748b; font-size: 0.95rem; line-height: 1.5;">
        Agradecemos enormemente tu ayuda para dar este gran paso tecnológico para la academia. ¡Nos vemos en el tatami! 🥋💪<br><br>
        <strong>Dojo Ranas Concepción</strong><br>
        <span style="font-size: 0.85rem; color: #94a3b8;">Orompello 1421</span>
    </div>
</div>
`;

            try {
                await transporter.sendMail({
                    from: '"Dojo Ranas" <' + (process.env.SMTP_FROM || process.env.SMTP_USER) + '>',
                    to: email,
                    subject: '🥋 ¡Ayúdanos a probar nuestra nueva App oficial! - Ranas Jiu Jitsu 🐸',
                    html
                });
                successCount++;
                console.log(`[${i + 1}/${targets.length}] Enviado exitosamente a: ${email}`);
            } catch (mailErr) {
                failCount++;
                console.error(`[❌ ERROR] Falló el envío a: ${email}`, mailErr.message);
            }
            
            // Small delay to prevent SMTP rate limits (e.g. 200ms)
            await new Promise(r => setTimeout(r, 250));
        }
        
        console.log(`\n=== PROCESO FINALIZADO ===`);
        console.log(`Enviados con éxito: ${successCount}`);
        console.log(`Errores: ${failCount}`);
        
        process.exit(0);
    } catch (err) {
        console.error("Error general:", err);
        process.exit(1);
    }
})();
