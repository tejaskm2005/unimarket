import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <--- NEW LINE 1

const firebaseConfig = {
  apiKey: "AIzaSyAiJKIZiu8wo2cwhXSRt2uWXH24VsBiisI",
  authDomain: "unimarket-tejas.firebaseapp.com",
  projectId: "unimarket-tejas",
  storageBucket: "unimarket-tejas.firebasestorage.app",
  messagingSenderId: "623551525649",
  appId: "1:623551525649:web:530b57742bdde807dfd2b0",
  measurementId: "G-QLNSBBRRYR"
};

const app = initializeApp(firebaseConfig);

// Export the tools so the App can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app); // <--- NEW LINE 2