import openpyxl

# Read absolute table layout from Excel sheet
file_path = r'd:\DOJO DEMO\INGRESOS 2025.xlsx'

try:
    wb = openpyxl.load_workbook(file_path, data_only=True)
    sheet = wb['INGRESOS'] # Using sheet name
    
    print("\n--- Rows from openpyxl (Sheet: INGRESOS) ---")
    for i, row in enumerate(sheet.iter_rows(values_only=True)):
        if i > 25: break
        print(f"Row {i+1}: {row}")

except Exception as e:
    print(f"Error: {e}")
