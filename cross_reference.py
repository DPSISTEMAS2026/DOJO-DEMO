import pandas as pd
from datetime import datetime
import requests
import os

print("--- Cruce de Excel e Ingresos de Mercado Pago ---")

# 1. Cargar archivo .env para el token
token = None
if os.path.exists('.env'):
    with open('.env') as f:
        for line in f:
            if line.startswith('VITE_MP_ACCESS_TOKEN='):
                token = line.strip().split('=')[1]

if not token:
    print("Error: No se encontró token en el archivo .env")
    exit()

# 2. Cargar Excel
try:
    df = pd.read_excel("INGRESOS 2025.xlsx", sheet_name='INGRESOS', header=None)
    excel_payments = []
    
    for index, row in df.iterrows():
        try:
            name = str(row[1])
            date_val = row[2]
            amount = row[3]
            
            if name == 'nan' or name.strip() == '' or pd.isna(amount):
                continue
                
            is_feb = False
            if hasattr(date_val, 'month') and date_val.month == 2:
                is_feb = True
            elif isinstance(date_val, str) and "02" in date_val:
                is_feb = True
                
            if is_feb:
                excel_payments.append({
                    "name": name.strip(),
                    "amount": float(amount),
                    "date": str(date_val).split(' ')[0]
                })
        except Exception:
            continue
            
    print(f"Pagos en Excel (Febrero 2026): {len(excel_payments)}")
    
except Exception as e:
    print(f"Error cargando Excel: {e}")
    exit()

# 3. Cargar Mercado Pago API
try:
    headers = { "Authorization": f"Bearer {token}" }
    params = {
        "range": "date_created",
        "begin_date": "2026-02-01T00:00:00.000Z",
        "end_date": "2026-03-01T00:00:00.000Z",
        "limit": 100
    }
    
    response = requests.get("https://api.mercadopago.com/v1/payments/search", headers=headers, params=params)
    result = response.json()
    
    mp_payments = result.get('results', [])
    print(f"Pagos en Mercado Pago (Febrero 2026): {len(mp_payments)}")

except Exception as e:
    print(f"Error en Mercado Pago: {e}")
    exit()

# 4. Cruce
matches = []
unmatched_excel = []

# Copia de pagos de MP disponible para evitar duplicados en el cruce de montos solos
available_mp = list(mp_payments)

for ex_pay in excel_payments:
    found_mp = None
    ex_name_lower = ex_pay['name'].lower()
    
    # Intento 1: Coincidencia por NOMBRE en Descripción
    for mp_pay in available_mp:
        desc = (mp_pay.get('description') or '').lower()
        if ex_name_lower in desc:
            found_mp = mp_pay
            break
            
    # Intento 2: Coincidencia por EMAIL (si existe email en Excel) - omitido porque Excel no tiene email en esas columnas
    
    # Intento 3: Coincidencia por MONTO exacto (Fallback débil)
    if not found_mp:
        for mp_pay in available_mp:
            if float(mp_pay.get('transaction_amount') or 0) == ex_pay['amount']:
                description = mp_pay.get('description') or ''
                # Si es un gasto obvio (gourmet, lider, etc), NO emparejar
                if any(x in description.lower() for x in ['copec', 'lider', 'panaderia', 'experiencia gourmet', 'sb']):
                    continue
                found_mp = mp_pay
                break

    if found_mp:
        available_mp.remove(found_mp)
        matches.append({
            "name": ex_pay['name'],
            "mp_id": found_mp['id'],
            "mp_desc": found_mp.get('description'),
            "amount": ex_pay['amount']
        })
    else:
        unmatched_excel.append(ex_pay)

print(f"\n✅ EMPAREJADOS CON ÉXITO ({len(matches)}):")
for m in matches:
    print(f"- {m['name']} | Monto: ${m['amount']} | Desc MP: {m['mp_desc']}")

print(f"\n❌ EN EXCEL PERO NO HALLADOS EN MERCADO PAGO ({len(unmatched_excel)}):")
for u in unmatched_excel:
    print(f"- {u['name']} | Monto: ${u['amount']} | Fecha Excel: {u['date']}")
