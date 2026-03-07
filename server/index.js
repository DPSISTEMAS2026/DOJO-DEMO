import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config(); // Standard config for Render/Local env vars

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Log to help debug on Render
console.log("Starting server with settings:");
console.log("- PORT:", PORT);
console.log("- MP Token exists:", !!process.env.VITE_MP_ACCESS_TOKEN);

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
app.get('/api/students', (req, res) => {
    res.json(readData(studentsFile));
});

app.post('/api/students', (req, res) => {
    const students = readData(studentsFile);
    const newStudent = { ...req.body, id: Date.now().toString() };
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
                notification_url: `${process.env.BACKEND_URL}/api/webhooks` // Render URL here
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
        // Aquí podrías consultar el estado del pago usando el ID en data.id
        // Y actualizar el estado del alumno en students.json
        console.log(`Pago ${data.id} con acción ${action}`);
    }

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
