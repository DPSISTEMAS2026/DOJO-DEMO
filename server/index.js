import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const studentsFile = path.join(dbPath, 'students.json');
const videosFile = path.join(dbPath, 'videos.json');

// Helpers to read/write JSON
const readData = (file) => {
    if (!fs.existsSync(file)) {
        console.warn(`File not found: ${file}`);
        return [];
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    console.log(`Loaded ${data.length} items from ${path.basename(file)}`);
    return data;
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
};

// --- ROUTES ---

// Videos
app.get('/api/videos', (req, res) => {
    res.json(readData(videosFile));
});

app.post('/api/videos', (req, res) => {
    const videos = readData(videosFile);
    const newVideo = { ...req.body, id: Date.now().toString() };
    videos.push(newVideo);
    writeData(videosFile, videos);
    res.status(201).json(newVideo);
});

// Students with automatic background sync
app.get('/api/students', async (req, res) => {
    const students = readData(studentsFile);
    const mpPayment = new Payment(client);

    // Configurar rango de 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const now = new Date();

    let anyUpdated = false;

    // Sincronizar cada alumno que tenga email (en segundo plano o secuencial para asegurar data)
    for (let student of students) {
        if (!student.email) continue;

        try {
            const result = await mpPayment.search({
                options: {
                    status: 'approved',
                    range: 'date_created',
                    begin_date: sixMonthsAgo.toISOString(),
                    end_date: now.toISOString(),
                    'payer.email': student.email
                }
            });

            const payments = result.results || [];
            payments.forEach(pay => {
                const payDate = pay.date_approved.split('T')[0];
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
        } catch (e) {
            console.error(`Sync failed for ${student.email}:`, e.message);
        }
    }

    if (anyUpdated) {
        writeData(studentsFile, students);
    }

    res.json(students);
});

app.post('/api/students', (req, res) => {
    const students = readData(studentsFile);
    const newId = Date.now().toString();
    const newStudent = { ...req.body, id: newId };
    students.push(newStudent);
    writeData(studentsFile, students);
    res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
    let students = readData(studentsFile);
    const index = students.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
        students[index] = { ...students[index], ...req.body };
        writeData(studentsFile, students);
        res.json(students[index]);
    } else {
        res.status(404).json({ error: 'Student not found' });
    }
});

// --- SYNC PAYMENTS FROM MERCADO PAGO ---
app.post('/api/students/:id/sync-payments', async (req, res) => {
    try {
        const students = readData(studentsFile);
        const student = students.find(s => s.id === req.params.id);
        if (!student) return res.status(404).json({ error: 'Alumno no encontrado' });

        const mpPayment = new Payment(client);

        // Buscamos pagos aprobados de este email en los últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const searchFilters = {
            status: 'approved',
            range: 'date_created',
            begin_date: sixMonthsAgo.toISOString(),
            end_date: new Date().toISOString(),
            'payer.email': student.email
        };

        const result = await mpPayment.search({ options: searchFilters });

        const newPayments = result.results || [];
        let updatedCount = 0;

        newPayments.forEach(pay => {
            const payDate = pay.date_approved.split('T')[0];
            // Si el pago no está en el historial, lo agregamos
            if (!student.history.some(h => h.transaction_id === pay.id.toString())) {
                student.history.push({
                    date: payDate,
                    status: 'Completado',
                    amount: pay.transaction_amount,
                    method: 'Mercado Pago',
                    transaction_id: pay.id.toString()
                });
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            // Actualizar estado de pago si encontramos algo reciente
            const lastPay = [...student.history].sort((a, b) => b.date.localeCompare(a.date))[0];
            if (lastPay) {
                student.lastPaymentMonth = lastPay.date.substring(0, 7);
                student.isPaid = true;
                student.lastPaymentDate = lastPay.date;
            }
            writeData(studentsFile, students);
        }

        res.json({
            message: `Sincronización completada. Se encontraron ${newPayments.length} pagos en Mercado Pago.`,
            addedCount: updatedCount,
            student
        });

    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: 'Error al sincronizar con Mercado Pago' });
    }
});

// Mercado Pago: Create Preference
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

            const students = readData(studentsFile);
            // Buscamos al alumno por email (o email del tutor)
            const student = students.find(s => s.email.toLowerCase() === payerEmail.toLowerCase());

            if (student) {
                // Evitar duplicados en el historial
                if (!student.history.some(h => h.transaction_id === paymentId.toString())) {
                    student.history.push({
                        date: payDate,
                        status: 'Completado',
                        amount: amount,
                        method: 'Mercado Pago',
                        transaction_id: paymentId.toString()
                    });

                    student.isPaid = true;
                    student.lastPaymentDate = payDate;
                    student.lastPaymentMonth = payDate.substring(0, 7);

                    writeData(studentsFile, students);
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
