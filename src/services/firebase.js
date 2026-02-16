import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ GARDE TES VRAIES VALEURS FIREBASE ICI
const firebaseConfig = {
  apiKey: "AIzaSyCJm-EknBE0w6K38SswwXJ7xEkw9S16NYo",
  authDomain: "quiz-ramadan-1a392.firebaseapp.com",
  projectId: "quiz-ramadan-1a392",
  storageBucket: "quiz-ramadan-1a392.firebasestorage.app",
  messagingSenderId: "871229279350",
  appId: "1:871229279350:web:08e23d674fb3b335d6e357"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Initialise Authentication
export const auth = getAuth(app);

// Initialise Firestore
export const db = getFirestore(app);

export default app;