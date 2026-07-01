import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: 'E:/DOJO DEMO/.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Use Supabase REST API with service role - anon key allows rpc calls
// We'll use the management API via direct HTTP to run SQL
// Actually, we need to call the SQL via rpc or use postgrest
// Let's use the standard REST API to test update with the new column

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
};

// Check if columns already exist by selecting them
const testRes = await fetch(`${SUPABASE_URL}/rest/v1/students?select=joindate,lastgrade,graduationdate&limit=1`, { headers });
if (testRes.ok) {
    console.log("✅ Las columnas joindate, lastgrade, graduationdate ya EXISTEN en Supabase.");
} else {
    const err = await testRes.json();
    console.log("❌ Las columnas NO existen aún:", err.message || err);
    console.log("\n🔧 Por favor ejecuta el siguiente SQL en Supabase Dashboard SQL Editor:");
    console.log("   https://supabase.com/dashboard/project/qbimxygcjjmosifsqbko/sql");
    console.log("\nALTER TABLE students ADD COLUMN IF NOT EXISTS joindate TEXT;");
    console.log("ALTER TABLE students ADD COLUMN IF NOT EXISTS lastgrade TEXT;");
    console.log("ALTER TABLE students ADD COLUMN IF NOT EXISTS graduationdate TEXT;\n");
}
