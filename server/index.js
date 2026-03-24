import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

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
app.use(express.json());

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

// News
app.get('/api/news', (req, res) => {
    try {
        res.json(readData(newsFile) || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/news', (req, res) => {
    try {
        writeData(newsFile, req.body);
        res.status(200).json(req.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gallery
app.get('/api/gallery', (req, res) => {
    try {
        res.json(readData(galleryFile) || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/gallery', (req, res) => {
    try {
        writeData(galleryFile, req.body);
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

        const formatted = data.map(s => ({
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
            history: Array.isArray(s.history) ? s.history : []
        }));

        res.json(formatted);
        syncStudentsBackground(formatted);

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
            history: Array.isArray(req.body.history) ? req.body.history : []
        };
        const { error } = await supabase.from('students').insert(newStudent);
        if (error) throw error;
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
        if (req.body.isPaid !== undefined) updateData.ispaid = req.body.isPaid === true;
        if (req.body.plan !== undefined) updateData.plan = req.body.plan ? req.body.plan.toString() : null;
        if (req.body.monthlyFee !== undefined) updateData.monthlyfee = Number(req.body.monthlyFee);
        if (req.body.birthDate !== undefined) updateData.birthdate = req.body.birthDate;
        if (req.body.avatar !== undefined) updateData.avatar = req.body.avatar;
        if (req.body.history !== undefined) updateData.history = req.body.history;
        if (req.body.lastPaymentDate !== undefined) updateData.lastpaymentdate = req.body.lastPaymentDate;
        if (req.body.lastPaymentMonth !== undefined) updateData.lastpaymentmonth = req.body.lastPaymentMonth;

        const { error } = await supabase.from('students').update(updateData).eq('id', req.params.id);
        if (error) throw error;
        res.json({ ...req.body, id: req.params.id });
    } catch (error) {
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
            limit: 100
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

app.post('/api/checkout', async (req, res) => {
    try {
        const { student, amount } = req.body;

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: `Mensualidad Dojo Ranas - ${student.name}`,
                        quantity: 1,
                        currency_id: 'CLP',
                        unit_price: Number(amount)
                    }
                ],
                payer: {
                    email: student.email
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?payment=success`,
                    failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?payment=failure`,
                    pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?payment=pending`,
                },
                auto_return: "approved",
                notification_url: `${process.env.BACKEND_URL}/api/webhooks`
            }
        });

        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error('MP Preference Error:', error);
        res.status(500).json({ error: 'Failed to create payment link' });
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
        // Aquí asumimos que students vive en Supabase!
        const { data: students, error: selectError } = await supabase.from('students').select('*');
        if (selectError) throw selectError;

        let sentCount = 0;
        let errors = [];

        for (const student of students) {
            if (!student.email || !student.password) continue;

            try {
                await transporter.sendMail({
                    from: `"Dojo Ranas" <${process.env.SMTP_USER}>`,
                    to: student.email,
                    subject: 'Tus credenciales de acceso - Dojo Ranas 🐸',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                            <h2 style="color: #05a86a;">¡Hola ${student.name}!</h2>
                            <p>Te enviamos tus datos de acceso para la plataforma de <strong>Dojo Ranas Administration</strong>.</p>
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Usuario:</strong> ${student.email}</p>
                                <p style="margin: 5px 0;"><strong>Contraseña Provisional:</strong> ${student.password}</p>
                            </div>
                            <p style="font-size: 0.9rem; color: #666;">Te aconsejamos cambiar tu contraseña una vez hayas iniciado sesión en tu perfil. 👍</p>
                            <p>¡Nos vemos en el tatami!</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 0.8rem; color: #999;">Dojo Ranas - Lautaro 581</p>
                        </div>
                    `,
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

// Mercado Pago: Webhook
app.post('/api/webhooks', async (req, res) => {
    console.log('--- WEBHOOK RECEIVED ---');

    // Mercado Pago manda el ID de diferentes formas dependiendo del evento
    const paymentId = req.body.data?.id || req.body.id;
    const action = req.body.action || req.body.type;

    if (!paymentId) {
        console.log('No payment ID found in webhook body');
        return res.sendStatus(200);
    }

    try {
        const mpPayment = new Payment(client);
        const payDetails = await mpPayment.get({ id: paymentId });

        if (payDetails.status === 'approved') {
            const payerEmail = payDetails.payer.email;
            const amount = payDetails.transaction_amount;
            const payDate = payDetails.date_approved.split('T')[0];

            console.log(`Payment Approved: ${paymentId} - Email: ${payerEmail} - Amount: ${amount}`);

            // Buscamos alumno en Supabase
            const { data: student, error: selectError } = await supabase
                .from('students')
                .select('*')
                .eq('email', payerEmail.toLowerCase())
                .maybeSingle();

            if (selectError) throw selectError;

            if (student) {
                const history = Array.isArray(student.history) ? student.history : [];
                if (!history.some(h => h.transaction_id === paymentId.toString())) {
                    history.push({
                        date: payDate,
                        status: 'Completado',
                        amount: amount,
                        method: 'Mercado Pago',
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
                    console.log('Payment already exists in history. Skipping.');
                }
            } else {
                console.warn(`No student found for email: ${payerEmail}. Payment ${paymentId} received but not linked.`);
            }
        } else {
            console.log(`Payment ${paymentId} status: ${payDetails.status}. No action taken.`);
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
    }

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("- MP Token exists:", !!process.env.VITE_MP_ACCESS_TOKEN);
});
