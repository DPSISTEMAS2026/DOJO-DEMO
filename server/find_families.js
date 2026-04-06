async function getFamilies() {
  try {
    const res = await fetch('http://localhost:3002/api/students');
    const students = await res.json();
    
    const emailGroups = {};
    for (const s of students) {
      if (s.email) {
        const mail = s.email.trim().toLowerCase();
        if (!emailGroups[mail]) emailGroups[mail] = [];
        emailGroups[mail].push(s);
      }
    }
    
    console.log("=== GRUPOS FAMILIARES ===");
    for (const [email, members] of Object.entries(emailGroups)) {
      if (members.length > 1) {
        console.log(`\nFamilia (${email}): ${members.length} integrantes`);
        for (const m of members) {
          console.log(`  - ${m.name} | Edad: ${m.birthDate || 'No registrada'}`);
        }
      }
    }
  } catch(e) {
    console.error(e);
  }
}

getFamilies();
