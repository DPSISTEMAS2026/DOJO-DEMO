import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

(async () => {
    const { data: students } = await supabase.from('students').select('*');
    // Búsqueda más flexible
    const targets = students.filter(s => {
        const name = (s.name || '').toLowerCase();
        const isRicardo = name.includes('ricardo') && name.includes('morales');
        const isDiego = name.includes('diego') && name.includes('diaz');
        return isRicardo || isDiego;
    });
    
    console.log('Sending to:', targets.map(t => t.name));

    for (let s of targets) {
        if (!s.email || !s.password) continue;
        const html = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; padding: 2.5rem; border-radius: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="color: #05a86a; margin-top: 1rem; font-size: 1.8rem;">¡Hola ${s.name}!</h2>
        <p style="font-size: 1.1rem; color: #64748b; margin-top: 0.5rem;">Te damos la bienvenida al portal oficial de alumnos del <strong>Dojo Ranas</strong>.</p>
    </div>
    
    <div style="background: #f8fafc; padding: 2rem; border-radius: 1.5rem; margin-bottom: 2rem; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 1rem 0; font-weight: 800; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">TUS DATOS DE ACCESO:</p>
        <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Email:</strong> ${s.email}</p>
        <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Contraseña:</strong> <span style="background: #05a86a; color: #fff; padding: 2px 8px; border-radius: 6px;">${s.password}</span></p>
        
        <a href="https://ranasjiujitsu.cl" style="display: block; background: #05a86a; color: #fff; padding: 1.2rem; text-decoration: none; border-radius: 1rem; font-weight: 800; text-align: center; margin-top: 2rem; box-shadow: 0 10px 20px rgba(5,168,106,0.2);">ENTRAR AL PORTAL 🥋</a>
    </div>

    <div style="margin-top: 2rem;">
        <p style="font-weight: 800; font-size: 0.85rem; color: #64748b; text-transform: uppercase;">¿QUÉ PUEDES HACER EN EL PORTAL?</p>
        <ul style="padding-left: 1.2rem; line-height: 1.6; color: #475569; font-size: 0.95rem;">
            <li><strong>📅 Reservas Semanales:</strong> Reclama tus días de entrenamiento según tu plan.</li>
            <li><strong>💳 Pago Online:</strong> Paga tus cuotas en segundos vía Mercado Pago.</li>
            <li><strong>🥋 Biblioteca Técnica:</strong> Revisa videos exclusivos segmentados por tu cinturón.</li>
            <li><strong>📰 Noticias:</strong> Entérate de torneos, seminarios y avisos del Dojo.</li>
        </ul>
    </div>

    <p style="font-size: 0.85rem; color: #94a3b8; text-align: center; margin-top: 3rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
        Recomendamos cambiar tu contraseña en la sección <strong>Mi Perfil</strong> al completar tu primer acceso.<br>
        <strong>Dojo Ranas Concepción</strong> - Orompello 1421
    </p>
</div>`;
        await transporter.sendMail({
            from: '"Dojo Ranas" <' + (process.env.SMTP_FROM || process.env.SMTP_USER) + '>',
            to: s.email,
            subject: 'Tus credenciales de acceso - Dojo Ranas 🐸',
            html
        });
        console.log('Sent to ' + s.email);
    }
})();
