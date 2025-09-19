import { db } from "@/firebase";
import { collection, doc, setDoc, query, orderBy, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { CategoryDoc } from "@/types/Category";

const categoryCollection = collection(db, "categories");

// ========== ADD A NEW CATEGORY ==========
export const addCategory = async (category: CategoryDoc): Promise<void> => {
  const now = new Date();
  const newCategory: CategoryDoc = {
    ...category,
    createdAt: now,
    updatedAt: now,
  };

  const categoryRef = category.id ? doc(db, "categories", category.id) : doc(categoryCollection);
  await setDoc(categoryRef, newCategory);
};

// ========== GET ALL CATEGORIES ==========
export const getAllCategories = async (): Promise<CategoryDoc[]> => {
  const q = query(categoryCollection, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as CategoryDoc) }));
};

// ========== DELETE A CATEGORY ==========
export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "categories", id));
};

// ========== UPDATE A CATEGORY ==========
export const updateCategory = async (id: string, data: Partial<CategoryDoc>): Promise<void> => {
  await updateDoc(doc(db, "categories", id), {
    ...data,
    updatedAt: new Date(),
  });
};