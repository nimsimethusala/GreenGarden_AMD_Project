import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import * as authService from "@/services/authService";
import { UserProfile } from "@/types/User";
import * as userService from "@/services/userService";

type AuthContextType = {
  user: UserProfile | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (options: { email: string; password: string; username: string; role?: string; avatarBlob?: Blob | null }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setInitializing(false);
        return;
      }

      const profile = await userService.getUser(firebaseUser.uid);
      if (profile?.isDisabled) {
        await authService.logout();
      }
      setUser(profile);
      setInitializing(false);
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const signup = async (options: { email: string; password: string; username: string; role?: string; avatarBlob?: Blob | null }) => {
    await authService.signup({...options, role: options.role as any});
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
