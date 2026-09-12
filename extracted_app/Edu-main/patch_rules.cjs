const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf8');

// 1. Remove hardcoded admin email
rules = rules.replace(
  "request.auth.token.email == 'ahirayush2121@gmail.com'",
  "false"
);

// 2. Fix /users/{userId} privilege escalation
// Ensure that on create, role cannot be set to a high-privilege one unless created by an admin
const usersRulesRegex = /match \/users\/\{userId\} \{([\s\S]*?)\}/;
rules = rules.replace(usersRulesRegex, `match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isStaff());
      allow create: if isSignedIn() && request.auth.uid == userId && (!incoming().keys().hasAny(['role']) || incoming().role == 'student') || isLeadership();
      allow update: if isSignedIn() && (isLeadership() || (request.auth.uid == userId && (!incoming().keys().hasAny(['role', 'refId']) || (incoming().role == resource.data.role && incoming().refId == resource.data.refId))));
      allow delete: if isLeadership();
    }`);


// 3. Fix broad reads
function secureReadAccess(matchPath, readCondition) {
  const regex = new RegExp(`match ${matchPath} \\{[\\s\\S]*?allow read:\\s*(.*?);`, 'g');
  rules = rules.replace(regex, (match, currentCondition) => {
    return match.replace(`allow read: ${currentCondition};`, `allow read: if ${readCondition};`);
  });
}

// Students: read by self or staff
const studentRegex = /match \/students\/\{studentId\} \{[\s\S]*?allow read:\s*(.*?);/;
rules = rules.replace(studentRegex, (m, c) => m.replace(`allow read: ${c};`, `allow read: if isSignedIn() && (isStaff() || myRefId() == studentId);`));

// Teachers: read by staff, or all students can read their teachers? Students need to see teachers for timetable.
const teacherRegex = /match \/teachers\/\{teacherId\} \{[\s\S]*?allow read:\s*(.*?);/;
rules = rules.replace(teacherRegex, (m, c) => m.replace(`allow read: ${c};`, `allow read: if isSignedIn();`)); // Keep this broader or scope?

// Classes: read by staff, or all students? Timetable needs classes.
// Keep basic classes read broad if signed in.

// Exam Marks: only self or staff
const examMarksRegex = /match \/exam_marks\/\{markId\} \{[\s\S]*?allow read:\s*(.*?);/;
rules = rules.replace(examMarksRegex, (m, c) => m.replace(`allow read: ${c};`, `allow read: if isSignedIn() && (isStaff() || resource.data.studentId == myRefId());`));

// Attendance Logs: only self or staff
const attLogRegex = /match \/attendance_logs\/\{logId\} \{[\s\S]*?allow read:\s*(.*?);/;
rules = rules.replace(attLogRegex, (m, c) => m.replace(`allow read: ${c};`, `allow read: if isSignedIn() && (isStaff() || resource.data.studentId == myRefId());`));

fs.writeFileSync('firestore.rules', rules);
