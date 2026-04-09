import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBNfiz_u-j8z7p6GUfiR8_73Ndgq29mQsQ",
  authDomain: "pizzaconnect-88a38.firebaseapp.com",
  projectId: "pizzaconnect-88a38",
  storageBucket: "pizzaconnect-88a38.firebasestorage.app",
  messagingSenderId: "930872308219",
  appId: "1:930872308219:web:136675223d08fbb9e75b5e"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);