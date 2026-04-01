import requests
import json
import os

url = "https://qbimxygcjjmosifsqbko.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaW14eWdjamptb3NpZnNxYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODU4NDUsImV4cCI6MjA4OTM2MTg0NX0.ZHR9SdIl0MW2jsl6toB3MnhOL7NVdDhXxVyvkid50cY"

headers = { "apikey": key, "Authorization": f"Bearer {key}" }

def check_supabase():
    # Only get students whose lastpaymentdate is 2026-03-31 or 2026-04-01
    dates = ["2026-03-31", "2026-04-01"]
    
    # We want to see if students became 'ispaid' or have history entries for those dates.
    # It might be more reliable to check all students and filter by history since lastpaymentdate might not be the most reliable for historical queries.
    r = requests.get(f"{url}/rest/v1/students?select=id,name,lastpaymentdate,ispaid,history", headers=headers)
    if r.status_code == 200:
        students = r.json()
        updated_students = []
        for s in students:
            # Check lastpaymentdate
            lp_date = s.get("lastpaymentdate")
            history = s.get("history") or []
            
            recent_history = [h for h in history if any(d in h.get("date", "") for d in dates)]
            
            if (lp_date and any(d in lp_date for d in dates)) or recent_history:
                updated_students.append({
                    "id": s["id"],
                    "name": s["name"],
                    "last_pay": lp_date,
                    "isPaid": s["ispaid"],
                    "recent_history": recent_history
                })
        
        with open("payment_report.txt", "w", encoding="utf-8") as f:
            if not updated_students:
                f.write("No students found with payment updates for Mar 31 or Apr 1 in Supabase.\n")
            else:
                f.write(f"--- UPDATED STUDENTS (MARCH 31 - APRIL 1) ---\n")
                for s in updated_students:
                    f.write(f"ID: {s['id']} | Name: {s['name']} | Last Payment: {s['last_pay']} | IsPaid: {s['isPaid']}\n")
                    for h in s["recent_history"]:
                        f.write(f"  -> {h.get('date')} | ${h.get('amount')} | {h.get('status')} | {h.get('method')} | TX: {h.get('transaction_id')}\n")
        print("Generated payment_report.txt")
    else:
        print(f"Error fetching Supabase: {r.status_code}")
        print(r.text)

if __name__ == "__main__":
    check_supabase()
