export type Role = "user" | "admin";

export interface UserProfile {
  id?: string;  
  username: string;
  email: string;
  phone?: string;
  photoURL?: string | null;
  role: Role;
  isDisabled?: boolean;
}
