import os
import re

file_path = r'd:\DOJO DEMO\client\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will find all <table statements, then find its corresponding </table> and wrap them in a responsive div
table_pattern = re.compile(r'(<table\s[^>]*>.*?</table>)', re.DOTALL)

def wrap_table(match):
    table_content = match.group(1)
    return f'<div style={{{{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}}}>{table_content}</div>'

new_content = table_pattern.sub(wrap_table, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ All tables wrapped inside responsive scroll containers using regex successfully!")
