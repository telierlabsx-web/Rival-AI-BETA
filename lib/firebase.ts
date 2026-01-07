import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAt9ipFPkL2a7wjnps99evG5O7Z2devMvs",
  authDomain: "rival-ai.firebaseapp.com",
  projectId: "rival-ai",
  storageBucket: "rival-ai.firebasestorage.app",
  messagingSenderId: "521740508102",
  appId: "1:521740508102:web:38a8fc1ad7fc3691eb30c7",
  measurementId: "G-2SGVS5KZ0C"
};

// Inisialisasi Singleton pattern biar gak error pas hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Memaksa pilihan akun Google muncul
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginAnonymously = () => signInAnonymously(auth);
export const logout = () => signOut(auth);
export { onAuthStateChanged };
