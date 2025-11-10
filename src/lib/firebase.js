
import { GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const MODE = process.env.SOCIAL_MODE || process.env.NEXT_PUBLIC_SOCIAL_MODE || 'development';
console.log("DAPP MODE", MODE)

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY || 'placeholder',
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_APP_ID || '1:000000000000:web:0000000000000000000000',
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID || 'G-XXXXXXXXXX'
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const googleAuthProvider = new GoogleAuthProvider();
