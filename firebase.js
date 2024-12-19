// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAX17tGH4g1UaokfMtzMv3SH33zpAbfeV4",
  authDomain: "skillrack-tracker.firebaseapp.com",
  projectId: "skillrack-tracker",
  storageBucket: "skillrack-tracker.firebasestorage.app",
  messagingSenderId: "42205378393",
  appId: "1:42205378393:web:c16cc4e17d52c1fcaa7e48",
  measurementId: "G-4YYWY1D43C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);