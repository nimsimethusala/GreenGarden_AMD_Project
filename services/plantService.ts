import {
  collection,
  addDoc
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
    favoritesCount: isAdmin ? 0 : null, // only admin plants track favorites
    visibility: isAdmin ? "public" : "private",
    createdAt: new Date(),
  });
};
