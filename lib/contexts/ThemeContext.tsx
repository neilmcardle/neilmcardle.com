"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  canToggle: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const NOOP = () => {};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add("dark");
    try {
      localStorage.removeItem("theme");
    } catch {}
    return () => document.documentElement.classList.remove("dark");
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: "dark",
        canToggle: false,
        toggleTheme: NOOP,
        setTheme: NOOP,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      theme: "light" as Theme,
      canToggle: false,
      toggleTheme: NOOP,
      setTheme: NOOP,
    };
  }
  return context;
}
