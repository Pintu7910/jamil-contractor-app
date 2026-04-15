import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Aapka Jamil Contractor Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkbgOXSiO_aun2KSF6XcP2epK9_kYaEio",
  authDomain: "jamil-contractor-7773f.firebaseapp.com",
  projectId: "jamil-contractor-7773f",
  storageBucket: "jamil-contractor-7773f.firebasestorage.app",
  messagingSenderId: "622846542245",
  appId: "1:622846542245:web:dda17042476ef1df46284c"
};

// Next.js build ke waqt error na aaye isliye ye check zaroori hai
// Agar app pehle se initialized hai toh wahi use karega, nahi toh naya banayega
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Database (Firestore) ko connect karna
const db = getFirestore(app);

// Isko export kar rahe hain taaki dashboard aur admin page me use ho sake
export { db };
