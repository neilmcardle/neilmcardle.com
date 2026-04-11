'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, canToggle, toggleTheme } = useTheme();

  // Anonymous visitors are locked to light mode. Hide the toggle entirely
  // rather than disabling it so we don't advertise a feature that's gated
  // behind sign-in.
  if (!canToggle) return null;

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
