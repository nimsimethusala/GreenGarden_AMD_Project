import { Role } from "./User";

export interface PlantDoc {
    id?: string;
    plantName: string;
    categoryIds: string[];
    images?: string[];
    createdBy: string; 
    createdByRole: Role;
    visibility?: "public" | "private" | "pending";
    approved?: boolean;
    favoritesCount?: number;
    isFavorite?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
