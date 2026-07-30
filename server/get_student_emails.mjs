import { createClient } from '@supabase/supabase-js';
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
        console.log(`[INFO] Cargado .env desde: ${envPath}`);
        loaded = true;
        break;
    }
}

if (!loaded) {
    console.error("[ERROR] No se pudo encontrar el archivo .env en ninguna ubicación.");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

(async () => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('email, name')
            .not('email', 'is', null);
            
        if (error) throw error;
        
        // Filter unique and valid emails
        const validStudents = students.filter(s => s.email && s.email.trim() !== '' && s.email.includes('@'));
        const emails = [...new Set(validStudents.map(s => s.email.trim().toLowerCase()))];
        
        console.log(`\n=== ENCONTRADOS ${emails.length} CORREOS DE ALUMNOS ===\n`);
        console.log("Copia y pega la siguiente lista directamente en Google Play Console (Testers):\n");
        console.log(emails.join(', '));
        console.log("\n======================================================\n");
    } catch (err) {
        console.error("Error al obtener correos:", err);
    }
})();
