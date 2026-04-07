"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type MajorTheme = "masters" | "open" | "usopen" | "pga";

interface ThemeContextType {
  theme: MajorTheme;
  setTheme: (theme: MajorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<MajorTheme>("masters");

  useEffect(() => {
    // Apply theme to html wrapper
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
