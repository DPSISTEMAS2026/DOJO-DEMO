import openpyxl
import sys

file_path = r'd:\DOJO DEMO\INGRESOS 2025 (1).xlsx'
search_term = sys.argv[1] if len(sys.argv) > 1 else "Nicolas"

try:
    wb = openpyxl.load_workbook(file_path, data_only=True)
    sheet = wb.active # Use active sheet
    
    print(f"\n--- Searching for '{search_term}' in '{file_path}' ---")
    found = False
    for row_idx, row in enumerate(sheet.iter_rows(values_only=True)):
        row_str = " ".join([str(cell) for cell in row if cell is not None])
        if search_term.lower() in row_str.lower():
            print(f"Row {row_idx+1}: {row}")
            found = True
    
    if not found:
        print("No matching records found in Excel.")

except Exception as e:
    print(f"Error: {e}")
