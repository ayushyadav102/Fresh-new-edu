const fs = require('fs');
const path = 'src/context/ERPContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// import the real functions
content = content.replace(
  /import { isMockDataEnabled, getDataMode } from "\.\.\/config\/dataConfig";/,
  'import { isMockDataEnabled, getDataMode, toggleMockDataMode, setMockDataMode } from "../config/dataConfig";'
);

// fix the recursive calls
content = content.replace(
  /const next = toggleDataMode\(\);/,
  'const next = toggleMockDataMode();'
);
content = content.replace(
  /setDataMode\(useMock\);/,
  'setMockDataMode(useMock);'
);

fs.writeFileSync(path, content);
