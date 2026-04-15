import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAkbgOXSiO_aun2KSF6XcP2epK9_kYaEio",
  authDomain: "jamil-contractor-7773f.firebaseapp.com",
  projectId: "jamil-contractor-7773f",
  storageBucket: "jamil-contractor-7773f.firebasestorage.app",
  messagingSenderId: "622846542245",
  appId: "1:622846542245:web:dda17042476ef1df46284c",
  measurementId: "G-LVHRWCH4VX"
};

// Initialize Firebase (Next.js safe way)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Analytics setup (Sirf browser mein chalega)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { auth, db, provider, analytics };
