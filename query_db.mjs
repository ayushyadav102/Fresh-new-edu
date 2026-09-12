import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'exam_marks'));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    console.log(doc.id, " => ", doc.data());
  });
  process.exit(0);
}
run();
