'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';
import Image from 'next/image';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex rounded-full w-8 h-8 items-center justify-center transition-colors group outline-none border-0"
      style={{ outline: 'none', boxShadow: 'none' }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Image src="/moon-icon.svg" alt="Dark mode" width={20} height={20} className="dark:hidden" />
          <Image src="/dark-moon-icon.svg" alt="Dark mode" width={20} height={20} className="hidden dark:block" />
        </>
      ) : (
        <>
          <Image src="/sun-icon.svg" alt="Light mode" width={20} height={20} className="dark:hidden" />
          <Image src="/dark-sun-icon.svg" alt="Light mode" width={20} height={20} className="hidden dark:block" />
        </>
      )}
    </button>
  );
}
