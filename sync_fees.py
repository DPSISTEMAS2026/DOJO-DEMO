import openpyxl
import requests

API_URL = 'http://localhost:3002'

def normalize(text):
    if not text: return ""
    text = str(text).lower().strip()
    replacements = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n'}
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text

def main():
    try:
        r = requests.get(f"{API_URL}/api/students")
        students = r.json()
        
        wb = openpyxl.load_workbook(r'd:\DOJO DEMO\INGRESOS 2025.xlsx', data_only=True)
        sheet = wb['INGRESOS']
        
        matches = []
        updates = 0
        
        for i, row in enumerate(sheet.iter_rows(values_only=True)):
            if i < 2: continue # Skip headers
            
            fullname = row[1]
            fee = row[3]
            plan = row[4]
            
            if fullname and fee:
                norm_excel = normalize(fullname)
                excel_words = norm_excel.split()
                if not excel_words: continue

                matched = None
                # Check both forwards and backwards supporting fuzzy inclusivity lists triggers
                for s in students:
                    norm_db = normalize(s.get('name', ''))
                    db_words = norm_db.split()
                    
                    # 1. Excel words in DB Name
                    match1 = all(word in norm_db for word in excel_words)
                    # 2. OR DB words in Excel Name
                    match2 = all(word in norm_excel for word in db_words)
                    
                    if match1 or match2:
                        matched = s
                        break
                
                if matched:
                    curr_fee = matched.get('monthlyFee') or matched.get('monthlyfee') or 0
                    matches.append(matched['name'])
                    payload = {
                        "monthlyFee": int(fee),
                        "plan": str(plan) if plan else matched.get('plan')
                    }
                    requests.put(f"{API_URL}/api/students/{matched['id']}", json=payload)
                    print(f"✅ FORCED UPDATE: {matched['name']} -> {fee} (Was {curr_fee})")
                    updates += 1

        print(f"\n🎯 Total Matches Found in Excel: {len(matches)}")
        print(f"✅ Total Updated rows: {updates}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    main()
