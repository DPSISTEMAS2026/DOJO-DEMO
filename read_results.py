with open('paula_search_results.txt', 'rb') as f:
    content = f.read().decode('utf-16le', errors='ignore')
    print(content)
