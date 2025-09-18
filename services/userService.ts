import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserProfile, Role } from "@/types/User";

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

  // ========== GET A USER PROFILE ==========
  export const getUser = async (uid: string): Promise<UserProfile | null> => {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  };

