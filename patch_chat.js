const fs = require('fs');
let code = fs.readFileSync('src/services/chatService.ts', 'utf8');

const target = `  try {
    const chatColRef = collection(db, CHAT_COLLECTION);
    const q = query(chatColRef);

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {`;

const replacement = `  try {
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;

    ensureFirebaseAuth().then((user) => {
      if (isUnsubscribed) return;
      if (!user) {
         if (onError) onError(new Error("Unauthenticated"));
         return;
      }

      const chatColRef = collection(db, CHAT_COLLECTION);
      const q = query(chatColRef);

      unsubscribeSnapshot = onSnapshot(
        q,
        async (snapshot) => {`;

code = code.replace(target, replacement);

const targetEnd = `      (err) => {
        console.warn(\`Firestore snapshot listener notice for class \${normClass} (falling back to cache):\`, err);
        handleFirestoreError(err, OperationType.LIST, CHAT_COLLECTION);
        const cached = getCachedChatMessages(normClass);
        onUpdate(cached);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err) {`;

const replacementEnd = `      (err) => {
        console.warn(\`Firestore snapshot listener notice for class \${normClass} (falling back to cache):\`, err);
        handleFirestoreError(err, OperationType.LIST, CHAT_COLLECTION);
        const cached = getCachedChatMessages(normClass);
        onUpdate(cached);
        if (onError) onError(err);
      }
    );
    }).catch(err => {
      console.warn("Auth check failed:", err);
    });

    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (err) {`;

code = code.replace(targetEnd, replacementEnd);

// Add ensureFirebaseAuth to imports
if (!code.includes('ensureFirebaseAuth')) {
  code = code.replace("import { db, storage } from '../firebase';", "import { db, storage, ensureFirebaseAuth } from '../firebase';");
}

fs.writeFileSync('src/services/chatService.ts', code);
