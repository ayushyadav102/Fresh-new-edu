import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

// Load firebase-applet-config.json for project ID
const config = JSON.parse(readFileSync("firebase-applet-config.json", "utf8"));
const projectId = config.projectId;

const app = initializeApp({ projectId });
const db = getFirestore(app);

async function clearCollection() {
  const snapshot = await db.collection("exam_marks").get();
  
  if (snapshot.size === 0) {
    console.log("No exam marks found.");
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`Deleted ${snapshot.size} exam marks.`);
}

clearCollection().catch(console.error);
