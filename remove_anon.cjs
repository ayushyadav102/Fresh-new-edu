const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

code = code.replace(/const userCred = await signInAnonymously\(auth\);\n\s*currentUser = userCred\.user;/, "console.warn('Skipping write: Not authenticated'); return;");
code = code.replace("import { signInAnonymously } from 'firebase/auth';", "");

fs.writeFileSync('src/context/AuthContext.tsx', code);
