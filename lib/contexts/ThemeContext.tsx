'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeClass(resolved: 'light' | 'dark') {
  const html = document.documentElement;
  html.classList.remove('dark');
  if (resolved === 'dark') {
    html.classList.add('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Apply theme to DOM
  const applyTheme = (newTheme: Theme) => {
    applyThemeClass(newTheme);
  };

  // Load theme preference from localStorage on mount
  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('theme');

    // Migrate legacy themes to light/dark only
    let resolved: Theme = 'light';
    if (savedTheme === 'dark') {
      resolved = 'dark';
    }

    // Migrate legacy values
    if (savedTheme && savedTheme !== 'light' && savedTheme !== 'dark') {
      localStorage.setItem('theme', resolved);
    }

    setThemeState(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      const newTheme: Theme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setThemeState(newTheme);
  };

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return { theme: 'light' as Theme, toggleTheme: () => {}, setTheme: () => {} };
  }
  return context;
}
