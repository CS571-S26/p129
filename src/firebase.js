import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRX_Dx3xMUwSct_Fq2I-ynnAOLnadqXNk",
  authDomain: "madcitymiles.firebaseapp.com",
  projectId: "madcitymiles",
  storageBucket: "madcitymiles.firebasestorage.app",
  messagingSenderId: "383685094243",
  appId: "1:383685094243:web:899c5439135fba9cf0c156"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };