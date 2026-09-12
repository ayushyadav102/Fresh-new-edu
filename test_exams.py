import re
with open('src/components/teacher/TeacherGradebookView.tsx', 'r') as f:
    content = f.read()

print("useERP" in content)
