import requests

url = "https://qbimxygcjjmosifsqbko.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaW14eWdjamptb3NpZnNxYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODU4NDUsImV4cCI6MjA4OTM2MTg0NX0.ZHR9SdIl0MW2jsl6toB3MnhOL7NVdDhXxVyvkid50cY"

headers = { "apikey": key, "Authorization": f"Bearer {key}" }

r = requests.get(f"{url}/rest/v1/students?name=ilike.*Paula*&select=*", headers=headers)
students = r.json()

if students:
    for s in students:
        print(f"ID: {s['id']}")
        print(f"Nombre: {s['name']}")
        print(f"Email: {s['email']}")
        print(f"Password: {s['password']}")
        print(f"Updated At: {s.get('updated_at')}")
else:
    # Try searching by Morales if name is different
    r = requests.get(f"{url}/rest/v1/students?name=ilike.*Morales*&select=*", headers=headers)
    students = r.json()
    if students:
        for s in students:
            print(f"ID: {s['id']}")
            print(f"Nombre: {s['name']}")
            print(f"Email: {s['email']}")
            print(f"Password: {s['password']}")
            print(f"Updated At: {s.get('updated_at')}")
    else:
        print("No se encontró a Paula Morales en la base de datos.")
