// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2ic-FST1Fk85kCLn1yzKoQVCtVQBSxJ8",
  authDomain: "daldata-b88a6.firebaseapp.com",
  projectId: "daldata-b88a6",
  storageBucket: "daldata-b88a6.appspot.com",
  messagingSenderId: "295160356566",
  appId: "1:295160356566:web:a0d7230d3b626f37b8b377",
  measurementId: "G-06030V6E0K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);