const fs = require('fs');
const path = 'src/components/principal/PrincipalPortalScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldHandle = `  const handlePrincipalAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim()) return;

    const classNum = stuClass.replace(/\\D/g, '') || '9';
    const rollId = \`STU2026\${classNum}\${stuRoll.padStart(2, '0')}\`;
    const generatedEmail =
      stuEmail.trim() || \`\${stuName.toLowerCase().replace(/\\s+/g, '')}\${stuRoll}@stxaviors.edu.in\`;

    const newStudentProfile = addNewStudent({
      studentId: rollId,`;

const newHandle = `  const handlePrincipalAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim()) return;

    const classNum = stuClass.replace(/\\D/g, '') || '9';
    const rollId = \`STU2026\${classNum}\${stuRoll.padStart(2, '0')}\`;
    const loginId = stuPhone.trim() || rollId;
    const generatedEmail =
      stuEmail.trim() || \`\${loginId.toLowerCase()}@edux.demo\`;

    const newStudentProfile = addNewStudent({
      studentId: loginId,`;

if (content.includes(oldHandle)) {
  content = content.replace(oldHandle, newHandle);
  console.log("Replaced handlePrincipalAddStudent!");
} else {
  console.log("Could not find handlePrincipalAddStudent!");
}

const oldUI = `              {/* Auto-Generated Unique ID Banner */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                    Auto-Generated Student ERP Credentials
                  </span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-xs">
                    Login ID: <span className="text-blue-600 dark:text-blue-400">STU2026{stuClass.replace(/\\D/g, '') || '9'}{stuRoll.padStart(2, '0')}</span> • Password: <span className="text-slate-600 dark:text-slate-300 font-normal">student123</span>
                  </p>
                </div>`;

const newUI = `              {/* Auto-Generated Unique ID Banner */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                    Auto-Generated Student ERP Credentials
                  </span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-xs">
                    Login ID: <span className="text-blue-600 dark:text-blue-400">{stuPhone.trim() || \`STU2026\${stuClass.replace(/\\D/g, '') || '9'}\${stuRoll.padStart(2, '0')}\`}</span> • Password: <span className="text-slate-600 dark:text-slate-300 font-normal">{stuDob ? stuDob.split('-').reverse().join('') : 'student123'}</span>
                  </p>
                </div>`;

if (content.includes(oldUI)) {
  content = content.replace(oldUI, newUI);
  console.log("Replaced UI!");
} else {
  console.log("Could not find UI block!");
}

fs.writeFileSync(path, content);
