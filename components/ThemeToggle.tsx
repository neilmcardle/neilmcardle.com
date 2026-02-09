'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getNextTheme = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'system';
    return 'light';
  };

  const nextTheme = getNextTheme();

  const renderIcon = () => {
    if (theme === 'light') {
      // Show moon — next is dark
      return (
        <img
          alt="Switch to dark mode"
          loading="lazy"
          decoding="async"
          style={{ color: 'transparent' }}
          src="/moon-icon.svg"
          width={20}
          height={24}
        />
      );
    }
    if (theme === 'dark') {
      // Show monitor icon — next is system
      return (
        <svg
          width="20"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    }
    // System mode — show sun, next is light
    return (
      <img
        alt="Switch to light mode"
        loading="lazy"
        decoding="async"
        style={{ color: 'transparent' }}
        src="/sun-icon.svg"
        width={20}
        height={24}
      />
    );
  };

  return (
    <button
      onClick={toggleTheme}
      style={{ outline: 'none', boxShadow: 'none' }}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="inline-flex rounded-full w-16 h-16 items-center justify-center transition-colors group outline-none border-0"
    >
      {renderIcon()}
    </button>
  );
}
