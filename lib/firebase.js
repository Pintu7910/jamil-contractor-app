// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkbgOXSiO_aun2KSF6XcP2epK9_kYaEio",
  authDomain: "jamil-contractor-7773f.firebaseapp.com",
  projectId: "jamil-contractor-7773f",
  storageBucket: "jamil-contractor-7773f.firebasestorage.app",
  messagingSenderId: "622846542245",
  appId: "1:622846542245:web:dda17042476ef1df46284c",
  measurementId: "G-LVHRWCH4VX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
