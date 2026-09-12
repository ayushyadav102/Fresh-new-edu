const fs = require('fs');

let authMiddleware = fs.readFileSync('src/middleware/auth.ts', 'utf8');
authMiddleware = authMiddleware.replace(
  "if (process.env.NODE_ENV !== 'production' && (token === 'dev-token' || token.startsWith('test-token'))) {",
  "if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_TEST_AUTH === 'true' && (token === 'dev-token' || token.startsWith('test-token'))) {"
);
fs.writeFileSync('src/middleware/auth.ts', authMiddleware);

let apiClient = fs.readFileSync('src/lib/api-client.ts', 'utf8');
apiClient = apiClient.replace(
  "headers.set('Authorization', 'Bearer dev-token');",
  "if (import.meta.env.DEV && import.meta.env.VITE_ALLOW_TEST_AUTH === 'true') {\n      headers.set('Authorization', 'Bearer dev-token');\n    }"
);
fs.writeFileSync('src/lib/api-client.ts', apiClient);
