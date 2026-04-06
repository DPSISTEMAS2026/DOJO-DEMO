import requests
import json

TOKEN = "APP_USR-2486515447521614-030515-062e00c0938958e212adac4b16592e0f-69142029"

def fetch_all_mp():
    url = f"https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=100"
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        results = data.get("results", [])
        
        with open("mp_full_recent.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4)
        print(f"Dumped {len(results)} movements to mp_full_recent.json")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    fetch_all_mp()
