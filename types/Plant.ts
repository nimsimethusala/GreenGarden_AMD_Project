import { Role } from "./User";

export interface PlantDoc {
id?: string;
plantName: string;
description?: string;
categoryId: string;
price: number;
images?: string[];
createdBy: string; 
createdByRole: Role;
visibility?: "public" | "private" | "pending";
approved?: boolean;
stock?: number;
favoritesCount?: number;
createdAt?: Date;
updatedAt?: Date;
}