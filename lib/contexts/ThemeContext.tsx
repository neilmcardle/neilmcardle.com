'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  // True when the user is allowed to change theme. Anonymous visitors are
  // locked to light mode; only signed-in users can switch and persist dark.
  canToggle: boolean;
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
  const { user, loading: authLoading } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply the correct theme whenever auth resolves or changes.
  //
  // Rules:
  // - While auth is still loading, stay in light mode (safe default).
  // - Anonymous visitors are always light. Any stale 'dark' value left in
  //   localStorage from a prior session is cleared on sign-out, so it won't
  //   leak back in here.
  // - Signed-in users load their persisted preference, defaulting to light.
  useEffect(() => {
    if (!mounted) return;

    if (authLoading) {
      setThemeState('light');
      applyThemeClass('light');
      return;
    }

    if (!user) {
      setThemeState('light');
      applyThemeClass('light');
      // Drop any stale preference so the next anonymous visitor is clean.
      try { localStorage.removeItem('theme'); } catch {}
      return;
    }

    const savedTheme = localStorage.getItem('theme');
    const resolved: Theme = savedTheme === 'dark' ? 'dark' : 'light';
    setThemeState(resolved);
    applyThemeClass(resolved);
  }, [mounted, authLoading, user]);

  const toggleTheme = () => {
    // Anonymous visitors cannot toggle. No-op keeps callers simple.
    if (!user) return;
    setThemeState(prevTheme => {
      const newTheme: Theme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      applyThemeClass(newTheme);
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    if (!user) return;
    localStorage.setItem('theme', newTheme);
    applyThemeClass(newTheme);
    setThemeState(newTheme);
  };

  const canToggle = !!user && !authLoading;

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, canToggle, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      theme: 'light' as Theme,
      canToggle: false,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
