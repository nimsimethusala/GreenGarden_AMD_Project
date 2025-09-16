import React, { createContext, useContext, useState } from "react";
import { theme } from "@/constants/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextProps {
  currentTheme: ThemeMode;
  colors: typeof theme.light;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("light");

  const toggleTheme = () => {
    setCurrentTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const colors = theme[currentTheme];

  return (
    <ThemeContext.Provider value={{ currentTheme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
