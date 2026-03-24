import pandas as pd

excel_file = "INGRESOS 2025.xlsx"

try:
    print("--- Inspecting Sheets (No Header) ---")
    df = pd.read_excel(excel_file, sheet_name='INGRESOS', header=None)
    
    # Print first 20 rows to locate header row
    print(df.head(20).to_string())

except Exception as e:
    print("Error:", str(e))
