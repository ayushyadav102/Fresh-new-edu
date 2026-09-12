const fs = require('fs');

let code = fs.readFileSync('src/services/cloudDbService.ts', 'utf8');
code = code.replace(/ensureFirebaseAuth\(\)\.then\(\(user\) => {/g, "ensureFirebaseAuth().then((user: any) => {");
fs.writeFileSync('src/services/cloudDbService.ts', code);

