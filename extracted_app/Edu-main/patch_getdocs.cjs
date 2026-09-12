const fs = require('fs');
let code = fs.readFileSync('src/services/cloudDbService.ts', 'utf8');

const regex = /export async function fetch([A-Za-z0-9_]+)FromCloud\(\): Promise<any\[\]> {\n  try {\n/g;
code = code.replace(regex, (match) => {
  return match + `    const user = await ensureFirebaseAuth();\n    if (!user) return [];\n`;
});

fs.writeFileSync('src/services/cloudDbService.ts', code);
