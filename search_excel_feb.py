import pandas as pd
from datetime import datetime

excel_file = "INGRESOS 2025.xlsx"

try:
    print("--- Searching February Payments in Excel ---")
    df = pd.read_excel(excel_file, sheet_name='INGRESOS', header=None)
    
    february_payments = []
    
    for index, row in df.iterrows():
        try:
            name = str(row[1])
            date_val = row[2]
            amount = row[3]
            
            # Skip rows without name or amounts
            if name == 'nan' or name.strip() == '' or pd.isna(amount) or amount == '':
                continue
                
            is_feb = False
            
            # 1. Date comparison if datetime object
            if isinstance(date_val, datetime) or hasattr(date_val, 'month'):
                if date_val.month == 2:
                    is_feb = True
            
            # 2. String fallback if not datetime
            elif isinstance(date_val, str):
                if "02" in date_val or "feb" in date_val.lower():
                    is_feb = True
                    
            if is_feb:
                february_payments.append({
                    "name": name.strip(),
                    "date": str(date_val).split(' ')[0],
                    "amount": float(amount)
                })
                
        except Exception:
            continue

    import json
    with open('excel_payments.json', 'w', encoding='utf-8') as f:
        json.dump(february_payments, f, indent=4, ensure_ascii=False)
    print(f"\n✅ Total February payments found in Excel: {len(february_payments)} (Guardado en excel_payments.json)")
    for pay in february_payments:
        print(f"- {pay['name']} | Fecha: {pay['date']} | Monto: ${pay['amount']}")
except Exception as e:
    print("Error:", str(e))
