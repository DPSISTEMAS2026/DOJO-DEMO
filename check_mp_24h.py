import requests
import json
from datetime import datetime, timedelta

TOKEN = "APP_USR-2486515447521614-030515-062e00c0938958e212adac4b16592e0f-69142029"

def check_24h():
    # Mercado Pago date search
    # We want from March 31st 00:00 to now.
    url = "https://api.mercadopago.com/v1/payments/search"
    params = {
        "sort": "date_created",
        "criteria": "desc",
        "limit": 100,
        "range": "date_created",
        "begin_date": "2026-03-31T00:00:00.000Z",
        "end_date": datetime.utcnow().isoformat() + "Z"
    }
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }

    resp = requests.get(url, headers=headers, params=params)
    if resp.status_code == 200:
        results = resp.json().get("results", [])
        print(f"--- Movements from March 31 to Now ({len(results)}) ---")
        for p in results:
            date = p.get("date_created")
            amount = p.get("transaction_amount")
            status = p.get("status")
            desc = p.get("description", "")
            email = p.get("payer", {}).get("email")
            op_type = p.get("operation_type")
            ext_ref = p.get("external_reference")
            print(f"{date} | ${amount} | {status} | {op_type} | {email} | Desc: {desc} | Ref: {ext_ref}")
    else:
        print(f"Error: {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    check_24h()
