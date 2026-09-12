const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

code = code.replace("import { auth, db, doc, setDoc } from '../firebase';", "import { auth, db, doc, setDoc } from '../firebase';\nimport { isMockDataEnabled } from '../config/dataConfig';");

fs.writeFileSync('src/context/AuthContext.tsx', code);
