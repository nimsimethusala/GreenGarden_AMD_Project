export type Role = "user" | "admin";

export interface User {
  id?: string;  
  username: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: Role;
  isDisabled?: boolean;
}
