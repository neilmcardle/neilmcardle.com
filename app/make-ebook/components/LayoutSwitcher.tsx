"use client";

import React from 'react';

export type RightPanelMode = 'none' | 'book-mind' | 'live-preview' | 'both';

interface LayoutSwitcherProps {
  mode: RightPanelMode;
  onChange: (mode: RightPanelMode) => void;
}

const LAYOUTS: { mode: Exclude<RightPanelMode, 'none'>; title: string; icon: React.ReactNode }[] = [
  {
    mode: 'book-mind',
    title: 'Book Mind',
    icon: (
      <svg viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-4">
        <rect x="1" y="1" width="18" height="12" rx="1.5" />
        <path d="M5 1v12" />
        <path d="M13 1v12" />
        <circle cx="15.5" cy="5" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="7" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="9" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    mode: 'live-preview',
    title: 'Live Preview',
    icon: (
      <svg viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-4">
        <rect x="1" y="1" width="18" height="12" rx="1.5" />
        <path d="M5 1v12" />
        <path d="M13 1v12" />
        <rect x="14" y="3" width="4" height="5.5" rx="0.5" strokeWidth="1" />
        <path d="M14.5 10.5h3" strokeWidth="1" />
      </svg>
    ),
  },
  {
    mode: 'both',
    title: 'Book Mind + Live Preview',
    icon: (
      <svg viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-4">
        <rect x="1" y="1" width="18" height="12" rx="1.5" />
        <path d="M5 1v12" />
        <path d="M13 1v12" />
        <path d="M13 7h6" />
        <circle cx="16" cy="4.5" r="0.7" fill="currentColor" stroke="none" />
        <rect x="14.5" y="8.5" width="3" height="3" rx="0.4" strokeWidth="1" />
      </svg>
    ),
  },
];

export default function LayoutSwitcher({ mode, onChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-[#1a1a1a]">
      {LAYOUTS.map(({ mode: m, title, icon }) => (
        <button
          key={m}
          onClick={() => onChange(mode === m ? 'none' : m)}
          title={title}
          className={`p-1 rounded-md transition-colors ${
            mode === m
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
