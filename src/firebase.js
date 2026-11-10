// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKyXoKr07kdyJ6q6R-uHTXA-h0LpJGQmo",
  authDomain: "darlink-b99f3.firebaseapp.com",
  databaseURL: "https://darlink-b99f3-default-rtdb.firebaseio.com",
  projectId: "darlink-b99f3",
  storageBucket: "darlink-b99f3.firebasestorage.app",
  messagingSenderId: "999055665196",
  appId: "1:999055665196:web:ad3fcce9cfaac8bcd2c989",
  measurementId: "G-8VSMC7VQV9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
