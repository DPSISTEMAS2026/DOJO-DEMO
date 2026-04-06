import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function addColumn() {
  console.log("Checking schema...");
  
  // Note: Supabase JS client doesn't have a direct way to alter tables.
  // We usually do this via the SQL Editor in the Supabase Dashboard.
  // However, I will check if I can at least confirm the error again.
  
  const { data, error } = await supabase.from('students').select('*').limit(1);
  if (error) {
    console.error("Error naming check:", error);
    return;
  }
  
  console.log("Current columns in first row:", Object.keys(data[0]));
  
  console.log("\n--- IMPORTANT ---");
  console.log("The column 'scheduledclasses' (jsonb) is MISSING in Supabase.");
  console.log("Please run this SQL in your Supabase Dashboard SQL Editor:");
  console.log("\nALTER TABLE students ADD COLUMN scheduledclasses jsonb DEFAULT '[]'::jsonb;");
}

addColumn();
