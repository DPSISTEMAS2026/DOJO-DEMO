import os

file_path = r'd:\DOJO DEMO\client\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

placeholder1 = "onClick={() => setViewMode('auth')}"
placeholder2 = "onClick={() => setViewMode('landing')}"

count1 = content.count(placeholder1)
count2 = content.count(placeholder2)

print(f"Replacing {count1} auth triggers & {count2} landing triggers for Cerrar sesión...")

content = content.replace(placeholder1, "onClick={handleLogout}")
content = content.style if hasattr(content, 'style') else content # Dummy check

# Replace auth ones that take params or others?
# Let's just do it with regex to match spaces or anything slightly different like whileTap
import re
# Match onClick={() => setViewMode('auth')} with any spacing
content = re.sub(r"onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*setViewMode\(\s*['\"]auth['\"]\s*\)\s*\}", "onClick={handleLogout}", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ App.tsx logout triggers updated successfully!")
