const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const payments = [
    { name: "Gaspar Landsberger", date: "2026-03-06", amount: 35000, id: "3" },
    { name: "Cristian Moya", date: "2026-02-02", amount: 35000, id: "7" },
    { name: "Constanza Sepulveda", date: "2026-03-05", amount: 35000, id: "53" },
    { name: "Rafaela Aguilef", date: "2026-03-25", amount: 35000, id: "34" },
    { name: "Elíseo Lema", date: "2026-03-18", amount: 45000, id: "16" },
    { name: "Lizbeth Daniela", date: "2026-03-18", amount: 35000, id: "28" },
    { name: "camile espinosa", date: "2026-03-03", amount: 35000, id: "37" },
    { name: "Edgard Benjamín", date: "2025-04-07", amount: 35000, id: "41" },
    { name: "Máximo Antonio jarpa carrasco", date: "2026-02-26", amount: 35000, id: "48" },
    { name: "Nicolas Fernando Sanchez Mansilla", date: "2026-03-04", amount: 35000, id: "23" },
    { name: "Diego Hernán Echeverría Mix", date: "2026-03-25", amount: 35000, id: "66" },
    { name: "Felipe Eduardo Muñoz Valderrama", date: "2026-02-28", amount: 35000, id: "38" }
];

async function updatePayments() {
    for (const p of payments) {
        try {
            const { data: s, error: fetchErr } = await supabase.from('students').select('*').eq('id', p.id).single();
            if (fetchErr) {
                console.error(`Error fetching ${p.name}:`, fetchErr);
                continue;
            }

            const history = Array.isArray(s.history) ? s.history : [];
            const alreadyExists = history.some(h => h.date === p.date);

            if (!alreadyExists) {
                history.push({
                    date: p.date,
                    amount: p.amount,
                    method: "Manual",
                    status: "Completado",
                    transaction_id: `MANUAL_${p.date.replace(/-/g, '')}_${p.amount}`
                });

                await supabase.from('students').update({
                    history: history,
                    ispaid: true,
                    lastpaymentdate: p.date,
                    lastpaymentmonth: p.date.substring(0, 7)
                }).eq('id', p.id);
                console.log(`✅ Pago agregado village ${p.name} (${p.date})`);
            } else {
                console.log(`⚠️ Ya existe pago village ${p.name} el ${p.date}`);
            }
        } catch (e) {
            console.error(`Error processing ${p.name}:`, e);
        }
    }
}

updatePayments();
