import requests
import json
import datetime

url = "https://dojo-demo-server.onrender.com/api/students"
r = requests.get(url)
students = r.json()

target_student = next((s for s in students if s.get('history') is not None), None)
if not target_student:
    target_student = students[0]

put_url = f"{url}/{target_student['id']}"

today = datetime.datetime.now().strftime('%Y-%m-%d')
month = datetime.datetime.now().strftime('%Y-%m')

hist = target_student.get('history', [])
if not isinstance(hist, list):
    hist = []
    
hist.append({
    "date": today,
    "status": "Completado",
    "amount": int(target_student.get('monthlyFee') or 0),
    "method": "Manual/Transferencia"
})

payload = {
    "isPaid": True,
    "lastPaymentDate": today,
    "lastPaymentMonth": month,
    "history": hist
}

print(f"Updating {target_student['name']} ({target_student['id']})")
print("Payload:", json.dumps(payload))

response = requests.put(put_url, json=payload)
print("Status:", response.status_code)
print("Response:", response.text)

