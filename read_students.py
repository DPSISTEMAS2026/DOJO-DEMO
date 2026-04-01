with open('students_list.txt', 'rb') as f:
    content = f.read().decode('utf-16le', errors='ignore')
    print(content)
