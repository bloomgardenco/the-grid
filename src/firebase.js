// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkS9AipB_shTqFi7w1OpiIwUfEHHBDuw4",
  authDomain: "the-grid-27d56.firebaseapp.com",
  projectId: "the-grid-27d56",
  storageBucket: "the-grid-27d56.firebasestorage.app",
  messagingSenderId: "979216699517",
  appId: "1:979216699517:web:fb6aceaf726c38b021a114"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);