import requests
import json

url = "https://dojo-demo-server.onrender.com/api/students"
r = requests.get(url)
data = r.json()

for s in data:
    if "abgrenzomorales" in str(s.get('email')).lower():
        print(f"MATCH ON RENDER: {s['id']} - {s['name']} - {s['email']} - {s['password']}")
