import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { readFileSync } from "fs";

// Load firebase-applet-config.json
const config = JSON.parse(readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp({
  projectId: config.projectId,
  apiKey: config.apiKey,
  authDomain: config.authDomain
});
const db = getFirestore(app, config.firestoreDatabaseId);

async function clearCollection() {
  const snapshot = await getDocs(collection(db, "exam_marks"));
  
  if (snapshot.size === 0) {
    console.log("No exam marks found.");
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(doc(db, "exam_marks", d.id));
  });
  
  await batch.commit();
  console.log(`Deleted ${snapshot.size} exam marks.`);
}

clearCollection().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
