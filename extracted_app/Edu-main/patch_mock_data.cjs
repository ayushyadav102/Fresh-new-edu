const fs = require('fs');
let code = fs.readFileSync('src/data/mockData.ts', 'utf8');
code = code.replace(/password:\s*'[a-zA-Z0-9@]+',?/g, ''); // Remove all password fields from demo data
fs.writeFileSync('src/data/mockData.ts', code);
