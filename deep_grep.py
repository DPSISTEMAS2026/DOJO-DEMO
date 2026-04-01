import os

def search_paula(directory):
    for root, dirs, files in os.walk(directory):
        if '.git' in root or 'node_modules' in root or '.venv' in root:
            continue
        for file in files:
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f, 1):
                        if 'paula' in line.lower():
                            print(f"{path}:{i}: {line.strip()}")
            except:
                pass

search_paula('.')
