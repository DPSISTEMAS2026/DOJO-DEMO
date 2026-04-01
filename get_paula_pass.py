import requests
import json
import os

dotenv_vars = {}
with open('.env', 'r') as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split('=', 1)
            dotenv_vars[k] = v

url = dotenv_vars['SUPABASE_URL']
key = dotenv_vars['SUPABASE_ANON_KEY']
headers = { "apikey": key, "Authorization": f"Bearer {key}" }

r = requests.get(f"{url}/rest/v1/students?email=eq.abgrenzomorales@gmail.com&select=password", headers=headers)
print(r.json())
