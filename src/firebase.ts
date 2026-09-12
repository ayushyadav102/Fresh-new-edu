import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, setLogLevel, initializeFirestore, collection, doc, setDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// NOTE: We intentionally do NOT auto sign-in anonymously here anymore.
// firestore.rules gates most collections on isSignedIn(), and an automatic
// anonymous session made every unauthenticated visitor pass that check —
// letting anyone read school-wide data (teachers, notices, timetable, chat,
// etc.) without ever logging in. Firestore access now only becomes available
// after a real login via AuthContext (signInWithEmailAndPassword) or, in
// mock mode, not at all (mock mode never touches Firestore).
//
// If a specific feature genuinely needs anonymous access to a narrow, public
// resource, call signInAnonymously(auth) explicitly at that call site — never
// as a blanket default for the whole app.
export function ensureFirebaseAuth(): Promise<any> {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

// Initialize Cloud Firestore database with the provisioned database ID
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Cloud Storage for media attachments (Photos, PDFs, Videos)
export const storage = getStorage(app, firebaseConfig.storageBucket);

export { collection, doc, setDoc, getDocs, onSnapshot };


// Suppress Firestore offline connection warnings in the preview environment
setLogLevel('silent');
