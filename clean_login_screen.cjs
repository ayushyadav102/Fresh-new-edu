const fs = require('fs');

let loginCode = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

// Ensure no plain text default passwords
loginCode = loginCode.replace(/useState\('piyush123'\)/g, "useState('')");
loginCode = loginCode.replace(/selectDemoStudent\(stu.studentId, stu.password\)/g, "selectDemoStudent(stu.studentId, '')");
loginCode = loginCode.replace(/selectDemoTeacher\(tech.teacherId, tech.password\)/g, "selectDemoTeacher(tech.teacherId, '')");

// Also remove `setPassword(...)` inside demo selectors so they don't set plain text passwords.
// But they can just be empty strings now.

fs.writeFileSync('src/components/auth/LoginScreen.tsx', loginCode);
