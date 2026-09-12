const fs = require('fs');
const path = 'src/context/ERPContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace mockData import
content = content.replace(
  /import {([^}]+)} from "\.\.\/data\/mockData";/,
  (match, p1) => {
    const newImports = ['PIYUSH_PANWAR', 'SEMESTER_RESULTS', 'EXAM_SCHEDULE', 'ACADEMIC_CALENDAR_EVENTS', 'MENTOR_LOGS'];
    const exist = p1.split(',').map(s => s.trim());
    newImports.forEach(ni => {
      if (!exist.includes(ni)) exist.push(ni);
    });
    return `import { ${exist.join(', ')} } from "../data/mockData";`;
  }
);

// replace cloudDbService import
content = content.replace(
  /import {([^}]+)} from "\.\.\/services\/cloudDbService";/,
  (match, p1) => {
    const newImports = ['fetchAttendanceReportsFromCloud', 'fetchStudentsFromCloud', 'seedInitialDataToFirestore', 'fetchTeachersFromCloud', 'saveAttendanceToCloud'];
    const exist = p1.split(',').map(s => s.trim()).filter(Boolean);
    newImports.forEach(ni => {
      if (!exist.includes(ni)) exist.push(ni);
    });
    return `import { ${exist.join(', ')} } from "../services/cloudDbService";`;
  }
);

// replace type import
content = content.replace(
  /import {([^}]+)} from '\.\.\/types';/,
  (match, p1) => {
    const newImports = ['TeacherClassCode'];
    const exist = p1.split(',').map(s => s.trim()).filter(Boolean);
    newImports.forEach(ni => {
      if (!exist.includes(ni)) exist.push(ni);
    });
    return `import { ${exist.join(', ')} } from '../types';`;
  }
);

fs.writeFileSync(path, content);
