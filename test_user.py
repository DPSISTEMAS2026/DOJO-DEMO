import requests

url = ""
key = ""

with open(r'd:\DOJO DEMO\.env', 'r') as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split('=', 1)
            if k == "SUPABASE_URL": url = v
            elif k == "SUPABASE_ANON_KEY": key = v

r = requests.get(f"{url}/rest/v1/students?select=name,email,password", headers={"apikey": key, "Authorization": f"Bearer {key}"})
students = r.json()

valid = [s for s in students if s.get('email') and s.get('password')]

if valid:
    print("\n--- USUARIO DE PRUEBA ENCONTRADO ---")
    print(f"Nombre: {valid[0]['name']}")
    print(f"Email: {valid[0]['email']}")
    print(f"Password: {valid[0]['password']}")
else:
    print("\nNo hay alumnos con password creado. Creando uno de prueba...")
    # Si no hay, creamos uno de prueba para el usuario!
    # ... o simplemente se puede crear en el botón "Nuevo Alumno"
    print("Puedes crear uno desde el Panel de Administración dándole un Correo y Contraseña.")
