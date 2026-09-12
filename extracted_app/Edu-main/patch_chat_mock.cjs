const fs = require('fs');
let code = fs.readFileSync('src/services/chatService.ts', 'utf8');

if (!code.includes('isMockDataEnabled')) {
  code = code.replace(
    "import { db, auth, ensureFirebaseAuth } from '../firebase';",
    "import { db, auth, ensureFirebaseAuth } from '../firebase';\nimport { isMockDataEnabled } from '../config/dataConfig';"
  );
}

code = code.replace(
  `export async function sendChatMessage(message: ChatMessage): Promise<{ success: boolean; error?: string }> {\n  const normClass = normalizeClassCode(message.classCode || message.className);`,
  `export async function sendChatMessage(message: ChatMessage): Promise<{ success: boolean; error?: string }> {\n  if (isMockDataEnabled()) return { success: true };\n  const normClass = normalizeClassCode(message.classCode || message.className);`
);

fs.writeFileSync('src/services/chatService.ts', code);
