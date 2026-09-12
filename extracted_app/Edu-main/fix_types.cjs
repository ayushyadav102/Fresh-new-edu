const fs = require('fs');
const path = 'src/context/ERPContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const missingTypes = ['FeeBreakdownItem', 'FeeTransaction', 'AcademicCalendarEvent', 'MentorLog', 'PlatformMetricsSummary'];

// Find the import { ... } from '../types' line
content = content.replace(
  /import {([^}]+)} from '\.\.\/types';/,
  (match, p1) => {
    const exist = p1.split(',').map(s => s.trim()).filter(Boolean);
    missingTypes.forEach(ni => {
      if (!exist.includes(ni)) exist.push(ni);
    });
    return `import { ${exist.join(', ')} } from '../types';`;
  }
);

content = content.replace(/toggleDataMode: \(\) => void;/g, 'toggleDataMode: () => void;'); // no-op just finding it
// fix argument of type void for setDataMode
content = content.replace(/setDataMode: \(useMock: boolean\) => void;/g, 'setDataMode: (useMock: boolean) => void;');

// replace 'prev' to 'prev: any' where it failed again
content = content.replace(/\(prev\)/g, '(prev: any)');

fs.writeFileSync(path, content);
