const fs = require('fs');
let code = fs.readFileSync('src/services/chatService.ts', 'utf8');

const target = `  // Immediately provide class-scoped cached messages so UI is instant and never blocked
  const initialCache = getCachedChatMessages(normClass);
  onUpdate(initialCache);

  try {`;

const replace = `  // Immediately provide class-scoped cached messages so UI is instant and never blocked
  const initialCache = getCachedChatMessages(normClass);
  onUpdate(initialCache);

  if (isMockDataEnabled()) {
    const classSeed = INITIAL_DEMO_MESSAGES_BY_CLASS[normClass] || [];
    onUpdate(classSeed);
    return () => {};
  }

  try {`;

code = code.replace(target, replace);
fs.writeFileSync('src/services/chatService.ts', code);
