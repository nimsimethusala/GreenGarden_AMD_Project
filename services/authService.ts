import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase";
import { auth } from "@/firebase";
import { Role, UserProfile } from "@/types/User";

// ========== SIGN UP ==========
export const signup = async (options: { 
    email: string; 
    password: string; 
    username: string; 
    role?: Role; 
    avatarBlob?: Blob | null 
  }) => {
    const { email, password, username, role = "user", avatarBlob } = options;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    let photoURL: string | null = null;
    if (avatarBlob) {
      const storageRef = ref(storage, `avatars/${uid}.jpg`);
      await uploadBytes(storageRef, avatarBlob);
      photoURL = await getDownloadURL(storageRef);
    }

    const profile: UserProfile = {
      id: uid,
      username,
      email,
      photoURL,
      role,
      isDisabled: false,
    };

    await setDoc(doc(db, "users", uid), profile);

    return profile;
  }

  // ========== LOGIN ==========
  export const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // ========== LOGOUT ==========
  export const logout = async () => {
    return signOut(auth);
  }