import requests
import json
import datetime

url = "https://dojo-demo-server.onrender.com/api/students"
r = requests.get(url)
students = r.json()

today = datetime.datetime.now().strftime('%Y-%m-%d')
month = datetime.datetime.now().strftime('%Y-%m')

failed = []

for student in students:
    put_url = f"{url}/{student['id']}"
    
    # Replicate exactly what App.tsx does:
    hist = student.get('history', [])
    if not isinstance(hist, list):
        hist = []
        
    new_hist = hist.copy()
    new_hist.append({
        "date": today,
        "status": "Completado",
        "amount": student.get('monthlyFee') or 0,
        "method": "Manual/Transferencia"
    })
    
    # Payload as constructed by exactly App.tsx passing to handleUpdateStudent
    payload = student.copy()
    payload['isPaid'] = True
    payload['lastPaymentDate'] = today
    payload['lastPaymentMonth'] = month
    payload['history'] = new_hist
    
    # Note: handleUpdateStudent maps camelCase to themselves, then server maps to lowercase.
    
    response = requests.put(put_url, json=payload)
    if response.status_code != 200:
        print(f"Failed for {student['name']}: {response.text}")
        failed.append(student['name'])
    else:
        # Revert changes immediately so we don't mess up production data!
        revert_payload = student.copy()
        requests.put(put_url, json=revert_payload)

print("Failed students:", failed)
