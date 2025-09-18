import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserProfile, Role } from "@/types/User";

{/* Signup */}
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