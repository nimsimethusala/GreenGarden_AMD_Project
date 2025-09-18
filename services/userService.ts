import { db, storage } from "@/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { UserProfile } from "@/types/User";

// Helper: convert Expo image URI to Blob using fetch (works on iOS + Android)
const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  return await response.blob();
};

// ========== GET A USER PROFILE ==========
export const getUser = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

// ========== UPDATE A USER PROFILE ==========
export const updateUser = async (
  uid: string,
  data: Partial<UserProfile>,
  avatarUri?: string | null
): Promise<void> => {
  let updateData = { ...data };

  if (avatarUri) {
    try {
      const storageRef = ref(storage, `avatars/${uid}.jpg`);
      const blob = await uriToBlob(avatarUri); // ✅ using fetch(uri).blob()
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);
      updateData.photoURL = photoURL;
    } catch (err) {
      console.warn("Failed to upload avatar:", err);
    }
  }

  await updateDoc(doc(db, "users", uid), updateData);
};

// ========== REMOVE AVATAR ==========
export const removeAvatar = async (uid: string): Promise<void> => {
  const storageRef = ref(storage, `avatars/${uid}.jpg`);
  try {
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("Failed to delete avatar:", err);
  }
  await updateDoc(doc(db, "users", uid), { photoURL: null });
};

// ========== DELETE A USER ==========
export const deleteUser = async (uid: string): Promise<void> => {
  const storageRef = ref(storage, `avatars/${uid}.jpg`);
  try {
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("Failed to delete avatar:", err);
  }
  await deleteDoc(doc(db, "users", uid));
};

// ========== GET ALL USERS ==========
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((doc) => doc.data() as UserProfile);
};

// ========== ADD A NEW USER (ADMIN) ==========
export const addUser = async (profile: UserProfile, avatarUri?: string | null): Promise<void> => {
  let photoURL: string | null = null;

  if (avatarUri) {
    try {
      const storageRef = ref(storage, `avatars/${profile.id}.jpg`);
      const blob = await uriToBlob(avatarUri); // ✅ using fetch(uri).blob()
      await uploadBytes(storageRef, blob);
      photoURL = await getDownloadURL(storageRef);
    } catch (err) {
      console.warn("Failed to upload avatar:", err);
    }
  }

  const finalProfile: UserProfile = {
    ...profile,
    photoURL: photoURL ?? profile.photoURL ?? null,
  };

  const userRef = profile.id ? doc(db, "users", profile.id) : doc(collection(db, "users"));
  await setDoc(userRef, finalProfile);
};
