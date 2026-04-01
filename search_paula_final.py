import requests

url = "https://qbimxygcjjmosifsqbko.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaW14eWdjamptb3NpZnNxYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODU4NDUsImV4cCI6MjA4OTM2MTg0NX0.ZHR9SdIl0MW2jsl6toB3MnhOL7NVdDhXxVyvkid50cY"

headers = { "apikey": key, "Authorization": f"Bearer {key}" }

r = requests.get(f"{url}/rest/v1/students?select=id,name,email,password", headers=headers)
stu = r.json()

for s in stu:
    if "abgrenzomorales" in str(s.get('email')).lower():
        print(f"MATCH: {s['id']} - {s['name']} - {s['email']} - {s['password']}")
    elif "paula" in str(s.get('name')).lower():
        print(f"NAME MATCH: {s['id']} - {s['name']} - {s['email']} - {s['password']}")
