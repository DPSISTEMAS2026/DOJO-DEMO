import requests

url = "https://qbimxygcjjmosifsqbko.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaW14eWdjamptb3NpZnNxYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODU4NDUsImV4cCI6MjA4OTM2MTg0NX0.ZHR9SdIl0MW2jsl6toB3MnhOL7NVdDhXxVyvkid50cY"

headers = { "apikey": key, "Authorization": f"Bearer {key}" }

# List students' names to see if Paula is there with a partial name
r = requests.get(f"{url}/rest/v1/students?select=name,email", headers=headers)
students = r.json()
print("Students:")
for s in students:
    if "paula" in s.get("name", "").lower():
        print(f" - {s['name']} ({s['email']})")

# Try searching other potential tables by hitting the spec
r = requests.get(f"{url}/rest/v1/", headers=headers)
print("\nTables in the API:")
try:
    print(r.json())
except:
    print("Could not list tables")
