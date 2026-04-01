import requests
import json
import os

TOKEN = "APP_USR-2486515447521614-030515-062e00c0938958e212adac4b16592e0f-69142029"

def check_mp():
    # Attempting to search for both regular payments and money transfers
    url = f"https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=100"
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }

    print(f"--- Fetching recent movements from MercadoPago ---")
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        results = data.get("results", [])
        print(f"Found {len(results)} recent movements.")
        
        relevant_movements = []
        for p in results:
            date = p.get("date_created")
            # We are interested in 2026-03-31 and 2026-04-01
            if not ("2026-03-31" in date or "2026-04-01" in date):
                continue
                
            status = p.get("status")
            amount = p.get("transaction_amount")
            payer = p.get("payer", {})
            payer_email = payer.get("email")
            desc = p.get("description", "")
            op_type = p.get("operation_type")
            ext_ref = p.get("external_reference")
            
            relevant_movements.append({
                "date": date,
                "amount": amount,
                "status": status,
                "email": payer_email,
                "description": desc,
                "type": op_type,
                "ref": ext_ref
            })
            
        if not relevant_movements:
            print("No movements found for Mar 31 or Apr 1 in the last 100 results.")
        else:
            for m in relevant_movements:
                print(f"{m['date']} | ${m['amount']} | {m['status']} | {m['type']} | {m['email']} | Desc: {m['description']} | Ref: {m['ref']}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    check_mp()
