import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDaAYe_UArTvGZnbtLRUyX1yui5B1TiPow",
  authDomain: "bs-web-8233e.firebaseapp.com",
  projectId: "bs-web-8233e",
  storageBucket: "bs-web-8233e.firebasestorage.app",
  messagingSenderId: "470749792528",
  appId: "1:470749792528:web:d20149adaf9c4b9ea6fd95",
  measurementId: "G-6RTDG7YR7P"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
