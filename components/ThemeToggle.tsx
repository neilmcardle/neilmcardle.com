'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      onClick={toggleTheme}
      style={{ outline: 'none', boxShadow: 'none' }}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="inline-flex rounded-full w-16 h-16 items-center justify-center transition-colors group outline-none border-0"
    >
      {theme === 'light' ? (
        <img
          alt="Switch to dark mode"
          loading="lazy"
          decoding="async"
          style={{ color: 'transparent' }}
          src="/moon-icon.svg"
          width={20}
          height={24}
        />
      ) : (
        <img
          alt="Switch to light mode"
          loading="lazy"
          decoding="async"
          className="invert"
          style={{ color: 'transparent' }}
          src="/sun-icon.svg"
          width={20}
          height={24}
        />
      )}
    </button>
  );
}
