const fs = require('fs');

let code = fs.readFileSync('src/context/ERPContext.tsx', 'utf8');

code = code.replace(
  "import {\n  DEMO_STUDENTS,\n  DEMO_TEACHERS,\n sortTimetableSlots, getTodayDateString } from '../utils/timetableUtils';",
  "import { DEMO_STUDENTS, DEMO_TEACHERS } from '../data/mockData';\nimport { sortTimetableSlots, getTodayDateString } from '../utils/timetableUtils';"
);

// Also try it without the leading newline on sortTimetableSlots in case my regex didn't match exactly
code = code.replace(
  "import {\n  DEMO_STUDENTS,\n  DEMO_TEACHERS,\n  sortTimetableSlots, getTodayDateString } from '../utils/timetableUtils';",
  "import { DEMO_STUDENTS, DEMO_TEACHERS } from '../data/mockData';\nimport { sortTimetableSlots, getTodayDateString } from '../utils/timetableUtils';"
);

// Just completely nuke the bad import and replace it
code = code.replace(/import\s*\{\s*DEMO_STUDENTS,\s*DEMO_TEACHERS,\s*sortTimetableSlots,\s*getTodayDateString\s*\}\s*from\s*'..\/utils\/timetableUtils';/, 
"import { DEMO_STUDENTS, DEMO_TEACHERS } from '../data/mockData';\nimport { sortTimetableSlots, getTodayDateString } from '../utils/timetableUtils';");

fs.writeFileSync('src/context/ERPContext.tsx', code);
