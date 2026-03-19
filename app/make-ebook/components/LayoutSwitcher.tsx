"use client";

import React from 'react';

export type RightPanelMode = 'none' | 'book-mind' | 'live-preview';

interface LayoutSwitcherProps {
  mode: RightPanelMode;
  onChange: (mode: RightPanelMode) => void;
}

// Same open-book icon used in SlimSidebarNav + BookMindPanel
function BookMindIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

// Eye icon — consistent with Overview nav
function LivePreviewIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const TABS: { mode: Exclude<RightPanelMode, 'none'>; label: string; Icon: React.ComponentType }[] = [
  { mode: 'book-mind',    label: 'Book Mind',    Icon: BookMindIcon },
  { mode: 'live-preview', label: 'Live Preview', Icon: LivePreviewIcon },
];

export default function LayoutSwitcher({ mode, onChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center rounded-lg border border-gray-200 dark:border-[#2f2f2f] overflow-hidden bg-gray-50 dark:bg-[#1a1a1a]">
      {TABS.map(({ mode: m, label, Icon }, i) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            title={label}
            className={`flex items-center gap-1.5 px-3 h-10 text-xs font-medium transition-colors whitespace-nowrap
              ${i > 0 ? 'border-l border-gray-200 dark:border-[#2f2f2f]' : ''}
              ${active
                ? 'bg-white dark:bg-[#2f2f2f] text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
              }`}
          >
            <Icon />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
