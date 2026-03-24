import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dbPath = path.join(__dirname, 'data');

const readData = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

async function migrate() {
    console.log("🚀 Starting Migration to Supabase...");

    // 1. Students
    console.log("\n--- Migrating Students ---");
    const students = readData(path.join(dbPath, 'students.json'));
    if (students && students.length > 0) {
        const seenEmails = new Set();
        const studentsCleaned = students.map(s => {
            let email = (s.email && s.email.trim() !== '') ? s.email.trim().toLowerCase() : null;
            if (email && seenEmails.has(email)) {
                 console.log(`⚠️ Found duplicate email for ${s.name} (${email}). Skipping email column.`);
                 email = null;
            } else if (email) {
                 seenEmails.add(email);
            }

            return {
                id: s.id.toString(),
                name: s.name,
                email: email,
                password: s.password || null,
                phone: s.phone || null,
                belt: s.belt || 'WHITE',
                classesattended: Number(s.classesAttended) || 0,
                classestonextbelt: Number(s.classesToNextBelt) || 40,
                lastpaymentmonth: s.lastPaymentMonth || null,
                lastpaymentdate: s.lastPaymentDate || null,
                ispaid: s.isPaid === true,
                plan: s.plan ? s.plan.toString() : null,
                monthlyfee: Number(s.monthlyFee) || null,
                avatar: s.avatar || null,
                birthdate: s.birthDate || null,
                history: Array.isArray(s.history) ? s.history : []
            };
        });

        const { error } = await supabase.from('students').upsert(studentsCleaned);
        if (error) console.error("❌ Error migrating students:", error.message);
        else console.log(`✅ Migrated ${students.length} students to Supabase!`);
    }

    // 2. Videos
    console.log("\n--- Migrating Videos ---");
    const videos = readData(path.join(dbPath, 'videos.json'));
    if (videos && videos.length > 0) {
        const videosCleaned = videos.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            url: v.url,
            thumbnail: v.thumbnail,
            beltlevel: v.beltLevel,
            category: v.category
        }));
        const { error } = await supabase.from('videos').upsert(videosCleaned);
        if (error) console.error("❌ Error migrating videos:", error.message);
        else console.log(`✅ Migrated ${videos.length} videos to Supabase!`);
    }

    // 3. News
    console.log("\n--- Migrating News ---");
    const news = readData(path.join(dbPath, 'news.json'));
    if (news && news.length > 0) {
         // Omit ID to allow SERIAL auto-increment
         const newsCleaned = news.map(({ id, ...rest }) => ({ ...rest }));
         const { error } = await supabase.from('news').insert(newsCleaned);
         if (error) console.error("❌ Error migrating news:", error.message);
         else console.log(`✅ Migrated ${news.length} news items to Supabase!`);
    }

    // 4. Gallery
    console.log("\n--- Migrating Gallery ---");
    const gallery = readData(path.join(dbPath, 'gallery.json'));
    if (gallery && gallery.length > 0) {
         const galleryCleaned = gallery.map(({ id, ...rest }) => ({ ...rest }));
         const { error } = await supabase.from('gallery').insert(galleryCleaned);
         if (error) console.error("❌ Error migrating gallery:", error.message);
         else console.log(`✅ Migrated ${gallery.length} gallery images to Supabase!`);
    }

    console.log("\n🏁 Migration Script completed successfully!");
}

migrate();
