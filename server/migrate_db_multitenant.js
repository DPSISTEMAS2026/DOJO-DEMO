import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Client } = pg;
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const projectId = 'qbimxygcjjmosifsqbko'; // Supabase project ID

const sql = `
-- 1. Crear tabla de sedes
CREATE TABLE IF NOT EXISTS sedes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  mp_access_token TEXT,
  mp_public_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Agregar columna sede_id a tablas existentes (llave foránea)
ALTER TABLE students ADD COLUMN IF NOT EXISTS sede_id INTEGER REFERENCES sedes(id);
ALTER TABLE news ADD COLUMN IF NOT EXISTS sede_id INTEGER REFERENCES sedes(id);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sede_id INTEGER REFERENCES sedes(id);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS sede_id INTEGER REFERENCES sedes(id);

-- 3. Crear tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Guardará la clave (o hash de la clave)
  role TEXT NOT NULL DEFAULT 'admin_sede', -- 'superadmin' o 'admin_sede'
  sede_id INTEGER REFERENCES sedes(id), -- NULL para superadmins
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crear la Sede Inicial por defecto (Concepción) y la sede de pruebas DP Sistemas
INSERT INTO sedes (id, name, address, mp_access_token, mp_public_key)
VALUES 
  (1, 'Concepción', 'Orompello 1421', '', ''),
  (2, 'DP Sistemas', 'Oficina Central DP', 'PROBAR_TOKEN_ACCESS_MP_AQUI', 'PROBAR_PUBLIC_KEY_MP_AQUI')
ON CONFLICT (id) DO NOTHING;

-- 5. Asignar los alumnos, noticias y fotos existentes a la sede Concepción (ID: 1)
UPDATE students SET sede_id = 1 WHERE sede_id IS NULL;
UPDATE news SET sede_id = 1 WHERE sede_id IS NULL AND id < 999990; -- Dejar avisos de sistema globales
UPDATE gallery SET sede_id = 1 WHERE sede_id IS NULL;

-- 6. Insertar cuentas administrativas de prueba
INSERT INTO admins (email, password_hash, role, sede_id)
VALUES
  ('manuelplazaarenas@gmail.com', 'admin123', 'superadmin', NULL),
  ('contacto@dpsistemas.cl', 'admin123', 'superadmin', NULL),
  ('admin.concepcion@ranasjiujitsu.cl', 'admin123', 'admin_sede', 1),
  ('admin.dpsistemas@ranasjiujitsu.cl', 'admin123', 'admin_sede', 2)
ON CONFLICT (email) DO NOTHING;
`;

async function run() {
    console.log("--- MIGRACIÓN DE BASE DE DATOS (MULTI-TENANT) ---");
    
    if (SUPABASE_DB_PASSWORD) {
        console.log("🔑 SUPABASE_DB_PASSWORD encontrada. Ejecutando migración directa...");
        const connectionString = `postgresql://postgres:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@db.${projectId}.supabase.co:5432/postgres`;
        const client = new Client({ connectionString });
        
        try {
            await client.connect();
            console.log("🔌 Conectado a Postgres. Ejecutando sentencias SQL...");
            await client.query(sql);
            console.log("✅ Tablas creadas, alteradas e inicializadas correctamente en Supabase.");
        } catch (err) {
            console.error("❌ Error de SQL al ejecutar la migración:", err.message);
        } finally {
            await client.end();
        }
    } else {
        console.log("⚠️ SUPABASE_DB_PASSWORD no configurada en el archivo .env.");
        console.log("Probando si las nuevas columnas ya existen en Supabase vía API REST...");
        
        const headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        };

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/students?select=sede_id&limit=1`, { headers });
            if (res.ok) {
                console.log("✅ Las columnas multi-tenant (como students.sede_id) ya existen en Supabase.");
            } else {
                console.log("❌ Las columnas multi-tenant NO existen aún en la base de datos.");
                console.log("\n🔧 Por favor, copia y ejecuta el siguiente SQL en el editor de SQL de Supabase:");
                console.log(`🔗 URL: https://supabase.com/dashboard/project/${projectId}/sql`);
                console.log("\n--- SQL A EJECUTAR ---");
                console.log(sql);
                console.log("----------------------\n");
            }
        } catch (err) {
            console.error("Error al verificar base de datos vía API:", err.message);
        }
    }
}

run();
