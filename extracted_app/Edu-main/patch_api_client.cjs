const fs = require('fs');

let code = fs.readFileSync('src/lib/api-client.ts', 'utf8');
code = code.replace(
  `  if (token) {\n    headers.set('Authorization', \`Bearer \${token}\`);\n  } else {\n    headers.set('Authorization', 'Bearer dev-token');\n  }`,
  `  if (token) {\n    headers.set('Authorization', \`Bearer \${token}\`);\n  } else if (import.meta.env.DEV) {\n    headers.set('Authorization', 'Bearer dev-token');\n  }`
);
fs.writeFileSync('src/lib/api-client.ts', code);
