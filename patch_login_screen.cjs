const fs = require('fs');

let loginCode = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

// Restore student demo password
loginCode = loginCode.replace(/selectDemoStudent\(stu\.studentId, ''\)/g, "selectDemoStudent(stu.studentId, 'piyush123')");

// Restore teacher demo password
loginCode = loginCode.replace(/selectDemoTeacher\(tech\.teacherId, ''\)/g, "selectDemoTeacher(tech.teacherId, 'piyush123')");

// Restore principal demo password
loginCode = loginCode.replace(/const selectDemoPrincipal = \(\) => \{\n\s*setLoginRole\('principal'\);\n\s*setIdQuery\('PRN001'\);\n\s*setPassword\(''\);/, "const selectDemoPrincipal = () => {\n    setLoginRole('principal');\n    setIdQuery('PRN001');\n    setPassword('principal123');");

// Restore superadmin demo password
loginCode = loginCode.replace(/const selectDemoSuperAdmin = \(\) => \{\n\s*setLoginRole\('superadmin'\);\n\s*setIdQuery\('superadmin01'\);\n\s*setPassword\(''\);/, "const selectDemoSuperAdmin = () => {\n    setLoginRole('superadmin');\n    setIdQuery('superadmin01');\n    setPassword('SuperAdmin#Xavier2026');");

fs.writeFileSync('src/components/auth/LoginScreen.tsx', loginCode);
