import os

file_path = r'd:\DOJO DEMO\server\index.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

placeholder = """// Videos
app.get('/api/videos', (req, res) => {"""

if placeholder not in content:
    print("❌ Could not find target line 150 block in index.js")
    exit(1)

# Find where to cut (The row before app.post('/api/checkout') or similar)
# We want to replace everything from `// Videos` until the block before `/api/checkout`
cut_index = content.find("app.post('/api/checkout'")

if cut_index == -1:
    print("❌ Could not find '/api/checkout' marker in index.js")
    exit(1)

# Find the end of the previous endpoint, which is usually right before `app.post('/api/checkout'`
# We can search backwards for `}` or empty lines
header_part = content[:content.find("// Videos")]
footer_part = content[cut_index:]

supabase_endpoints = """// Videos
app.get('/api/videos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('videos').select('*');
        if (error) throw error;
        const formatted = data.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            url: v.url,
            thumbnail: v.thumbnail,
            beltLevel: v.beltlevel,
            category: v.category
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/videos', async (req, res) => {
    try {
        const newId = Date.now().toString();
        const newVideo = { 
            id: newId,
            title: req.body.title,
            description: req.body.description,
            url: req.body.url,
            thumbnail: req.body.thumbnail,
            beltlevel: req.body.beltLevel,
            category: req.body.category
        };
        const { error } = await supabase.from('videos').insert(newVideo);
        if (error) throw error;
        res.status(201).json({ ...req.body, id: newId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// News
app.get('/api/news', async (req, res) => {
    try {
        const { data, error } = await supabase.from('news').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/news', async (req, res) => {
    try {
        const { error } = await supabase.from('news').insert(req.body);
        if (error) throw error;
        res.status(200).json(req.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gallery
app.get('/api/gallery', async (req, res) => {
    try {
        const { data, error } = await supabase.from('gallery').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/gallery', async (req, res) => {
    try {
        const { error } = await supabase.from('gallery').insert(req.body);
        if (error) throw error;
        res.status(200).json(req.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hero Videos (Keep local fallback or simple json read setup)
app.get('/api/hero-videos', (req, res) => {
    res.json(readData(heroVideosFile));
});

app.post('/api/hero-videos', (req, res) => {
    writeData(heroVideosFile, req.body);
    res.status(200).json(req.body);
});

// Students with automatic background sync
app.get('/api/students', async (req, res) => {
    try {
        const { data, error } = await supabase.from('students').select('*');
        if (error) throw error;

        const formatted = data.map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            password: s.password,
            phone: s.phone,
            belt: s.belt || 'WHITE',
            classesAttended: s.classesattended,
            classesToNextBelt: s.classestonextbelt,
            lastPaymentMonth: s.lastpaymentmonth,
            lastPaymentDate: s.lastpaymentdate,
            isPaid: s.ispaid === true,
            plan: s.plan,
            monthlyFee: s.monthlyfee,
            avatar: s.avatar,
            birthDate: s.birthdate,
            history: Array.isArray(s.history) ? s.history : []
        }));

        res.json(formatted);
        syncStudentsBackground(formatted);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Función auxiliar para sincronización en segundo plano (últimos 6 meses)
async function syncStudentsBackground(students) {
    const mpPayment = new Payment(client);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const now = new Date();

    try {
        const result = await mpPayment.search({
            options: {
                status: 'approved',
                range: 'date_created',
                begin_date: sixMonthsAgo.toISOString(),
                end_date: now.toISOString(),
                limit: 100
            }
        });

        const payments = result.results || [];

        for (let student of students) {
            if (!student.email) continue;
            
            const studentEmail = student.email.toLowerCase();
            const studentName = student.name.toLowerCase();

            const matchedPayments = payments.filter(pay => {
                 const payerEmail = pay.payer?.email?.toLowerCase() || '';
                 const description = pay.description?.toLowerCase() || '';
                 return payerEmail === studentEmail || description.includes(studentName);
            });

            if (matchedPayments.length > 0) {
                 let anyUpdated = false;
                 matchedPayments.forEach(pay => {
                      const payDate = pay.date_approved ? pay.date_approved.split('T')[0] : pay.date_created.split('T')[0];
                      if (!student.history) student.history = [];
                      if (!student.history.some(h => h.transaction_id === pay.id.toString())) {
                           student.history.push({
                                date: payDate,
                                status: 'Completado',
                                amount: pay.transaction_amount,
                                method: 'Mercado Pago',
                                transaction_id: pay.id.toString()
                           });
                           student.isPaid = true;
                           student.lastPaymentDate = payDate;
                           student.lastPaymentMonth = payDate.substring(0, 7);
                           anyUpdated = true;
                      }
                 });

                 if (anyUpdated) {
                      const { error: updErr } = await supabase.from('students').update({
                           history: student.history,
                           ispaid: student.isPaid,
                           lastpaymentdate: student.lastPaymentDate,
                           lastpaymentmonth: student.lastPaymentMonth
                      }).eq('id', student.id);
                 }
            }
        }
    } catch (e) {
        print("--- Background Sync Failed ---", e.message || e)
    }
}

app.post('/api/students', async (req, res) => {
    try {
        const newId = Date.now().toString();
        const newStudent = { 
            id: newId,
            name: req.body.name,
            email: req.body.email || null,
            password: req.body.password || null,
            phone: req.body.phone || null,
            belt: req.body.belt || 'WHITE',
            classesattended: Number(req.body.classesAttended) || 0,
            classestonextbelt: Number(req.body.classesToNextBelt) || 40,
            ispaid: req.body.isPaid === true,
            plan: req.body.plan ? req.body.plan.toString() : null,
            monthlyfee: Number(req.body.monthlyFee) || null,
            avatar: req.body.avatar || null,
            birthdate: req.body.birthDate || null,
            history: Array.isArray(req.body.history) ? req.body.history : []
        };
        const { error } = await supabase.from('students').insert(newStudent);
        if (error) throw error;
        res.status(201).json({ ...req.body, id: newId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const updateData = {};
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.email !== undefined) updateData.email = req.body.email;
        if (req.body.phone !== undefined) updateData.phone = req.body.phone;
        if (req.body.password !== undefined) updateData.password = req.body.password;
        if (req.body.belt !== undefined) updateData.belt = req.body.belt;
        if (req.body.classesAttended !== undefined) updateData.classesattended = Number(req.body.classesAttended);
        if (req.body.classesToNextBelt !== undefined) updateData.classestonextbelt = Number(req.body.classesToNextBelt);
        if (req.body.isPaid !== undefined) updateData.ispaid = req.body.isPaid === true;
        if (req.body.plan !== undefined) updateData.plan = req.body.plan ? req.body.plan.toString() : null;
        if (req.body.monthlyFee !== undefined) updateData.monthlyfee = Number(req.body.monthlyFee);
        if (req.body.birthDate !== undefined) updateData.birthdate = req.body.birthDate;
        if (req.body.avatar !== undefined) updateData.avatar = req.body.avatar;
        if (req.body.history !== undefined) updateData.history = req.body.history;
        if (req.body.lastPaymentDate !== undefined) updateData.lastpaymentdate = req.body.lastPaymentDate;
        if (req.body.lastPaymentMonth !== undefined) updateData.lastpaymentmonth = req.body.lastPaymentMonth;

        const { error } = await supabase.from('students').update(updateData).eq('id', req.params.id);
        if (error) throw error;
        res.json({ ...req.body, id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SYNC PAYMENTS FROM MERCADO PAGO ---
app.post('/api/students/:id/sync-payments', async (req, res) => {
    try {
        const { data: student, error: selectError } = await supabase.from('students').select('*').eq('id', req.params.id).single();
        if (selectError || !student) return res.status(404).json({ error: 'Alumno no encontrado' });

        const mpPayment = new Payment(client);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const searchFilters = {
            status: 'approved',
            range: 'date_created',
            begin_date: sixMonthsAgo.toISOString(),
            end_date: new Date().toISOString(),
            limit: 100
        };

        const result = await mpPayment.search({ options: searchFilters });
        const payments = result.results || [];

        if (!student.email) return res.json({ message: "El alumno no tiene correo." });

        const studentEmail = student.email.toLowerCase();
        const studentName = student.name.toLowerCase();

        const newPayments = payments.filter(pay => {
             const payerEmail = pay.payer?.email?.toLowerCase() || '';
             const description = pay.description?.toLowerCase() || '';
             return payerEmail === studentEmail || description.includes(studentName);
        });

        let updatedCount = 0;
        const history = Array.isArray(student.history) ? student.history : [];

        newPayments.forEach(pay => {
            const payDate = pay.date_approved ? pay.date_approved.split('T')[0] : pay.date_created.split('T')[0];
            if (!history.some(h => h.transaction_id === pay.id.toString())) {
                history.push({
                    date: payDate,
                    status: 'Completado',
                    amount: pay.transaction_amount,
                    method: 'Mercado Pago',
                    transaction_id: pay.id.toString()
                });
                updatedCount++;
            }
        });

        const updatePayload = { history };
        if (updatedCount > 0) {
            const lastPay = [...history].sort((a, b) => b.date.localeCompare(a.date))[0];
            if (lastPay) {
                updatePayload.lastpaymentmonth = lastPay.date.substring(0, 7);
                updatePayload.ispaid = true;
                updatePayload.lastpaymentdate = lastPay.date;
            }
            await supabase.from('students').update(updatePayload).eq('id', req.params.id);
        }

        res.json({
            message: `Sincronización completada. Se encontraron ${newPayments.length} pagos en Mercado Pago.`,
            addedCount: updatedCount,
            student: { ...student, history, isPaid: updatePayload.ispaid || student.ispaid }
        });

    } catch (error) {
         res.status(500).json({ error: error.message });
    }
});

"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(header_part + supabase_endpoints + footer_part)

print("✅ Index.js updated with Supabase endpoints successfully!")
