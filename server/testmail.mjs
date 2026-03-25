import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

(async () => {
    try {
        const { data: students, error } = await supabase.from('students').select('*');
        if (error) throw error;
        
        console.log("Total students fetched:", students.length);
        
        const targets = students.filter(s => {
            const lowerName = s.name ? s.name.toLowerCase() : '';
            return lowerName.includes('ricardo morales') || lowerName.includes('diego diaz');
        });
        
        console.log('Found Targets:', targets.map(t => t.name + ' - ' + t.email));
        
        for (let s of targets) {
            if (!s.email || !s.password) {
                console.log('Skipping (no email/pass):', s.name);
                continue;
            }
            const html = `
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
                    <h2 style='color: #05a86a;'>¡Hola ${s.name}!</h2>
                    <p>Te enviamos tus datos de acceso para la plataforma de <strong>Dojo Ranas Administration</strong>.</p>
                    <div style='background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        <p style='margin: 5px 0;'><strong>Usuario:</strong> ${s.email}</p>
                        <p style='margin: 5px 0;'><strong>Contraseña Provisional:</strong> ${s.password}</p>
                    </div>
                    <p style='font-size: 0.9rem; color: #666;'>Te aconsejamos cambiar tu contraseña una vez hayas iniciado sesión en tu perfil. 👍</p>
                    <p>¡Nos vemos en el tatami!</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 0.8rem; color: #999;'>Dojo Ranas - Lautaro 581</p>
                </div>
            `;
            await transporter.sendMail({
                from: '"Dojo Ranas" <' + (process.env.SMTP_FROM || process.env.SMTP_USER) + '>',
                to: s.email,
                subject: 'Tus credenciales de acceso - Dojo Ranas 🐸 (Pre-Test Masivo)',
                html
            });
            console.log('Sent email explicitly to ' + s.email);
        }
    } catch(e) {
        console.error("Test Send Error:", e);
    }
})();
