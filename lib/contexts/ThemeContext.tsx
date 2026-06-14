'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

type Theme = 'light' | 'dark' | 'makeebook';

interface ThemeContextType {
  theme: Theme;
  canToggle: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeClass(resolved: Theme) {
  const html = document.documentElement;
  html.classList.remove('dark', 'makeebook');
  if (resolved === 'dark') {
    html.classList.add('dark');
  } else if (resolved === 'makeebook') {
    // makeEbook composes the dark theme (so all chrome inherits dark styling and
    // no light base ever leaks) plus `makeebook`, whose `me:` overrides turn only
    // the writing surface to paper (me: beats dark: on selector specificity).
    html.classList.add('dark', 'makeebook');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      try { localStorage.removeItem('theme'); } catch {}
      return;
    }

    // Signed-in users default to makeEbook (the editor's signature theme)
    // unless they've explicitly chosen light or dark.
    const savedTheme = localStorage.getItem('theme');
    const resolved: Theme =
      savedTheme === 'dark' ? 'dark' : savedTheme === 'light' ? 'light' : 'makeebook';
    setThemeState(resolved);
    applyThemeClass(resolved);
  }, [mounted, authLoading, user]);

  const toggleTheme = () => {
    if (!user) return;
    setThemeState(prevTheme => {
      // Cycle makeEbook → dark → light → makeEbook.
      const newTheme: Theme =
        prevTheme === 'makeebook' ? 'dark' : prevTheme === 'dark' ? 'light' : 'makeebook';
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
