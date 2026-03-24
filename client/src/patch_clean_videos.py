import os
import re

file_path = r'd:\DOJO DEMO\client\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Filter Buttons bar
# Matches: {(['ALL', 'WHITE'... as const).map(...) } ...</div>
filter_buttons_pattern = r'\{\(\[\'ALL\',\s*\'WHITE\'.*?\}\s*<\/div>'
content = re.sub(filter_buttons_pattern, '', content, flags=re.DOTALL)

# 2. Update videos.filter mapping to general mapping
# Find: {videos.filter(v => videoFilter === 'ALL' || v.beltLevel === videoFilter).map(video => (
old_map = "videos.filter(v => videoFilter === 'ALL' || v.beltLevel === videoFilter).map(video => ("
new_map = "videos.map(video => ("
content = content.replace(old_map, new_map)

# 3. Remove Belt Badge inside Card Grid
belt_badge_pattern = r'<div className=\{`belt-badge belt-\$\{video\.beltLevel\}`\}.*?<\/div>'
content = re.sub(belt_badge_pattern, '', content, flags=re.DOTALL)

# 4. Remove Belt select from the Modal
modal_select_pattern = r'<select className=\"glass\" style=\{\{\s*padding:\s*\'1\.2rem\'\s*\}\}\s*value=\{newVideoData\.beltLevel\}.*?<\/select>'
content = re.sub(modal_select_pattern, '', content, flags=re.DOTALL)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Videos module freed from Belt constraints successfully!")
