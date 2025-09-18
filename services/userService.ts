import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "@/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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

  // ========== UPDATE A USER PROFILE ==========
  export const updateUser = async (uid: string, data: Partial<UserProfile>, avatarBlob?: Blob | null): Promise<void> => {
    let updateData = { ...data };

    // If user uploaded a new avatar
    if (avatarBlob) {
      const storageRef = ref(storage, `avatars/${uid}.jpg`);
      await uploadBytes(storageRef, avatarBlob);
      const photoURL = await getDownloadURL(storageRef);
      updateData.photoURL = photoURL;
    }

    await updateDoc(doc(db, "users", uid), updateData);
  };

  // ========== REMOVE AVATAR ==========
  export const removeAvatar = async (uid: string): Promise<void> => {
    const storageRef = ref(storage, `avatars/${uid}.jpg`);
    await deleteObject(storageRef).catch(() => {});
    await updateDoc(doc(db, "users", uid), { photoURL: null });
  };

  // ========== DELETE A USER ==========
  export const deleteUser = async (uid: string): Promise<void> => {
    // Delete avatar if exists
    const storageRef = ref(storage, `avatars/${uid}.jpg`);
    await deleteObject(storageRef).catch(() => {});
    await deleteDoc(doc(db, "users", uid));
  };

  // ========== GET ALL USERS ==========
  export const getAllUsers = async (): Promise<UserProfile[]> => {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((doc) => doc.data() as UserProfile);
  };