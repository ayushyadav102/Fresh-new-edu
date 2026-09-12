import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Read firebase config from somewhere? Or since it's local I might not have it in the script context easily.
