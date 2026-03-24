import requests

url = ""
key = ""

with open(r'd:\DOJO DEMO\.env', 'r') as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split('=', 1)
            if k == "SUPABASE_URL": url = v
            elif k == "SUPABASE_ANON_KEY": key = v

r = requests.get(f"{url}/rest/v1/", headers={"apikey": key, "Authorization": f"Bearer {key}"})
print(r.json().keys() if hasattr(r.json(), 'keys') else r.json())
