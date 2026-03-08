import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBcP8GtI9uVs9_607GQuxK-lcAvxIMdsEY",
  authDomain: "awoodabot.firebaseapp.com",
  projectId: "awoodabot",
  storageBucket: "awoodabot.firebasestorage.app",
  messagingSenderId: "780767961478",
  appId: "1:780767961478:web:55d63fd9d544c8d4e1cc07"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)