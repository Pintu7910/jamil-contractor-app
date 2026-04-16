import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. Storage import karein

// Aapka Jamil Contractor Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkbgOXSiO_aun2KSF6XcP2epK9_kYaEio",
  authDomain: "jamil-contractor-7773f.firebaseapp.com",
  projectId: "jamil-contractor-7773f",
  storageBucket: "jamil-contractor-7773f.firebasestorage.app",
  messagingSenderId: "622846542245",
  appId: "1:622846542245:web:dda17042476ef1df46284c"
};

// Firebase initialize karna
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Services ko connect karna
const db = getFirestore(app);
const storage = getStorage(app); // 2. Storage initialize karein

// 3. 'db' ke saath 'storage' ko bhi export karein
export { db, storage }; 
