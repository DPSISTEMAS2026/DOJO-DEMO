import requests

url = "https://dojo-demo-server.onrender.com/api/students"
r = requests.get(url)
data = r.json()

matches = [s for s in data if s.get('email') and s['email'].lower() == 'abgrenzomorales@gmail.com']
print(matches[0] if matches else "NOT FOUND")
