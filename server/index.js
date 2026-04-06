import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { DateTime } from 'luxon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');


const app = express();
const PORT = process.env.PORT || 3001;

// Mercado Pago Configuration
const client = new MercadoPagoConfig({
    accessToken: process.env.VITE_MP_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Paths to "Database"
const dbPath = path.join(__dirname, 'data');
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

const uploadsDir = path.join(dbPath, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const studentsFile = path.join(dbPath, 'students.json');
const videosFile = path.join(dbPath, 'videos.json');
const newsFile = path.join(dbPath, 'news.json');
const galleryFile = path.join(dbPath, 'gallery.json');
const heroVideosFile = path.join(dbPath, 'heroVideos.json');
const noticeFile = path.join(dbPath, 'global_notice.json');

// Servir archivos estáticos de subidas
app.use('/uploads', express.static(uploadsDir));

// Endpoint de subida directo por Stream (sin multer)
app.post('/api/upload', (req, res) => {
    try {
        const originalName = req.headers['x-filename'] || `upload_${Date.now()}`;
        // Sanitizar el nombre de archivo o usar timestamp para evitar colisiones
        const ext = path.extname(originalName) || '.mp4';
        const sanitizedName = `file_${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, sanitizedName);
        
        const fileStream = fs.createWriteStream(filePath);
        req.pipe(fileStream);

        fileStream.on('finish', () => {
            res.status(201).json({ url: `/uploads/${sanitizedName}` });
        });

        fileStream.on('error', (err) => {
            res.status(500).json({ error: err.message });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helpers to read/write JSON
const readData = (file) => {
    if (!fs.existsSync(file)) {
        return null; // Return null to indicate "no file" vs "empty array"
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return data;
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
};

// --- ROUTES ---

// Admin Payments Lookup
app.get('/api/admin/payments', async (req, res) => {
    try {
        const { year = '2026', month = '02' } = req.query;
        const mpPayment = new Payment(client);
        
        const nextMonth = Number(month) === 12 ? 1 : Number(month) + 1;
        const nextYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
        
        const beginDate = `${year}-${String(month).padStart(2,'0')}-01T00:00:00.000Z`;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2,'0')}-01T00:00:00.000Z`;

        const result = await mpPayment.search({
            options: {
                range: 'date_created',
                begin_date: beginDate,
                end_date: endDate,
                limit: 1000
            }
        });

        // Cargar alumnos para el cruce
        const students = readData(studentsFile) || [];

        const payments = result.results || [];
        const matched = [];
        const unmatched = [];
        const expenses = [];

        payments.forEach(p => {
            const payerEmail = p.payer?.email?.toLowerCase() || '';
            const description = p.description?.toLowerCase() || '';
            
            // 1. Detectar si es un gasto obvio (compras en comercios)
            const isGasto = description.includes('copec') || 
                            description.includes('lider') || 
                            description.includes('panaderia') || 
                            description.includes('parking') || 
                            description.includes('experiencia gourmet') ||
                            description.includes('sb ');

            if (isGasto) {
                expenses.push({
                    id: p.id,
                    date: p.date_created,
                    amount: p.transaction_amount,
                    description: p.description
                });
                return;
            }

            // 2. Intentar cruce por Email
            let student = students.find(s => s.email?.toLowerCase() === payerEmail);
            
            // 3. Intentar cruce por nombre incluido en la descripción
            if (!student) {
                student = students.find(s => s.name && description.includes(s.name.toLowerCase()));
            }

            if (student) {
                matched.push({
                    studentName: student.name,
                    id: p.id,
                    date: p.date_created,
                    amount: p.transaction_amount,
                    description: p.description,
                    payer: p.payer?.email || 'No email'
                });
            } else {
                unmatched.push({
                    id: p.id,
                    date: p.date_created,
                    amount: p.transaction_amount,
                    description: p.description,
                    payer: p.payer?.email || 'No email'
                });
            }
        });

        res.json({
            success: true,
            range: { beginDate, endDate },
            summary: {
                total: payments.length,
                matched: matched.length,
                unmatched_income: unmatched.length,
                expenses: expenses.length
            },
            matched,
            unmatched_income: unmatched,
            expenses
        });

    } catch (error) {
        console.error("Admin Payments Lookup Failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Videos
app.get('/api/videos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('videos').select('*');
        if (error) throw error;
        const formatted = data.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            url: v.url,
            thumbnail: v.thumbnail,
            beltLevel: v.beltlevel,
            category: v.category
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/videos', async (req, res) => {
    try {
        const newId = Date.now().toString();
        const newVideo = { 
            id: newId,
            title: req.body.title,
            description: req.body.description,
            url: req.body.url,
            thumbnail: req.body.thumbnail,
            beltlevel: req.body.beltLevel,
            category: req.body.category
        };
        const { error } = await supabase.from('videos').insert(newVideo);
        if (error) throw error;
        res.status(201).json({ ...req.body, id: newId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('videos').delete().eq('id', id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// News
app.get('/api/news', async (req, res) => {
    try {
        const { data, error } = await supabase.from('news').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/news', async (req, res) => {
    try {
        // Borrar noticias previas (exceptuando el aviso global reservado con ID 999999)
        await supabase.from('news').delete().neq('id', 999999);
        const { error } = await supabase.from('news').insert(Array.isArray(req.body) ? req.body : [req.body]);
        if (error) throw error;
        res.status(200).json(req.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gallery
app.get('/api/gallery', async (req, res) => {
    try {
        const { data, error } = await supabase.from('gallery').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/gallery', async (req, res) => {
    try {
        await supabase.from('gallery').delete().neq('id', 0);
        const { error } = await supabase.from('gallery').insert(Array.isArray(req.body) ? req.body : [req.body]);
        if (error) throw error;
        res.status(200).json(req.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hero Videos (Keep local fallback or simple json read setup)
app.get('/api/hero-videos', (req, res) => {
    res.json(readData(heroVideosFile));
});

app.post('/api/hero-videos', (req, res) => {
    writeData(heroVideosFile, req.body);
    res.status(200).json(req.body);
});

// Students with automatic background sync
app.get('/api/students', async (req, res) => {
    try {
        const { data, error } = await supabase.from('students').select('*');
        if (error) throw error;

        // Logic: if lastpaymentdate + 1 month < today, set as unpaid
        const now = new Date();
        const updatedData = [];
        let anyStatusChanged = false;

        for (const s of data) {
            let currentStatus = s.ispaid;
            if (s.lastpaymentdate) {
                const pDate = new Date(s.lastpaymentdate);
                pDate.setMonth(pDate.getMonth() + 1);
                if (now > pDate && currentStatus === true) {
                    currentStatus = false;
                    await supabase.from('students').update({ ispaid: false }).eq('id', s.id);
                    anyStatusChanged = true;
                }
            }
            updatedData.push({ ...s, ispaid: currentStatus });
        }

        // Logic: Birthdays auto-broadcast (using Chile timezone)
        const chileDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
        const mm = String(chileDate.getMonth() + 1).padStart(2, '0');
        const dd = String(chileDate.getDate()).padStart(2, '0');
        const searchDate = `-${mm}-${dd}`;
        const birthdayStudents = updatedData.filter(s => s.birthdate && s.birthdate.includes(searchDate));
        
        if (birthdayStudents.length > 0) {
            const names = birthdayStudents.map(s => s.name.split(' ')[0]).join(', ');
            const subject = '🎂 ¡Felices Cumpleaños de Hoy!';
            const message = `Hoy saludamos especialmente a: **${names}**. ¡Que tengan un excelente día de parte de su Dojo Ranas! 🥋🐸`;
            
            // Verificamos si el aviso ya existe para hoy para evitar actualizaciones innecesarias
            const { data: currentNotice } = await supabase.from('news').select('*').eq('id', 999999).maybeSingle();
            if (!currentNotice || currentNotice.title !== subject || !currentNotice.date.includes(now.toISOString().split('T')[0])) {
                await supabase.from('news').upsert({
                    id: 999999,
                    title: subject,
                    body: message,
                    date: now.toISOString()
                });
            }
        } else {
            // Eliminar si no hay cumpleaños (proceder con cautela si hay avisos manuales, pero ID 999999 es reservado para esto)
            const { data: currentNotice } = await supabase.from('news').select('*').eq('id', 999999).maybeSingle();
            if (currentNotice && currentNotice.title.includes('Cumpleaños')) {
                await supabase.from('news').delete().eq('id', 999999);
            }
        }

        const formatted = updatedData.map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            password: s.password,
            phone: s.phone,
            belt: s.belt || 'WHITE',
            classesAttended: s.classesattended,
            classesToNextBelt: s.classestonextbelt,
            lastPaymentMonth: s.lastpaymentmonth,
            lastPaymentDate: s.lastpaymentdate,
            isPaid: s.ispaid === true,
            plan: s.plan,
            monthlyFee: s.monthlyfee,
            avatar: s.avatar,
            birthDate: s.birthdate,
            history: Array.isArray(s.history) ? s.history : [],
            terms_accepted: s.terms_accepted === true,
            scheduledClasses: Array.isArray(s.scheduledclasses) ? s.scheduledclasses : []
        }));

        res.json(formatted);
        // syncStudentsBackground desactivado - sobreescribía cambios manuales del admin

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Función auxiliar para sincronización en segundo plano (últimos 6 meses)
async function syncStudentsBackground(students) {
    const mpPayment = new Payment(client);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const now = new Date();

    try {
        const result = await mpPayment.search({
            options: {
                status: 'approved',
                range: 'date_created',
                begin_date: sixMonthsAgo.toISOString(),
                end_date: now.toISOString(),
                limit: 100
            }
        });

        const payments = result.results || [];

        for (let student of students) {
            if (!student.email) continue;
            
            const studentEmail = student.email.toLowerCase();
            const studentName = student.name.toLowerCase();

            const matchedPayments = payments.filter(pay => {
                 const payerEmail = pay.payer?.email?.toLowerCase() || '';
                 const description = pay.description?.toLowerCase() || '';
                 return payerEmail === studentEmail || description.includes(studentName);
            });

            if (matchedPayments.length > 0) {
                 let anyUpdated = false;
                 matchedPayments.forEach(pay => {
                      const payDate = pay.date_approved ? pay.date_approved.split('T')[0] : pay.date_created.split('T')[0];
                      if (!student.history) student.history = [];
                      if (!student.history.some(h => h.transaction_id === pay.id.toString())) {
                           student.history.push({
                                date: payDate,
                                status: 'Completado',
                                amount: pay.transaction_amount,
                                method: 'Mercado Pago',
                                transaction_id: pay.id.toString()
                           });
                           student.isPaid = true;
                           student.lastPaymentDate = payDate;
                           student.lastPaymentMonth = payDate.substring(0, 7);
                           anyUpdated = true;
                      }
                 });

                 if (anyUpdated) {
                      const { error: updErr } = await supabase.from('students').update({
                           history: student.history,
                           ispaid: student.isPaid,
                           lastpaymentdate: student.lastPaymentDate,
                           lastpaymentmonth: student.lastPaymentMonth
                      }).eq('id', student.id);
                 }
            }
        }
    } catch (e) {
        console.error("--- Background Sync Failed ---", e.message || e);
    }
}

app.post('/api/students', async (req, res) => {
    try {
        const newId = Date.now().toString();
        const newStudent = { 
            id: newId,
            name: req.body.name,
            email: req.body.email || null,
            password: req.body.password || null,
            phone: req.body.phone || null,
            belt: req.body.belt || 'WHITE',
            classesattended: Number(req.body.classesAttended) || 0,
            classestonextbelt: Number(req.body.classesToNextBelt) || 40,
            ispaid: req.body.isPaid === true,
            plan: req.body.plan ? req.body.plan.toString() : null,
            monthlyfee: Number(req.body.monthlyFee) || null,
            avatar: req.body.avatar || null,
            birthdate: req.body.birthDate || null,
            history: Array.isArray(req.body.history) ? req.body.history : [],
            scheduledclasses: Array.isArray(req.body.scheduledClasses) ? req.body.scheduledClasses : []
        };
        const { error } = await supabase.from('students').insert(newStudent);
        if (error) throw error;
        
        // --- EVNIO AUTOMÁTICO AL REGISTRAR ---
        if (newStudent.email && newStudent.password && process.env.SMTP_HOST) {
            try {
                const smtpUser = process.env.SMTP_USER || process.env.SMTP_FROM;
                console.log(`📧 Enviando email de bienvenida a ${newStudent.email} via ${process.env.SMTP_HOST} (user: ${smtpUser})`);
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: { user: smtpUser, pass: process.env.SMTP_PASS }
                });
                const html = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; padding: 2.5rem; border-radius: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <h2 style="color: #05a86a; margin-top: 1rem; font-size: 1.8rem;">¡Hola ${newStudent.name}!</h2>
                            <p style="font-size: 1.1rem; color: #64748b; margin-top: 0.5rem;">Te damos la bienvenida al portal oficial de alumnos del <strong>Dojo Ranas</strong>.</p>
                        </div>
                        
                        <div style="background: #f8fafc; padding: 2rem; border-radius: 1.5rem; margin-bottom: 2rem; border: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 1rem 0; font-weight: 800; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">TUS DATOS DE ACCESO:</p>
                            <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Email:</strong> ${newStudent.email}</p>
                            <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Contraseña:</strong> <span style="background: #05a86a; color: #fff; padding: 2px 8px; border-radius: 6px;">${newStudent.password}</span></p>
                            
                            <a href="https://ranasjiujitsu.cl" style="display: block; background: #05a86a; color: #fff; padding: 1.2rem; text-decoration: none; border-radius: 1rem; font-weight: 800; text-align: center; margin-top: 2rem; box-shadow: 0 10px 20px rgba(5,168,106,0.2);">ENTRAR AL PORTAL 🥋</a>
                        </div>

                        <div style="margin-top: 2rem;">
                            <p style="font-weight: 800; font-size: 0.85rem; color: #64748b; text-transform: uppercase;">¿QUÉ PUEDES HACER EN EL PORTAL?</p>
                            <ul style="padding-left: 1.2rem; line-height: 1.6; color: #475569; font-size: 0.95rem;">
                                <li><strong>📅 Reservas Semanales:</strong> Gestiona tus días de entrenamiento.</li>
                                <li><strong>💳 Pago Online:</strong> Paga tu mensualidad vía Mercado Pago.</li>
                                <li><strong>🥋 Biblioteca Técnica:</strong> Revisa videos exclusivos de tu grado.</li>
                                <li><strong>📰 Noticias:</strong> Entérate de todo lo que pasa en el Dojo.</li>
                            </ul>
                        </div>

                        <p style="font-size: 0.85rem; color: #94a3b8; text-align: center; margin-top: 3rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
                            Te aconsejamos cambiar tu contraseña en la sección <strong>Mi Perfil</strong> al ingresar.<br>
                            <strong>Dojo Ranas Concepción</strong> - Orompello 1421
                        </p>
                    </div>
                `;
                transporter.sendMail({
                    from: '"Dojo Ranas 🐸" <' + (process.env.SMTP_FROM || smtpUser) + '>',
                    to: newStudent.email,
                    subject: 'Tus credenciales de acceso - Dojo Ranas 🐸',
                    html
                }).then(() => console.log(`✅ Email enviado a ${newStudent.email}`))
                  .catch(err => console.error("❌ Auto Welcome Mail Error:", err.message));
            } catch(e) { console.error("❌ SMTP Setup Error:", e.message); }
        }

        res.status(201).json({ ...req.body, id: newId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const updateData = {};
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.email !== undefined) updateData.email = req.body.email;
        if (req.body.phone !== undefined) updateData.phone = req.body.phone;
        if (req.body.password !== undefined) updateData.password = req.body.password;
        if (req.body.belt !== undefined) updateData.belt = req.body.belt;
        if (req.body.classesAttended !== undefined) updateData.classesattended = Number(req.body.classesAttended);
        if (req.body.classesToNextBelt !== undefined) updateData.classestonextbelt = Number(req.body.classesToNextBelt);
        if (req.body.isPaid !== undefined) updateData.ispaid = req.body.isPaid === true || req.body.isPaid === 'true';
        if (req.body.plan !== undefined) updateData.plan = req.body.plan ? req.body.plan.toString() : null;
        if (req.body.monthlyFee !== undefined) updateData.monthlyfee = Number(req.body.monthlyFee);
        if (req.body.birthDate !== undefined) updateData.birthdate = req.body.birthDate;
        if (req.body.avatar !== undefined) updateData.avatar = req.body.avatar;
        if (req.body.history !== undefined) updateData.history = req.body.history;
        if (req.body.lastPaymentDate !== undefined) updateData.lastpaymentdate = req.body.lastPaymentDate;
        if (req.body.lastPaymentMonth !== undefined) updateData.lastpaymentmonth = req.body.lastPaymentMonth;
        if (req.body.scheduledClasses !== undefined) updateData.scheduledclasses = req.body.scheduledClasses;

        console.log(`PUT /api/students/${req.params.id}`, JSON.stringify(updateData));
        const { error } = await supabase.from('students').update(updateData).eq('id', req.params.id);
        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }
        res.json({ ...req.body, id: req.params.id });
    } catch (error) {
        console.error('PUT student error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('students').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Alumno eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/students/:id/accept-terms', async (req, res) => {
    try {
        const { error } = await supabase.from('students').update({ terms_accepted: true }).eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Términos aceptados correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SYNC PAYMENTS FROM MERCADO PAGO ---
app.post('/api/students/:id/sync-payments', async (req, res) => {
    try {
        const { data: student, error: selectError } = await supabase.from('students').select('*').eq('id', req.params.id).single();
        if (selectError || !student) return res.status(404).json({ error: 'Alumno no encontrado' });

        const mpPayment = new Payment(client);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const searchFilters = {
            status: 'approved',
            range: 'date_created',
            begin_date: sixMonthsAgo.toISOString(),
            end_date: new Date().toISOString(),
            limit: 500,
            sort: 'date_created',
            criteria: 'desc'
        };

        const result = await mpPayment.search({ options: searchFilters });
        const payments = result.results || [];

        if (!student.email) return res.json({ message: "El alumno no tiene correo." });

        const studentEmail = student.email.toLowerCase();
        const studentName = student.name.toLowerCase();

        const newPayments = payments.filter(pay => {
             const payerEmail = pay.payer?.email?.toLowerCase() || '';
             const description = pay.description?.toLowerCase() || '';
             return payerEmail === studentEmail || description.includes(studentName);
        });

        let updatedCount = 0;
        const history = Array.isArray(student.history) ? student.history : [];

        newPayments.forEach(pay => {
            const payDate = pay.date_approved ? pay.date_approved.split('T')[0] : pay.date_created.split('T')[0];
            if (!history.some(h => h.transaction_id === pay.id.toString())) {
                history.push({
                    date: payDate,
                    status: 'Completado',
                    amount: pay.transaction_amount,
                    method: 'Mercado Pago',
                    transaction_id: pay.id.toString()
                });
                updatedCount++;
            }
        });

        const updatePayload = { history };
        if (updatedCount > 0) {
            const lastPay = [...history].sort((a, b) => b.date.localeCompare(a.date))[0];
            if (lastPay) {
                updatePayload.lastpaymentmonth = lastPay.date.substring(0, 7);
                updatePayload.ispaid = true;
                updatePayload.lastpaymentdate = lastPay.date;
            }
            await supabase.from('students').update(updatePayload).eq('id', req.params.id);
        }

        res.json({
            message: `Sincronización completada. Se encontraron ${newPayments.length} pagos en Mercado Pago.`,
            addedCount: updatedCount,
            student: { ...student, history, isPaid: updatePayload.ispaid || student.ispaid }
        });

    } catch (error) {
         res.status(500).json({ error: error.message });
    }
});

// Aceptar Términos y Condiciones
app.post('/api/students/:id/accept-terms', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('students')
            .update({ terms_accepted: true })
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Términos aceptados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Commission rate for Mercado Pago - Abono inmediato (ajustado para que por $40.000 el cobro sea $41.590)
const MP_COMMISSION_RATE = 0.03212;
const MP_IVA_ON_COMMISSION = 0.19;

function calculateSurcharge(baseAmount) {
    // To ensure dojo receives exactly baseAmount after MP deducts commission:
    // chargeAmount = baseAmount / (1 - commissionRate * (1 + IVA))
    const effectiveRate = MP_COMMISSION_RATE * (1 + MP_IVA_ON_COMMISSION);
    const chargeAmount = Math.ceil(baseAmount / (1 - effectiveRate));
    const surcharge = chargeAmount - baseAmount;
    return { chargeAmount, surcharge, effectiveRate };
}

app.post('/api/checkout', async (req, res) => {
    try {
        const { student, students, amount, withSurcharge } = req.body;
        const isGroup = Array.isArray(students) && students.length > 0;

        // If withSurcharge, inflate each item's price to cover MP commission
        const items = isGroup ? students.map(s => {
            const base = Number(s.monthlyFee || s.monthlyfee || (amount / students.length));
            const price = withSurcharge ? calculateSurcharge(base).chargeAmount : base;
            return {
                id: s.id,
                title: `Mensualidad Fam. Ranas - ${s.name}`,
                quantity: 1,
                currency_id: 'CLP',
                unit_price: price
            };
        }) : [
            {
                id: student.id,
                title: `Mensualidad Dojo Ranas - ${student.name}`,
                quantity: 1,
                currency_id: 'CLP',
                unit_price: withSurcharge ? calculateSurcharge(Number(amount)).chargeAmount : Number(amount)
            }
        ];

        const totalCharged = items.reduce((acc, i) => acc + i.unit_price, 0);
        console.log(`[CHECKOUT] Amount: $${amount}, WithSurcharge: ${!!withSurcharge}, Total charged: $${totalCharged}`);

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: items,
                payer: {
                    email: isGroup ? students[0].email : student.email
                },
                external_reference: isGroup ? students.map(s => s.id).join(',') : student.id.toString(),
                back_urls: {
                    success: (process.env.FRONTEND_URL || 'http://localhost:5173') + '?payment=success',
                    failure: (process.env.FRONTEND_URL || 'http://localhost:5173') + '?payment=failure',
                    pending: (process.env.FRONTEND_URL || 'http://localhost:5173') + '?payment=pending'
                },
                auto_return: "approved",
                notification_url: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/webhooks` : 'https://dojo-demo-server.onrender.com/api/webhooks'
            }
        });

        res.json({ init_point: result.init_point, totalCharged, surcharge: withSurcharge ? (totalCharged - amount) : 0 });
    } catch (error) {
        console.error('MP Preference Error:', error);
        res.status(500).json({ error: 'Failed to create payment link' });
    }
});

// Enviar recordatorio de pago individual
app.post('/api/students/:id/send-payment-reminder', async (req, res) => {
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return res.status(400).json({ error: 'Configuración SMTP incompleta' });
        }
        
        const { data: student, error: selectError } = await supabase.from('students').select('*').eq('id', req.params.id).single();
        if (selectError || !student) return res.status(404).json({ error: 'Alumno no encontrado' });
        if (!student.email) return res.status(400).json({ error: 'Alumno sin correo configurado' });
        if (!student.monthlyfee) return res.status(400).json({ error: 'Alumno no tiene mensualidad configurada' });

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: `Mensualidad Dojo Ranas - ${student.name}`,
                        quantity: 1,
                        currency_id: 'CLP',
                        unit_price: Number(student.monthlyfee)
                    }
                ],
                payer: { email: student.email },
                back_urls: {
                    success: (process.env.FRONTEND_URL || 'http://localhost:5173') + '?payment=success',
                    failure: (process.env.FRONTEND_URL || 'http://localhost:5173') + '?payment=failure',
                    pending: (process.env.FRONTEND_URL || 'http://localhost:5173') + '?payment=pending'
                },
                auto_return: "approved",
                notification_url: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/webhooks` : 'https://dojo-demo-server.onrender.com/api/webhooks'
            }
        });

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
            from: `"Dojo Ranas" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: student.email,
            subject: 'Aviso de Cobro Mensual - Dojo Ranas 🐸',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #05a86a;">¡Hola ${student.name}!</h2>
                    <p>Esperamos que estés teniendo un gran mes de entrenamiento. Te recordamos que tu pago mensual se encuentra pendiente.</p>
                    <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; font-size: 1.2rem;"><strong>Mensualidad:</strong> $${student.monthlyfee.toLocaleString('es-CL')}</p>
                        <a href="${result.init_point}" style="display: inline-block; background: #009ee3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">
                            Pagar con Mercado Pago
                        </a>
                    </div>
                    <p style="font-size: 0.9rem; color: #666;">También puedes revisar tu estado de cuenta iniciando sesión en nuestro portal de alumnos.</p>
                    <p>¡Nos vemos en el tatami!</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8rem; color: #999;">Dojo Ranas Team - Orompello 1421</p>
                </div>
            `,
        });

        res.json({ success: true, message: 'Recordatorio enviado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generar contraseñas para los que no tienen (Alumnos Antiguos)
app.post('/api/admin/generate-passwords', async (req, res) => {
    try {
        const { data: students, error: selectError } = await supabase.from('students').select('*').is('password', null);
        if (selectError) throw selectError;

        let counts = 0;
        for (const s of (students || [])) {
            const pass = Math.random().toString(36).slice(-6).toUpperCase();
            await supabase.from('students').update({ password: pass }).eq('id', s.id);
            counts++;
        }
        res.json({ success: true, count: counts });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Enviar credenciales (contraseñas masivas)
app.post('/api/admin/send-credentials', async (req, res) => {
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return res.status(400).json({ error: 'Configuración SMTP incompleta en el archivo .env' });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Asegúrate de que los estudiantes vivan con password disponible
        let { data: students, error: selectError } = await supabase.from('students').select('*');
        if (selectError) throw selectError;

        // Filtrar según el grupo solicitado
        const { ageGroup, customSubject, customMessage } = req.body; // 'ALL', 'KIDS', 'ADULTS'
        if (ageGroup && ageGroup !== 'ALL') {
            const today = new Date();
            students = students.filter(s => {
                if (!s.birthdate) return ageGroup === 'ADULTS';
                const bd = new Date(s.birthdate);
                let age = today.getFullYear() - bd.getFullYear();
                const m = today.getMonth() - bd.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
                return ageGroup === 'KIDS' ? age < 18 : age >= 18;
            });
        }

        let sentCount = 0;
        let errors = [];

        for (const student of students) {
            if (!student.email || !student.password) continue;

            try {
                // Template default si no viene customMessage
                let finalSubject = customSubject || 'Tus credenciales de acceso - Dojo Ranas 🐸';
                let finalHtml = customMessage || `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; padding: 2.5rem; border-radius: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <h2 style="color: #05a86a; margin-top: 1rem; font-size: 1.8rem;">¡Hola {{name}}!</h2>
                            <p style="font-size: 1.1rem; color: #64748b; margin-top: 0.5rem;">Te enviamos tus credenciales para acceder al portal oficial de <strong>Dojo Ranas</strong>.</p>
                        </div>
                        
                        <div style="background: #f8fafc; padding: 2rem; border-radius: 1.5rem; margin-bottom: 2rem; border: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 1rem 0; font-weight: 800; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">DATOS DE ACCESO:</p>
                            <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Email:</strong> {{email}}</p>
                            <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Contraseña:</strong> <span style="background: #05a86a; color: #fff; padding: 2px 8px; border-radius: 6px;">{{password}}</span></p>
                            
                            <a href="https://ranasjiujitsu.cl" style="display: block; background: #05a86a; color: #fff; padding: 1.2rem; text-decoration: none; border-radius: 1rem; font-weight: 800; text-align: center; margin-top: 2rem; box-shadow: 0 10px 20px rgba(5,168,106,0.2);">ENTRAR AL PORTAL 🥋</a>
                        </div>

                        <div style="margin-top: 2rem;">
                            <p style="font-weight: 800; font-size: 0.85rem; color: #64748b; text-transform: uppercase;">¿QUÉ PUEDES HACER EN EL PORTAL?</p>
                            <ul style="padding-left: 1.2rem; line-height: 1.6; color: #475569; font-size: 0.95rem;">
                                <li><strong>📅 Reservas Semanales:</strong> Organiza tus entrenamientos.</li>
                                <li><strong>💳 Pago Online:</strong> Gestiona tu mensualidad con Mercado Pago.</li>
                                <li><strong>🥋 Biblioteca Técnica:</strong> Videos exclusivos según tu cinturón.</li>
                                <li><strong>📰 Noticias:</strong> Todo lo que necesitas saber del Dojo.</li>
                            </ul>
                        </div>

                        <p style="font-size: 0.85rem; color: #94a3b8; text-align: center; margin-top: 3rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
                            Te aconsejamos cambiar tu contraseña en la sección <strong>Mi Perfil</strong> al ingresar.<br>
                            <strong>Dojo Ranas Concepción</strong> - Orompello 1421
                        </p>
                    </div>
                `;

                // Reemplazos dinámicos
                finalHtml = finalHtml
                    .replace(/{{name}}/g, student.name)
                    .replace(/{{email}}/g, student.email)
                    .replace(/{{password}}/g, student.password);

                await transporter.sendMail({
                    from: `"Dojo Ranas" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                    to: student.email,
                    subject: finalSubject,
                    html: finalHtml,
                });
                sentCount++;
            } catch (e) {
                errors.push({ email: student.email, error: e.message });
            }
        }

        res.json({ success: true, message: `Acaban de enviarse ${sentCount} correos con éxito.`, errors });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint (for self-ping keep-alive)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Mercado Pago: Webhook
app.post('/api/webhooks', async (req, res) => {
    console.log('--- WEBHOOK RECEIVED ---', JSON.stringify(req.body));

    // Respond IMMEDIATELY so Mercado Pago doesn't timeout
    res.sendStatus(200);

    // Mercado Pago manda el ID de diferentes formas dependiendo del evento
    const paymentId = req.body.data?.id || req.body.id;
    const action = req.body.action || req.body.type;

    if (!paymentId) {
        console.log('No payment ID found in webhook body');
        return;
    }

    try {
        const mpPayment = new Payment(client);
        const payDetails = await mpPayment.get({ id: paymentId });

        if (payDetails.status === 'approved') {
            const payerEmail = payDetails.payer.email;
            const amount = payDetails.transaction_amount;
            const payDate = payDetails.date_approved.split('T')[0];

            console.log(`Payment Approved: ${paymentId} - Email: ${payerEmail} - Amount: ${amount}`);

            // Buscamos alumno(s) en Supabase usando Preferencia de ID
            const externalRef = payDetails.external_reference;
            let studentIds = [];

            if (externalRef) {
                studentIds = externalRef.split(',');
            }

            if (studentIds.length === 0) {
                const desc = (payDetails.description || '').toLowerCase();
                const pEmail = (payerEmail || '').toLowerCase();
                const { data: allStudents } = await supabase.from('students').select('id, email, name');
                if (allStudents) {
                    const matchedStudent = allStudents.find(s => {
                        if (!s.email) return false;
                        const sEmail = s.email.toLowerCase();
                        return sEmail === pEmail || desc.includes(sEmail);
                    });
                    if (matchedStudent) {
                        studentIds.push(matchedStudent.id);
                    } else {
                        const matchedByName = allStudents.find(s => s.name && desc.includes(s.name.toLowerCase()));
                        if (matchedByName) studentIds.push(matchedByName.id);
                    }
                }
            }

            if (studentIds.length > 0) {
                const historyAmount = studentIds.length > 1 ? (amount / studentIds.length) : amount;
                
                for (const sid of studentIds) {
                    const { data: student } = await supabase.from('students').select('*').eq('id', sid.trim()).maybeSingle();
                    if (student) {
                        const history = Array.isArray(student.history) ? student.history : [];
                        if (!history.some(h => h.transaction_id === paymentId.toString())) {
                            history.push({
                                date: payDate,
                                status: 'Completado',
                                amount: historyAmount,
                                method: studentIds.length > 1 ? 'Mercado Pago (Familiar)' : 'Mercado Pago',
                                transaction_id: paymentId.toString()
                            });

                            await supabase.from('students').update({
                                history: history,
                                ispaid: true,
                                lastpaymentdate: payDate,
                                lastpaymentmonth: payDate.substring(0, 7)
                            }).eq('id', student.id);

                            console.log(`Student ${student.name} updated successfully via Webhook.`);
                        } else {
                            console.log(`Payment already exists in history for ${student.name}. Skipping.`);
                        }
                    }
                }
            } else {
                console.warn(`No student found for email: ${payerEmail} and no External Ref. Payment ${paymentId} received but not linked.`);
            }
        } else {
            console.log(`Payment ${paymentId} status: ${payDetails.status}. No action taken.`);
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
    }
});


// Saludos de hoy - Solo como gatillo manual si se necesita forzar
app.post('/api/admin/check-birthdays', async (req, res) => {
    try {
        const { data: students, error } = await supabase.from('students').select('*');
        if (error) throw error;

        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const searchDate = `-${mm}-${dd}`;

        const birthdayStudents = students.filter(s => s.birthdate && s.birthdate.includes(searchDate));
        
        if (birthdayStudents.length > 0) {
            const names = birthdayStudents.map(s => s.name.split(' ')[0]).join(', ');
            const subject = '🎂 ¡Felices Cumpleaños de Hoy!';
            const message = `Hoy saludamos especialmente a: **${names}**. ¡Que tengan un excelente día de parte de su Dojo Ranas! 🥋🐸`;
            
            await supabase.from('news').upsert({
                id: 999999,
                title: subject,
                body: message,
                date: now.toISOString(),
                stats: [],
                link: '#',
                img: '',
                label: 'Aviso del Dojo'
            });

            // Also save to noticeFile since GET /api/global-notice reads it
            writeData(noticeFile, { subject, message, date: now.toISOString() });

            res.json({ success: true, message: `Aviso global publicado para: ${names}` });
        } else {
            res.json({ success: true, message: 'No hay alumnos de cumpleaños hoy.' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Broadcast global (Notificación en App Exclusivamente)
app.post('/api/admin/broadcast', async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) return res.status(400).json({ error: 'Asunto y mensaje requeridos' });

        const noticeData = {
            subject,
            message,
            date: new Date().toISOString()
        };
        
        // Persistencia en Render vía Supabase (Usamos ID reservado 999999 en tabla news)
        try {
            await supabase.from('news').upsert({
                id: 999999,
                title: subject,
                body: message,
                date: noticeData.date,
                stats: [],
                link: '#',
                img: '',
                label: 'Aviso del Dojo'
            });
        } catch (supaErr) {
            console.error('Error saving notice to Supabase:', supaErr);
        }

        writeData(noticeFile, noticeData);
        res.json({ success: true, message: `Aviso publicado en los portales de todos los alumnos.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/global-notice', async (req, res) => {
    try {
        const { data: supaNotice, error } = await supabase.from('news').select('*').eq('id', 999999).maybeSingle();
        if (supaNotice) {
            // If it's a birthday notice, check if it's still today in Chile timezone
            if (supaNotice.title && supaNotice.title.includes('Cumpleaños') && supaNotice.date) {
                const noticeDate = new Date(supaNotice.date);
                const nowChile = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Santiago' }));
                const noticeDateChile = new Date(noticeDate.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
                // Compare only the date part (year-month-day) in Chile time
                if (nowChile.getFullYear() !== noticeDateChile.getFullYear() ||
                    nowChile.getMonth() !== noticeDateChile.getMonth() ||
                    nowChile.getDate() !== noticeDateChile.getDate()) {
                    // Birthday notice expired — delete it and return null
                    await supabase.from('news').delete().eq('id', 999999);
                    return res.json(null);
                }
            }
            return res.json({ subject: supaNotice.title, message: supaNotice.body });
        }

        if (fs.existsSync(noticeFile)) {
            try {
                const raw = fs.readFileSync(noticeFile, 'utf-8');
                const parsed = JSON.parse(raw);
                if (parsed && Object.keys(parsed).length > 0) {
                    if (parsed.subject && parsed.subject.includes('Cumpleaños') && parsed.date) {
                        const noticeDate = new Date(parsed.date);
                        const nowChile = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Santiago' }));
                        const noticeDateChile = new Date(noticeDate.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
                        if (nowChile.getFullYear() !== noticeDateChile.getFullYear() ||
                            nowChile.getMonth() !== noticeDateChile.getMonth() ||
                            nowChile.getDate() !== noticeDateChile.getDate()) {
                            // Local fallback notice expired — clear it and return null
                            fs.writeFileSync(noticeFile, '{}', 'utf-8');
                            return res.json(null);
                        }
                    }
                    return res.json(parsed);
                }
            } catch (e) {
                // Ignore parse errors on empty local files
            }
        }
        res.json(null);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================
// AUTO-SYNC: Transferencias MP
// ============================
async function syncTransferPayments() {
    console.log('[SYNC] Iniciando sincronización de transferencias MP...');
    try {
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

        // Get MP payments from last 45 days
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

        const payments = (result.results || []).filter(p =>
            p.status === 'approved' &&
            (p.operation_type === 'money_transfer' || p.operation_type === 'regular_payment')
        );

        let synced = 0;
        let details = [];

        for (const payment of payments) {
            const payerEmail = payment.payer?.email?.toLowerCase();
            const extRef = payment.external_reference;
            const payDate = payment.date_created?.split('T')[0] || new Date().toISOString().split('T')[0];
            const payMonth = payDate.substring(0, 7);
            const amount = payment.transaction_amount;
            const isTransfer = payment.operation_type === 'money_transfer';

            // Try to match by external_reference first (checkout payments)
            let matchedStudentIds = [];
            if (extRef && !extRef.startsWith('money_transfer') && !extRef.includes('-')) {
                matchedStudentIds = extRef.split(',').map(id => id.trim());
            }

            // Then try by email (transfers)
            if (matchedStudentIds.length === 0 && payerEmail) {
                const matched = emailToStudents[payerEmail] || [];
                matchedStudentIds = matched.map(s => s.id.toString());
            }

            // Search in description (glosa) for ID pattern or any registered email
            if (matchedStudentIds.length === 0 && payment.description) {
                // Check ID: pattern
                const idMatch = payment.description.match(/\bID[:\s]*(\d+)\b/i);
                if (idMatch) {
                    const potentialId = idMatch[1];
                    const found = students.find(s => s.id.toString() === potentialId);
                    if (found) matchedStudentIds.push(potentialId);
                }

                // If still no match, look for any email matching a student
                if (matchedStudentIds.length === 0) {
                    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                    const emailsInDesc = payment.description.match(emailRegex);
                    if (emailsInDesc) {
                        for (const emailToken of emailsInDesc) {
                            const normalized = emailToken.toLowerCase().trim();
                            const matches = emailToStudents[normalized];
                            if (matches && matches.length > 0) {
                                matchedStudentIds = matches.map(s => s.id.toString());
                                break; 
                            }
                        }
                    }
                }
            }

            if (matchedStudentIds.length === 0) continue;

            const perStudentAmount = matchedStudentIds.length > 1 ? Math.round(amount / matchedStudentIds.length) : amount;

            for (const sid of matchedStudentIds) {
                const student = students.find(s => s.id.toString() === sid.toString());
                if (!student) continue;

                const history = Array.isArray(student.history) ? student.history : [];
                const txId = payment.id.toString();

                // Skip if already registered
                if (history.some(h => h.transaction_id === txId)) continue;

                history.push({
                    date: payDate,
                    status: 'Completado',
                    amount: perStudentAmount,
                    method: isTransfer ? 'Transferencia MP' : 'Mercado Pago',
                    transaction_id: txId
                });

                const { error: upErr } = await supabase.from('students').update({
                    history: history,
                    ispaid: true,
                    lastpaymentdate: payDate,
                    lastpaymentmonth: payMonth
                }).eq('id', student.id);

                if (!upErr) {
                    synced++;
                    details.push({ name: student.name, amount: perStudentAmount, type: isTransfer ? 'transfer' : 'checkout', txId });
                    console.log(`[SYNC] ✅ ${student.name} - $${perStudentAmount} (${isTransfer ? 'Transferencia' : 'Checkout'}) - TX: ${txId}`);
                }
            }
        }

        console.log(`[SYNC] Completado: ${synced} pagos sincronizados`);
        return { synced, details };
    } catch (e) {
        console.error('[SYNC ERROR]', e.message);
        return { synced: 0, error: e.message };
    }
}

// Transfer intent: student declares they have made a transfer
const transferIntentsFile = path.join(dbPath, 'transfer_intents.json');
app.post('/api/transfer-intent', async (req, res) => {
    try {
        const { studentIds, reference, amount, date } = req.body;
        const intents = readData(transferIntentsFile) || [];
        intents.push({
            studentIds,
            reference,
            amount,
            date: date || new Date().toISOString(),
            matched: false
        });
        writeData(transferIntentsFile, intents);
        console.log(`[TRANSFER-INTENT] Registered: ${reference} for students ${studentIds.join(',')} - $${amount}`);
        res.json({ success: true, message: 'Intent registrado correctamente' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ======================================
// REPAIR: Inconsistent Student Profiles
// ======================================
async function repairInconsistentProfiles() {
    console.log('[REPAIR] Iniciando escaneo de perfiles inconsistentes...');
    try {
        const { data: students, error } = await supabase.from('students').select('*');
        if (error) throw error;

        const now = DateTime.now().setZone('America/Santiago');
        const currentMonth = now.toFormat('yyyy-MM');
        let repairedCount = 0;

        for (const student of students) {
            const history = Array.isArray(student.history) ? student.history : [];
            // Check if there is a completed payment in the current month
            const hasRecentPayment = history.some(h => 
                h.status === 'Completado' && 
                h.date && h.date.startsWith(currentMonth)
            );

            // If they paid this month but are marked as unpaid, FIX THEM
            if (hasRecentPayment && student.ispaid === false) {
                console.log(`[REPAIR] 🔧 Reparando perfil de ${student.name} (ID: ${student.id}) - Tenía pago en ${currentMonth} pero estaba como No Pagado.`);
                
                // Find the latest payment date in history to use as lastpaymentdate
                const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
                const lastPay = sortedHistory.find(h => h.status === 'Completado');
                
                if (lastPay) {
                    const { error: updErr } = await supabase.from('students').update({
                        ispaid: true,
                        lastpaymentdate: lastPay.date,
                        lastpaymentmonth: lastPay.date.substring(0, 7)
                    }).eq('id', student.id);
                    
                    if (!updErr) repairedCount++;
                }
            }
        }

        if (repairedCount > 0) {
            console.log(`[REPAIR] Sincronización finalizada. Se repararon ${repairedCount} perfiles.`);
        }
        return repairedCount;
    } catch (e) {
        console.error('[REPAIR ERROR]', e.message);
        return 0;
    }
}

// API endpoint for manual repair trigger
app.post('/api/admin/repair-profiles', async (req, res) => {
    try {
        const repaired = await repairInconsistentProfiles();
        res.json({ success: true, repaired });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API endpoint for manual sync trigger
app.post('/api/admin/sync-transfers', async (req, res) => {
    try {
        const result = await syncTransferPayments();
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// CRON: Auto-sync transfers every 10 minutes + Repair
cron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Auto-sync y Repair (10 min)...');
    await syncTransferPayments();
    await repairInconsistentProfiles();
}, {
    scheduled: true,
    timezone: "America/Santiago"
});

// Automatización diaria de cumpleaños y escaneo profundo (09:00 Hora de Chile)
cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Iniciando verificación diaria (09:00 Chile)...');
    
    // 1. Repair Inconsistent Profiles
    await repairInconsistentProfiles();

    // 2. Birthdays
    try {
        const { data: students, error } = await supabase.from('students').select('*');
        if (error) throw error;

        const chileTime = DateTime.now().setZone('America/Santiago');
        const mm = String(chileTime.month).padStart(2, '0');
        const dd = String(chileTime.day).padStart(2, '0');
        const searchDate = `-${mm}-${dd}`;

        const birthdayStudents = students.filter(s => s.birthdate && s.birthdate.includes(searchDate));
        
        if (birthdayStudents.length > 0) {
            const names = birthdayStudents.map(s => s.name.split(' ')[0]).join(', ');
            const subject = '🎂 ¡Felices Cumpleaños de Hoy!';
            const message = `Hoy saludamos especialmente a **${names}** en su día. ¡Que tengas un excelente cumpleaños y nos vemos pronto en el Dojo! 🥋🐸`;
            
            await supabase.from('news').upsert({
                id: 999999,
                title: subject,
                body: message,
                date: chileTime.toISO()
            });
            console.log(`[CRON] Aviso de cumpleaños publicado: ${names}`);
        } else {
            console.log('[CRON] No hay cumpleaños el día de hoy.');
            await supabase.from('news').delete().eq('id', 999999);
        }
    } catch (e) {
        console.error('[CRON ERROR] Error en la tarea programada:', e.message);
    }
// --- FEES & AUTOMATION PERSISTENCE (Using reserved news IDs) ---
app.get('/api/fees', async (req, res) => {
    try {
        const { data, error } = await supabase.from('news').select('*').eq('id', 999998).maybeSingle();
        if (data && data.body) {
            return res.json(JSON.parse(data.body));
        }
        // Default fallback if not found
        res.json({
            adults: { '1': 5000, '2': 35000, '3': 40000, '4': 45000, 'Ilimitado': 50000 },
            kids: { '1': 5000, '2': 35000, '3': 40000, '4': 45000, 'Ilimitado': 50000 }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/fees', async (req, res) => {
    try {
        const { error } = await supabase.from('news').upsert({
            id: 999998,
            title: 'SYSTEM_FEES',
            body: JSON.stringify(req.body),
            date: new Date().toISOString()
        });
        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/automation', async (req, res) => {
    try {
        const { data, error } = await supabase.from('news').select('*').eq('id', 999997).maybeSingle();
        if (data && data.body) {
            return res.json(JSON.parse(data.body));
        }
        res.json({ reminderDay: 5, whatsappTemplate: "Hola {nombre}...", emailTemplate: "Hola {nombre}..." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/automation', async (req, res) => {
    try {
        const { error } = await supabase.from('news').upsert({
            id: 999997,
            title: 'SYSTEM_AUTOMATION',
            body: JSON.stringify(req.body),
            date: new Date().toISOString()
        });
        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("- MP Token exists:", !!process.env.VITE_MP_ACCESS_TOKEN);

    // Run initial sync on startup to catch any missed payments while server was sleeping
    setTimeout(async () => {
        console.log('[STARTUP] Running initial payment sync...');
        try {
            const result = await syncTransferPayments();
            console.log(`[STARTUP] Initial sync complete: ${result.synced} payments synced`);
        } catch (e) {
            console.error('[STARTUP] Initial sync failed:', e.message);
        }
    }, 5000);

    // Self-ping every 14 minutes to prevent Render from sleeping
    const BACKEND_URL = process.env.BACKEND_URL || 'https://dojo-demo-server.onrender.com';
    setInterval(() => {
        fetch(`${BACKEND_URL}/health`)
            .then(r => r.json())
            .then(d => console.log(`[KEEP-ALIVE] Ping OK - uptime: ${Math.round(d.uptime)}s`))
            .catch(e => console.error('[KEEP-ALIVE] Ping failed:', e.message));
    }, 14 * 60 * 1000); // 14 minutes
});
