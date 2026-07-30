import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidos en el archivo .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportTable(tableName) {
    console.log(`📥 Descargando tabla: "${tableName}"...`);
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error(`❌ Error al descargar tabla ${tableName}:`, error.message);
        return [];
    }
    console.log(`   └─ Descargados ${data.length} registros.`);
    return data;
}

async function run() {
    console.log("=== INICIANDO RESPALDO DE SUPABASE ===");
    try {
        const students = await exportTable('students');
        const videos = await exportTable('videos');
        const news = await exportTable('news');
        const gallery = await exportTable('gallery');

        const backupData = {
            backed_up_at: new Date().toISOString(),
            tables: {
                students,
                videos,
                news,
                gallery
            }
        };

        const backupsDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        const backupFileName = `supabase_data_backup_${timestamp}.json`;
        const backupPath = path.join(backupsDir, backupFileName);

        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
        console.log("\n=================================");
        console.log(`✅ RESPALDO COMPLETADO CON ÉXITO.`);
        console.log(`📂 Archivo guardado en: ${backupPath}`);
        console.log("=================================\n");
    } catch (e) {
        console.error("❌ Fallo en el proceso de respaldo:", e.message);
    }
}

run();
