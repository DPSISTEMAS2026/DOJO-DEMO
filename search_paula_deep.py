import requests
import json

url = "https://qbimxygcjjmosifsqbko.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaW14eWdjamptb3NpZnNxYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODU4NDUsImV4cCI6MjA4OTM2MTg0NX0.ZHR9SdIl0MW2jsl6toB3MnhOL7NVdDhXxVyvkid50cY"

headers = { "apikey": key, "Authorization": f"Bearer {key}" }

r = requests.get(f"{url}/rest/v1/students?select=*", headers=headers)
students = r.json()

for s in students:
    # Check all fields for "Paula"
    found = False
    for k, v in s.items():
        if "paula" in str(v).lower():
            found = True
            break
    if found:
        print(f"--- Encontrada Paula en campos del registro ID {s['id']} ---")
        print(json.dumps(s, indent=2))
    elif s['name'] == 'Renzo Morales':
        print(f"--- Registro de Renzo Morales ---")
        print(json.dumps(s, indent=2))
