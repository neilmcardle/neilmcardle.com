'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'paper';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    setMounted(true);

    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    // Use saved preference if available, otherwise default to paper
    if (savedTheme && ['light', 'dark', 'paper'].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to paper mode
      setThemeState('paper');
      applyTheme('paper');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    // Remove all theme classes first
    html.classList.remove('dark', 'paper');
    // Add the appropriate class
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else if (newTheme === 'paper') {
      html.classList.add('paper');
    }
    // 'light' has no class (default)
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      // Cycle: light → dark → paper → light
      const themeOrder: Theme[] = ['light', 'dark', 'paper'];
      const currentIndex = themeOrder.indexOf(prevTheme);
      const newTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
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
    // Return default values instead of throwing during SSR/build
    return { theme: 'light' as Theme, toggleTheme: () => {}, setTheme: () => {} };
  }
  return context;
}
