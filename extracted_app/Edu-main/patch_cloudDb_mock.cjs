const fs = require('fs');

let code = fs.readFileSync('src/services/cloudDbService.ts', 'utf8');

if (!code.includes('isMockDataEnabled')) {
  code = code.replace(
    "import { db, storage, ensureFirebaseAuth } from '../firebase';",
    "import { db, storage, ensureFirebaseAuth } from '../firebase';\nimport { isMockDataEnabled } from '../config/dataConfig';"
  );
}

// Add early exit to save functions
const saveFuncs = ['saveStudentToCloud', 'saveTeacherToCloud', 'saveNoticeToCloud', 'saveHomeworkToCloud', 'saveTimetableToCloud', 'saveClassToCloud', 'saveAttendanceToCloud', 'seedInitialDataToFirestore'];

saveFuncs.forEach(func => {
  const regex = new RegExp(`export async function ${func}\\((.*?)\\): Promise<(.*?)> {\\n  try {`, 'g');
  code = code.replace(regex, (match, p1, p2) => {
    let retValue = 'false';
    if (func === 'saveAttendanceToCloud') retValue = '{ success: false, error: "Mock Mode" }';
    if (func === 'seedInitialDataToFirestore') retValue = '{ success: false, seededCount: 0 }';
    return `export async function ${func}(${p1}): Promise<${p2}> {\n  if (isMockDataEnabled()) return ${retValue} as any;\n  try {`;
  });
});

fs.writeFileSync('src/services/cloudDbService.ts', code);
