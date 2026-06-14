'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';
import { Sun, Moon, BookOpen } from 'lucide-react';

const LABELS = { makeebook: 'makeEbook', dark: 'Dark', light: 'Light' } as const;

export function ThemeToggle() {
  const { theme, canToggle, toggleTheme } = useTheme();

  if (!canToggle) return null;

  const Icon = theme === 'makeebook' ? BookOpen : theme === 'dark' ? Moon : Sun;

  return (
    <button
      onClick={toggleTheme}
      style={{ outline: 'none', boxShadow: 'none' }}
      aria-label={`Theme: ${LABELS[theme]}. Click to change.`}
      title={`Theme: ${LABELS[theme]}`}
      className="inline-flex rounded-full w-16 h-16 items-center justify-center transition-colors group outline-none border-0"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
