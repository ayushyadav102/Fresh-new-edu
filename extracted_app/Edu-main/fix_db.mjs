import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore/lite';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const snap = await getDocs(collection(db, 'exam_marks'));
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (data.term === 'Periodic table' && data.isPublished === false) {
      await updateDoc(doc(db, 'exam_marks', d.id), {
        isPublished: true,
        status: 'Verified'
      });
      count++;
      console.log('Updated:', d.id);
    }
  }
  console.log(`Updated ${count} marks.`);
}
run();
