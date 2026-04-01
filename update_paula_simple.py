import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Manual load .env
dotenv_vars = {}
with open('.env', 'r') as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split('=', 1)
            dotenv_vars[k] = v

url = dotenv_vars['SUPABASE_URL']
key = dotenv_vars['SUPABASE_ANON_KEY']
headers = { "apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json" }

email = "abgrenzomorales@gmail.com"
new_password = "PAULA" # Simple password for testing

# Update password in Supabase
r = requests.patch(f"{url}/rest/v1/students?email=eq.{email}", headers=headers, json={"password": new_password})
if r.status_code < 300:
    print(f"✅ Contraseña actualizada en base de datos para {email}: {new_password}")
else:
    print(f"❌ Error al actualizar contraseña: {r.text}")
    exit(1)

# Send Email via SMTP
# Since password changed, better send another mail or just inform the user.
# I'll send the mail anyway.

smtp_host = dotenv_vars['SMTP_HOST']
smtp_port = int(dotenv_vars.get('SMTP_PORT', 587))
smtp_user = dotenv_vars['SMTP_USER']
smtp_pass = dotenv_vars['SMTP_PASS']
smtp_from = dotenv_vars['SMTP_FROM']

msg = MIMEMultipart()
msg['From'] = f"Dojo Ranas 🐸 <{smtp_from}>"
msg['To'] = email
msg['Subject'] = 'Tus credenciales de acceso (Actualizado) - Dojo Ranas 🐸'

html = f"""
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; padding: 2.5rem; border-radius: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="color: #05a86a; margin-top: 1rem; font-size: 1.8rem;">¡Hola Paula!</h2>
        <p style="font-size: 1.1rem; color: #64748b; margin-top: 0.5rem;">Hemos actualizado tu contraseña para asegurar tu acceso.</p>
    </div>
    
    <div style="background: #f8fafc; padding: 2rem; border-radius: 1.5rem; margin-bottom: 2rem; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 1rem 0; font-weight: 800; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">TUS NUEVOS DATOS DE ACCESO:</p>
        <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Email:</strong> {email}</p>
        <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Contraseña:</strong> <span style="background: #05a86a; color: #fff; padding: 2px 8px; border-radius: 6px;">{new_password}</span></p>
        
        <a href="https://ranasjiujitsu.cl" style="display: block; background: #05a86a; color: #fff; padding: 1.2rem; text-decoration: none; border-radius: 1rem; font-weight: 800; text-align: center; margin-top: 2rem; box-shadow: 0 10px 20px rgba(5,168,106,0.2);">ENTRAR AL PORTAL 🥋</a>
    </div>

    <p style="font-size: 0.85rem; color: #94a3b8; text-align: center; margin-top: 3rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
        <strong>Dojo Ranas Concepción</strong> - Orompello 1421
    </p>
</div>
"""

msg.attach(MIMEText(html, 'html'))

try:
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_pass)
    server.send_message(msg)
    server.quit()
    print(f"✅ Email enviado correctamente a {email}")
except Exception as e:
    print(f"❌ Error al enviar email: {e}")
