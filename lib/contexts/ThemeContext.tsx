'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

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
    if (newTheme === 'system') {
      applyThemeClass(getSystemPreference());
    } else {
      applyThemeClass(newTheme);
    }
  };

  // Load theme preference from localStorage on mount
  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('theme');

    // Migrate legacy 'paper' theme to 'light'
    let resolved: Theme = 'light';
    if (savedTheme === 'paper' || savedTheme === 'light') {
      resolved = 'light';
    } else if (savedTheme === 'dark') {
      resolved = 'dark';
    } else if (savedTheme === 'system') {
      resolved = 'system';
    }

    // Update storage if migrated
    if (savedTheme === 'paper') {
      localStorage.setItem('theme', 'light');
    }

    setThemeState(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      applyThemeClass(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      const themeOrder: Theme[] = ['light', 'dark', 'system'];
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
    return { theme: 'light' as Theme, toggleTheme: () => {}, setTheme: () => {} };
  }
  return context;
}
