import requests
import json

url = "https://qbimxygcjjmosifsqbko.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaW14eWdjamptb3NpZnNxYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODU4NDUsImV4cCI6MjA4OTM2MTg0NX0.ZHR9SdIl0MW2jsl6toB3MnhOL7NVdDhXxVyvkid50cY"

headers = { "apikey": key, "Authorization": f"Bearer {key}" }

def check_inconsistencies():
    r = requests.get(f"{url}/rest/v1/students?select=id,name,lastpaymentdate,ispaid,history", headers=headers)
    if r.status_code == 200:
        students = r.json()
        broken = []
        for s in students:
            history = s.get("history") or []
            paid_in_april = any("2026-04" in h.get("date", "") for h in history if h.get("status") == "Completado")
            
            if paid_in_april and not s.get("ispaid"):
                broken.append({
                    "id": s["id"],
                    "name": s["name"],
                    "history": history
                })
        
        print(f"Found {len(broken)} students with inconsistencies (paid in April but ispaid=False):")
        for b in broken:
            print(f"- {b['name']} (ID: {b['id']})")
    else:
        print(f"Error: {r.status_code}")

if __name__ == "__main__":
    check_inconsistencies()
