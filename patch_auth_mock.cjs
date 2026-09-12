const fs = require('fs');

let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// Add import if needed
if (!code.includes('isMockDataEnabled')) {
  code = code.replace("import { auth, db } from '../firebase';", "import { auth, db } from '../firebase';\nimport { isMockDataEnabled } from '../config/dataConfig';");
}

code = code.replace(
  `const writeUserRoleToFirestore = async (userRole: string, refId: string) => {\n  try {\n    let currentUser = auth.currentUser;`,
  `const writeUserRoleToFirestore = async (userRole: string, refId: string) => {\n  if (isMockDataEnabled()) return;\n  try {\n    let currentUser = auth.currentUser;`
);

fs.writeFileSync('src/context/AuthContext.tsx', code);
