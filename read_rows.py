import pandas as pd
import json

excel_file = r"d:\DOJO DEMO\INGRESOS 2025 (1).xlsx"

try:
    df = pd.read_excel(excel_file, sheet_name='INGRESOS', header=None)
    records = []
    
    for i, row in df.iterrows():
        # Column 1 = Name, 2 = Date, 3 = Amount
        name = str(row[1]).strip() if pd.notna(row[1]) else None
        if not name or name.lower() in ['nombre', 'alumno', 'total', 'alumnos']:
            continue
            
        try:
            date_val = row[2]
            date_str = None
            if pd.notna(date_val):
                if hasattr(date_val, 'strftime'):
                    date_str = date_val.strftime('%Y-%m-%d')
                else:
                    date_str = str(date_val).split(' ')[0]
                    
            amount_val = row[3]
            amount = 0
            if pd.notna(amount_val):
                amount = int(float(str(amount_val).replace('$', '').replace('.', '').strip()))
                
            if amount > 0 and name:
                records.append({
                    "name": name,
                    "date": date_str or "2025-01-01",
                    "amount": amount
                })
        except Exception as e:
            continue

    with open('excel_payments.json', 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print("OK")
    
except Exception as e:
    print("Error:", str(e))
