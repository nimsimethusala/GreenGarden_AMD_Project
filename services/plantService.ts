import {
  doc,
  collection,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { PlantDoc } from "@/types/Plant";

// Reference to user-specific plants
export const getUserPlantsRef = (userId: string) =>
  collection(db, "users", userId, "plants");

// Create a new plant
export const createPlant = async (plant: Partial<PlantDoc>) => {
  if (!plant.createdBy) throw new Error("userId is required");
  if (!plant.plantName) throw new Error("Plant name is required");
  if (!plant.images || plant.images.length === 0)
    throw new Error("Image is required");

  const ref = getUserPlantsRef(plant.createdBy);
  const isAdmin = plant.createdByRole === "admin";

  await addDoc(ref, {
    ...plant,
    description: isAdmin ? plant.description || "" : null,
    favoritesCount: isAdmin ? 0 : null,
    visibility: isAdmin ? "public" : "private",
    createdAt: new Date(),
  });
};

// Update an existing plant safely (creates if missing)
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

// Delete an existing plant
export const deletePlant = async (plant: PlantDoc) => {
  if (!plant.id) throw new Error("Plant ID is required");

  const plantDocRef =
    plant.createdByRole === "admin"
      ? doc(db, "plants", plant.id)
      : doc(db, "users", plant.createdBy, "plants", plant.id);

  await deleteDoc(plantDocRef);
};

// Toggle favorite (admin plants)
export const toggleFavorite = async (
  userId: string,
  plantId: string,
  isFavorite: boolean
) => {
  const plantDocRef = doc(db, "users", userId, "plants", plantId);
  await updateDoc(plantDocRef, {
    isFavorite,
    favoritesCount: isFavorite ? 1 : 0,
  });
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

// Subscribe to all plants (admin)
export const subscribeAllPlants = (
  callback: (plants: PlantDoc[]) => void,
  errorCallback?: (err: any) => void
) => {
  const ref = collection(db, "plants"); // global admin plants

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
