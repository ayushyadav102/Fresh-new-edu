const fs = require('fs');
const path = 'src/components/principal/PrincipalPortalScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const loginId = stuPhone.trim() || rollId;",
  "const loginId = stuPhone.trim() || stuName.trim().toLowerCase().replace(/\\s+/g, '') || rollId;"
);

content = content.replace(
  "Login ID: <span className=\"text-blue-600 dark:text-blue-400\">{stuPhone.trim() || `STU2026${stuClass.replace(/\\D/g, '') || '9'}${stuRoll.padStart(2, '0')}`}</span>",
  "Login ID: <span className=\"text-blue-600 dark:text-blue-400\">{stuPhone.trim() || stuName.trim().toLowerCase().replace(/\\s+/g, '') || `STU2026${stuClass.replace(/\\D/g, '') || '9'}${stuRoll.padStart(2, '0')}`}</span>"
);

// Add password to the student profile
content = content.replace(
  "studentId: loginId,",
  "studentId: loginId,\n      password: stuDob ? stuDob.split('-').reverse().join('') : 'student123',"
);

fs.writeFileSync(path, content);
