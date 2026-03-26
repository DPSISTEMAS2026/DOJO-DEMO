import pandas as pd
import requests
import json
import os

# 1. Leer .env para credenciales
supabase_url = ""
supabase_key = ""

with open(r'd:\DOJO DEMO\.env', 'r') as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split('=', 1)
            if k == "SUPABASE_URL":
                supabase_url = v
            elif k == "SUPABASE_ANON_KEY":
                supabase_key = v

if not supabase_url or not supabase_key:
    print("Error: No se encontraron credenciales de Supabase en el .env")
    exit(1)

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# 2. Descargar TODOS los alumnos de Supabase para cruce
try:
    r = requests.get(f"{supabase_url}/rest/v1/students?select=*", headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"})
    students = r.json()
except Exception as e:
    print(f"Error descargando alumnos: {e}")
    exit(1)

# 3. Leer Excel
excel_file = r"d:\DOJO DEMO\INGRESOS 2025 (1).xlsx"
try:
    df = pd.read_excel(excel_file, sheet_name='INGRESOS', header=None)
except Exception as e:
    print(f"Error cargando Excel: {e}")
    exit(1)

# 4. Procesar filas
count = 0
for i, row in df.iterrows():
    name = str(row[1]).strip() if pd.notna(row[1]) else None
    if not name or name.lower() in ['nombre', 'alumno', 'total', 'alumnos']:
        continue
        
    try:
        date_val = row[2]
        date_str = "2025-01-01"
        if pd.notna(date_val):
            date_str = date_val.strftime('%Y-%m-%d') if hasattr(date_val, 'strftime') else str(date_val).split(' ')[0]
            
        amount_val = row[3]
        amount = 0
        if pd.notna(amount_val):
            amount = int(float(str(amount_val).replace('$', '').replace('.', '').strip()))
            
        if amount <= 0:
            continue

        # Cruce de alumnos
        student = next((s for s in students if s['name'].lower() == name.lower()), None)
        
        if not student:
            parts = name.lower().split(' ')
            if len(parts) >= 2:
                student = next((s for s in students if parts[0] in s['name'].lower() and parts[-1] in s['name'].lower()), None)

        if student:
            history = student.get('history', [])
            if not isinstance(history, list):
                history = []
                
            transaction_id = f"EXCEL_{date_str.replace('-', '')}_{amount}"

            if not any(h.get('transaction_id') == transaction_id or (h.get('date') == date_str and h.get('amount') == amount) for h in history):
                history.append({
                    "date": date_str,
                    "status": "Completado",
                    "amount": amount,
                    "method": "Manual (Excel)",
                    "transaction_id": transaction_id
                })

                payload = {
                    "history": history,
                    "ispaid": True,
                    "lastpaymentdate": date_str,
                    "lastpaymentmonth": date_str[:7]
                }

                upd_r = requests.patch(
                    f"{supabase_url}/rest/v1/students?id=eq.{student['id']}",
                    headers=headers,
                    data=json.dumps(payload)
                )
                if upd_r.status_code in [200, 201, 204]:
                    print(f"✅ Sincronizado: {name} (${amount})")
                    count += 1
                else:
                    print(f"❌ Error al guardar {name} ({upd_r.status_code})")
                    
    except Exception as e:
        continue

print(f"\n--- Sincronización Finalizada ---")
print(f"Se actualizaron {count} pagos con éxito.")

# 5. Imprimir Credenciales de prueba al final
try:
    test_user = next((s for s in students if s.get('email') and s.get('password')), None)
    if test_user:
        print("\n--- CREDENCIALES DE PRUEBA ALUMNO ---")
        print(f"Nombre: {test_user['name']}")
        print(f"Email/Usuario: {test_user['email']}")
        print(f"Password: {test_user['password']}")
except:
    pass
