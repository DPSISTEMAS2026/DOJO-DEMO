import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Listing last 20 transactions from Supabase...");
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching transactions:", error.message);
        return;
    }

    if (transactions && transactions.length > 0) {
        transactions.forEach(t => {
            console.log(`\nID: ${t.id} | Date: ${t.created_at} | Status: ${t.status}`);
            console.log(`Amount: ${t.amount} | Description: ${t.description}`);
            console.log(`Metadata:`, JSON.stringify(t.metadata, null, 2));
        });
    } else {
        console.log("No transactions found.");
    }
}
run();
