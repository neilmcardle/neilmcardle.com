'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';
import Image from 'next/image';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{ outline: 'none', boxShadow: 'none' }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="inline-flex rounded-full w-16 h-16 items-center justify-center transition-colors group outline-none border-0"
    >
      {theme === 'light' ? (
        <>
          <img
            alt="Dark mode"
            loading="lazy"
            decoding="async"
            data-nimg="1"
            className="dark:hidden"
            style={{ color: 'transparent' }}
            src="/moon-icon.svg"
            width={20}
            height={24}
          />
          <img
            alt="Dark mode"
            loading="lazy"
            width={24}
            height={24}
            decoding="async"
            data-nimg="1"
            className="hidden dark:block"
            style={{ color: 'transparent' }}
            src="/dark-moon-icon.svg"
          />
        </>
      ) : (
        <>
          <img
            alt="Light mode"
            loading="lazy"
            decoding="async"
            data-nimg="1"
            className="dark:hidden"
            style={{ color: 'transparent' }}
            src="/sun-icon.svg"
            width={20}
            height={24}
          />
          <img
            alt="Light mode"
            loading="lazy"
            width={24}
            height={24}
            decoding="async"
            data-nimg="1"
            className="hidden dark:block"
            style={{ color: 'transparent' }}
            src="/dark-sun-icon.svg"
          />
        </>
      )}
    </button>
  );
}
