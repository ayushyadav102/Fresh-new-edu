const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// Exam marks validation (must be staff assigned to class? We don't have teacher classes in rules easily, but at least require valid data)
// We leave it as isStaff() for now since rules can't easily check teacher's classes without complex reads, but we will fix the 'dev-token' and Auth stuff.

fs.writeFileSync('firestore.rules', rules);
