const fs = require('fs');
let code = fs.readFileSync('src/services/examService.ts', 'utf8');

const regex1 = /export const fetch([A-Za-z0-9_]+) = async \(([^)]*)\): Promise<ExamMark\[\]> => {\n  try {\n/g;
code = code.replace(regex1, (match) => {
  return match + `    const user = await ensureFirebaseAuth();\n    if (!user) throw new Error("Unauthenticated");\n`;
});

fs.writeFileSync('src/services/examService.ts', code);
