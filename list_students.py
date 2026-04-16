import requests

url = "https://qbimxygcjjmosifsqbko.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaW14eWdjamptb3NpZnNxYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODU4NDUsImV4cCI6MjA4OTM2MTg0NX0.ZHR9SdIl0MW2jsl6toB3MnhOL7NVdDhXxVyvkid50cY"

headers = { "apikey": key, "Authorization": f"Bearer {key}" }

r = requests.get(f"{url}/rest/v1/students?select=*", headers=headers)
students = r.json()

for s in students:
    if str(s.get('id')) == '73' or s.get('id') == 73:
        print(f"FOUND ID 73: {s['id']} - {s['name']} - paid: {s['ispaid']} - date: {s.get('lastpaymentdate')}")
        print(f"History: {s.get('history')}")
