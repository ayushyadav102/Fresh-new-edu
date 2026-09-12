const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

code = code.replace(
  "setTimeout(() => {\n      const success = await login(idQuery, password, loginRole);",
  "setTimeout(async () => {\n      const success = await login(idQuery, password, loginRole);"
);
fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
