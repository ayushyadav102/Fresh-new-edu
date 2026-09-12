import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const cred = await signInAnonymously(auth);
    console.log("Signed in:", cred.user.uid);
    
    await setDoc(doc(db, 'students', 'test-123'), {
      id: 'test-123',
      name: 'Test Student'
    }, { merge: true });
    console.log("Student saved!");
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}
run();
