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

// Students
app.get('/api/students', (req, res) => {
    res.json(readData(studentsFile));
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
    console.log('Webhook received:', req.body);
    const { action, data } = req.body;

    if (action === 'payment.created' || action === 'payment.updated') {
        // En un caso real, aquí usaríamos Payment.get(data.id) para confirmar el estado
        // y actualizaríamos el alumno automáticamente.
        console.log(`Pago recibido: ${data.id}`);
    }

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("- MP Token exists:", !!process.env.VITE_MP_ACCESS_TOKEN);
});
