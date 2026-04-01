import requests
import json

url = "https://qbimxygcjjmosifsqbko.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaW14eWdjamptb3NpZnNxYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODU4NDUsImV4cCI6MjA4OTM2MTg0NX0.ZHR9SdIl0MW2jsl6toB3MnhOL7NVdDhXxVyvkid50cY"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

# Buscar a Paula en la tabla students
r = requests.get(f"{url}/rest/v1/students?name=ilike.*Paula*&select=*", headers=headers)
students = r.json()

if students:
    print(f"Se encontraron {len(students)} resultados:")
    for s in students:
        print(f"\nID: {s.get('id')}")
        print(f"Nombre: {s.get('name')}")
        print(f"Email: {s.get('email')}")
        print(f"Password: {s.get('password')}")
        # Intentar ver campos de fecha de modificación
        print(f"Creado el: {s.get('created_at')}")
        print(f"Actualizado el: {s.get('updated_at') or 'No disponible'}")
else:
    print("No se encontró a nadie llamado Paula en la tabla students.")
