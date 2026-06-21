"use client";

import React from 'react';

export type RightPanelMode = 'none' | 'inspector' | 'live-preview';

interface LayoutSwitcherProps {
  mode: RightPanelMode;
  onChange: (mode: RightPanelMode) => void;
}

const TABS: { mode: Exclude<RightPanelMode, 'none'>; label: string }[] = [
  { mode: 'inspector',    label: 'Book Mind' },
  { mode: 'live-preview', label: 'Live Preview' },
];

export default function LayoutSwitcher({ mode, onChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#333]">
      {TABS.map(({ mode: m, label }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(mode === m ? 'none' : m)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap
              ${active
                ? 'bg-white dark:bg-[#2e2e2e] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'
              }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
