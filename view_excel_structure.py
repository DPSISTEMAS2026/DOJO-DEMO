import pandas as pd

excel_file = "INGRESOS 2025.xlsx"

try:
    print("--- Loading Excel Sheets ---")
    xls = pd.ExcelFile(excel_file)
    sheets = xls.sheet_names
    print(f"Sheets found: {sheets}")

    for sheet in sheets[:3]:  # inspect first 3 sheets due to size
        print(f"\n--- Sheet: {sheet} ---")
        df = pd.read_excel(excel_file, sheet_name=sheet)
        print("Columns:", list(df.columns))
        print("\nFirst 3 rows:")
        print(df.head(3).to_string())

except Exception as e:
    print("Error:", str(e))
