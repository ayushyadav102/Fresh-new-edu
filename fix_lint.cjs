const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

if (!code.includes('import { isMockDataEnabled }')) {
  code = code.replace("import { auth, db } from '../firebase';", "import { auth, db } from '../firebase';\nimport { isMockDataEnabled } from '../config/dataConfig';");
}
fs.writeFileSync('src/context/AuthContext.tsx', code);
