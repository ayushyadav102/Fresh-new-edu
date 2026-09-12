const fs = require('fs');
let code = fs.readFileSync('src/context/ERPContext.tsx', 'utf8');

// Replace the specific import line to include both
code = code.replace(
  "import { isMockDataEnabled } from '../config/dataConfig';",
  "import { isMockDataEnabled, getDataMode } from '../config/dataConfig';"
);

fs.writeFileSync('src/context/ERPContext.tsx', code);
