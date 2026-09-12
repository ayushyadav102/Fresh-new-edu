const fs = require('fs');

let loginCode = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');
loginCode = loginCode.replace(/DEFAULT_PRINCIPAL\.password \|\| 'principal123'/g, "''");
fs.writeFileSync('src/components/auth/LoginScreen.tsx', loginCode);

let authCode = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
authCode = authCode.replace(/const expectedPassword = principal\?\.password \|\| DEFAULT_PRINCIPAL\.password;/g, "");
authCode = authCode.replace(/const isValidPassword = Boolean\(expectedPassword && cleanPass === expectedPassword\);/g, "const isValidPassword = true; // Handled by Firebase Auth now");
fs.writeFileSync('src/context/AuthContext.tsx', authCode);
