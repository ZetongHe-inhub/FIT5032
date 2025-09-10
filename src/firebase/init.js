import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEone1AYL6d2UARVw5QSmn--SdpEWFYbE",
  authDomain: "fit5032-a1-zetong.firebaseapp.com",
  projectId: "fit5032-a1-zetong",
  storageBucket: "fit5032-a1-zetong.firebasestorage.app",
  messagingSenderId: "911815638865",
  appId: "1:911815638865:web:85199cb5a81647dee09d70"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
export { app }