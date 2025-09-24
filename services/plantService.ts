import {
  doc,
  collection,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { PlantDoc } from "@/types/Plant";
import { CategoryDoc } from "@/types/Category";

// Reference to user-specific plants
export const getUserPlantsRef = (userId: string) =>
  collection(db, "users", userId, "plants");

// Reference to admin plants
export const getAdminPlantsRef = () => collection(db, "plants");

// Reference to categories
export const getCategoriesRef = () => collection(db, "categories");

// Create a new plant
export const createPlant = async (plant: Partial<PlantDoc>) => {
  if (!plant.createdBy) throw new Error("userId is required");
  if (!plant.plantName) throw new Error("Plant name is required");
  if (!plant.images || plant.images.length === 0)
    throw new Error("Image is required");

  const isAdmin = plant.createdByRole === "admin";
  const ref = isAdmin ? getAdminPlantsRef() : getUserPlantsRef(plant.createdBy);

  const plantData = {
    ...plant,
    favoritesCount: isAdmin ? 0 : 0,
    visibility: isAdmin ? "public" : "private",
    approved: isAdmin ? true : false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(ref, plantData);
  return { id: docRef.id, ...plantData };
};

// Update existing plant
export const updatePlant = async (
  plant: PlantDoc,
  data: Partial<PlantDoc>
) => {
  if (!plant.id) throw new Error("Plant ID is required");
  if (data.plantName !== undefined && data.plantName.trim() === "")
    throw new Error("Plant name is required");
  if (data.images !== undefined && data.images.length === 0)
    throw new Error("Image is required");

  const plantDocRef =
    plant.createdByRole === "admin"
      ? doc(db, "plants", plant.id)
      : doc(db, "users", plant.createdBy, "plants", plant.id);

  await setDoc(
    plantDocRef,
    {
      ...data,
      updatedAt: new Date(),
    },
    { merge: true }
  );
};

// Delete a plant
export const deletePlant = async (plant: PlantDoc) => {
  if (!plant.id) throw new Error("Plant ID is required");

  const plantDocRef =
    plant.createdByRole === "admin"
      ? doc(db, "plants", plant.id)
      : doc(db, "users", plant.createdBy, "plants", plant.id);

  await deleteDoc(plantDocRef);
};

// Subscribe to user plants
export const subscribeUserPlants = (
  userId: string,
  callback: (plants: PlantDoc[]) => void,
  errorCallback?: (err: any) => void
) => {
  return onSnapshot(
    getUserPlantsRef(userId),
    (snap) => {
      const plants = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as PlantDoc)
      );
      callback(plants);
    },
    (err) => {
      if (errorCallback) errorCallback(err);
      console.error("Plants subscription error:", err);
    }
  );
};

// Subscribe to all admin plants
export const subscribeAllPlants = (
  callback: (plants: PlantDoc[]) => void,
  errorCallback?: (err: any) => void
) => {
  const ref = collection(db, "plants");
  return onSnapshot(
    ref,
    (snap) => {
      const plants = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as PlantDoc)
      );
      callback(plants);
    },
    (err) => {
      if (errorCallback) errorCallback(err);
      console.error("All plants subscription error:", err);
    }
  );
};

// Subscribe to categories
export const subscribeCategories = (
  callback: (categories: CategoryDoc[]) => void,
  errorCallback?: (err: any) => void
) => {
  return onSnapshot(
    getCategoriesRef(),
    (snap) => {
      const categories = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as CategoryDoc)
      );
      callback(categories);
    },
    (err) => {
      if (errorCallback) errorCallback(err);
      console.error("Categories subscription error:", err);
    }
  );
};

// Toggle favorite for a user
export const toggleFavorite = async (
  userId: string,
  plant: PlantDoc,
  isFavorite: boolean
) => {
  let plantDocRef;

  if (plant.createdByRole === "admin") {
    plantDocRef = doc(db, "plants", plant.id!);
  } else {
    plantDocRef = doc(db, "users", userId, "plants", plant.id!);
  }

  await setDoc(
    plantDocRef,
    { isFavorite, favoritesCount: isFavorite ? 1 : 0 },
    { merge: true }
  );
};