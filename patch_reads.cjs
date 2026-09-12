const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf8');

// Scope remaining overly broad reads
const replacements = {
  '/teachers/{teacherId}': 'if isSignedIn();', // Teachers are public within the school
  '/attendance_reports/{reportId}': 'if isSignedIn() && isStaff();',
  '/homework/{homeworkId}': 'if isSignedIn();', // Students need to see homework
  '/notices/{noticeId}': 'if isSignedIn();', // Students need to see notices
  '/classes/{classId}': 'if isSignedIn();', // Students need to see class names
  '/timetable/{timetableId}': 'if isSignedIn();', // Students need to see timetable
  '/chat_messages/{messageId}': 'if isSignedIn();', // Broad for now, usually class-scoped
  '/principals/{principalId}': 'if isSignedIn() && isStaff();',
  '/lms_materials/{materialId}': 'if isSignedIn();', // Students need to see LMS materials
  '/exam_schedule/{scheduleId}': 'if isSignedIn();', // Students need to see exam schedule
  '/school_tenants/{tenantId}': 'if isSignedIn();', // Usually public info
};

for (const [path, currentCond] of Object.entries(replacements)) {
    const matchStr = `match ${path} {`;
    const regex = new RegExp(`match ${path.replace(/\//g, '\\/').replace(/\{/g, '\\{').replace(/\}/g, '\\}')}\\s*\\{[\\s\\S]*?allow read:\\s*(.*?);`);
    rules = rules.replace(regex, (m, c) => {
        return m.replace(`allow read: ${c};`, `allow read: ${replacements[path]}`);
    });
}

fs.writeFileSync('firestore.rules', rules);
