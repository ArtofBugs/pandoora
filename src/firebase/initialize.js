import { initializeApp } from 'firebase/app'
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'

// Firebase config values are in .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

console.log(firebaseConfig)

const app = initializeApp(firebaseConfig)

export default function getDb() {
  return initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  })
  // The default is to use
  // return getFirestore(app)
  // but initializeFirestore lets you add arguments;
  // the CACHE_SIZE_UNLIMITED one lets you store data offline
}
