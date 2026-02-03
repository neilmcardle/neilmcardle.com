'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // Determine next theme and label
  const getNextTheme = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'paper';
    return 'light';
  };

  const nextTheme = getNextTheme();

  // Icon for each current theme state (shows what clicking will switch TO)
  const renderIcon = () => {
    if (theme === 'light') {
      // Show moon - next is dark
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
      // Show paper icon - next is paper
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    }
    // Paper mode - show sun, next is light
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
