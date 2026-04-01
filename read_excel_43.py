import openpyxl

file_path = r'd:\DOJO DEMO\INGRESOS 2025 (1).xlsx'

try:
    wb = openpyxl.load_workbook(file_path, data_only=True)
    sheet = wb.active 
    
    print(f"\n--- Searching for '43' in row ID column ---")
    for row_idx, row in enumerate(sheet.iter_rows(values_only=True)):
        if row[0] == 43 or row[1] == 43 or str(row[0]).strip() == "43":
            print(f"Row {row_idx+1}: {row}")

except Exception as e:
    print(f"Error: {e}")
