import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const token = process.env.VITE_MP_ACCESS_TOKEN;

function makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.mercadopago.com',
            path: endpoint,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function run() {
    const endpoints = [
        '/v1/account/movements',
        '/v1/account/transactions',
        '/v1/account/settlements',
        '/v1/account/activity'
    ];

    for (let ep of endpoints) {
        console.log(`\n--- Testing: ${ep} ---`);
        const res = await makeRequest(ep);
        if (res.status === 200) {
            console.log(`✅ COMPLETE 200 OK: Found Keys:`, Object.keys(res.data));
            console.log(JSON.stringify(res.data).substring(0, 300));
        } else {
            console.log(`❌ ERROR (${res.status}):`, res.data.message || res.data);
        }
    }
}

run();
