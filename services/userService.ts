import { db, storage } from "@/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { UserProfile } from "@/types/User";

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

  // ========== ADD A NEW USER (ADMIN) ==========
  export const addUser = async (profile: UserProfile, avatarBlob?: Blob | null): Promise<void> => {
    let photoURL: string | null = null;

    if (avatarBlob) {
      const storageRef = ref(storage, `avatars/${profile.id}.jpg`);
      await uploadBytes(storageRef, avatarBlob);
      photoURL = await getDownloadURL(storageRef);
    }

    const finalProfile: UserProfile = {
      ...profile,
      photoURL: photoURL ?? profile.photoURL ?? null,
    };

    if (profile.id) {
      await setDoc(doc(db, "users", profile.id), finalProfile);
    } else {
      console.error("Profile ID is missing or invalid.");
    }
  };