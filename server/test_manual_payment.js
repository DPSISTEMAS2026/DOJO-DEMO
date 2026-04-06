import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testUpdate() {
  console.log("Fetching student...");
  const { data: students, error: fetchErr } = await supabase.from('students').select('*').limit(1);
  if (fetchErr) return console.error("Fetch err:", fetchErr);
  
  const student = students[0];
  console.log("Student ID:", student.id);
  
  const updateData = {
    ispaid: true,
    lastpaymentdate: new Date().toISOString().split('T')[0],
    lastpaymentmonth: new Date().toISOString().substring(0, 7),
    history: [
       ...(Array.isArray(student.history) ? student.history : []),
       { date: new Date().toISOString().split('T')[0], status: 'Completado', amount: student.monthlyfee || 0, method: 'Manual/Transferencia' }
    ]
  };
  
  console.log("Attempting update with:", JSON.stringify(updateData));
  
  const { data, error } = await supabase.from('students').update(updateData).eq('id', student.id);
  
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Update Success! Reverting...");
    // revert
    await supabase.from('students').update({
       ispaid: student.ispaid,
       lastpaymentdate: student.lastpaymentdate,
       lastpaymentmonth: student.lastpaymentmonth,
       history: student.history
    }).eq('id', student.id);
    console.log("Reverted.");
  }
}

testUpdate();
