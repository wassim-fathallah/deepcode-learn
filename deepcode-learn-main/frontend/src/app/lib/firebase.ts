
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
  

const firebaseConfig = {
  apiKey: "AIzaSyAcfnqsTh1bSNZDquWNAPWBUclpL-nJFxg",
  authDomain: "deepcode-learn.firebaseapp.com",
  projectId: "deepcode-learn",
  storageBucket: "deepcode-learn.firebasestorage.app",
  messagingSenderId: "729244179875",
  appId: "1:729244179875:web:eacae105f7094494bcce16",
  measurementId: "G-LXDV5EWYCS"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app


