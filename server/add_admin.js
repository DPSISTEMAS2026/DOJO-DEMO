import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const email = 'd.diazaraya19@gmail.com';
    const password = 'admin123';

    console.log(`Checking if admin ${email} already exists...`);
    const { data: existing, error: findError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (findError) {
        console.error("Error checking existing admin:", findError);
        return;
    }

    if (existing) {
        console.log(`Admin ${email} exists. Updating password...`);
        const { error: updateError } = await supabase
            .from('admins')
            .update({ password_hash: password, role: 'superadmin', sede_id: null })
            .eq('id', existing.id);
        if (updateError) {
            console.error("Error updating admin:", updateError);
        } else {
            console.log("Admin updated successfully!");
        }
    } else {
        console.log(`Admin ${email} does not exist. Creating...`);
        const { error: insertError } = await supabase
            .from('admins')
            .insert({
                email: email,
                password_hash: password,
                role: 'superadmin',
                sede_id: null
            });
        if (insertError) {
            console.error("Error creating admin:", insertError);
        } else {
            console.log("Admin created successfully!");
        }
    }
}

run();
