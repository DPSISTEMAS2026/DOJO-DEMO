import requests
import os

# Manual load .env
dotenv_vars = {}
with open('.env', 'r') as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split('=', 1)
            dotenv_vars[k] = v

url = dotenv_vars['SUPABASE_URL']
key = dotenv_vars['SUPABASE_ANON_KEY']
headers = { "apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json" }

email = "abgrenzomorales@gmail.com"
new_password = "123" # Even simpler

# Update password in Supabase
r = requests.patch(f"{url}/rest/v1/students?email=eq.{email}", headers=headers, json={"password": new_password})
if r.status_code < 300:
    print(f"✅ Contraseña actualizada en base de datos para {email}: {new_password}")
else:
    print(f"❌ Error al actualizar contraseña: {r.text}")
    exit(1)
