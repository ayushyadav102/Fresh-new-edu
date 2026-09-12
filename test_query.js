import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Need to use the applet's firebase config, let's just build a tiny node script that imports from src/firebase.ts
