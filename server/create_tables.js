import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Client } = pg;

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const projectId = 'qbimxygcjjmosifsqbko'; // Pulled from your URL

const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectId}.supabase.co:5432/postgres`;

const sql = `
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password TEXT,
  phone TEXT,
  belt TEXT DEFAULT 'WHITE',
  classesAttended INTEGER DEFAULT 0,
  classesToNextBelt INTEGER DEFAULT 40,
  lastPaymentMonth TEXT,
  lastPaymentDate TEXT,
  isPaid BOOLEAN DEFAULT false,
  plan TEXT,
  monthlyFee INTEGER,
  avatar TEXT,
  birthDate TEXT,
  history JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail TEXT,
  beltLevel TEXT,
  category TEXT
);

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  img TEXT,
  link TEXT,
  label TEXT,
  date TEXT,
  stats JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  img TEXT NOT NULL,
  size TEXT DEFAULT 'small'
);
`;

async function run() {
    console.log("Connecting to Supabase Database via Postgres on Subdomain:", projectId);
    const client = new Client({ connectionString });
    
    try {
         await client.connect();
         console.log("--- Executing Tables creation (DDL) ---");
         await client.query(sql);
         console.log("✅ Tables Created or Verified Successfully!");

    } catch (err) {
         console.error("❌ SQL Execution Error:", err.message);
    } finally {
         await client.end();
    }
}

run();
