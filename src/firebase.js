// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCasa6g8JIX1SYqshUFUOHfLSOXgm1Efac",
  authDomain: "netflix-a97e4.firebaseapp.com",
  projectId: "netflix-a97e4",
  storageBucket: "netflix-a97e4.appspot.com",
  messagingSenderId: "73623939274",
  appId: "1:73623939274:web:a7f90e7093cc6e02b76c33",
  measurementId: "G-6QDH42FVWF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;