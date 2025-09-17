import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCo8HkDvYSlf7aIjdyZf7l7UXBIGuoCiVw",
  authDomain: "greengarden-29fff.firebaseapp.com",
  projectId: "greengarden-29fff",
  storageBucket: "greengarden-29fff.firebasestorage.app",
  messagingSenderId: "323720042814",
  appId: "1:323720042814:web:8dbdc8b471173b5086b46f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app);
