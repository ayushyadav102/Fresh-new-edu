const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// Insert isDemoUser() function before users collection
rules = rules.replace(
  "    // Users Collection",
  "    function isDemoUser() {\n      return isSignedIn() && request.auth.token.email.matches('.*@edux\\\\.demo');\n    }\n\n    // Users Collection"
);

// Update users create rule
rules = rules.replace(
  "      allow create: if isSignedIn() && request.auth.uid == userId && (!incoming().keys().hasAny(['role']) || incoming().role == 'student') || isLeadership();",
  "      allow create: if isSignedIn() && request.auth.uid == userId && (!incoming().keys().hasAny(['role']) || incoming().role == 'student' || isDemoUser()) || isLeadership();"
);

fs.writeFileSync('firestore.rules', rules);
