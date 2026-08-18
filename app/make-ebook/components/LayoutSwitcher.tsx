"use client";

import React from 'react';

export type RightPanelMode = 'none' | 'live-preview' | 'inspector';

interface LayoutSwitcherProps {
  mode: RightPanelMode;
  onChange: (mode: RightPanelMode) => void;
}

export default function LayoutSwitcher({ mode, onChange }: LayoutSwitcherProps) {
  return (
    <button
      onClick={() => onChange(mode === 'live-preview' ? 'none' : 'live-preview')}
      title={mode === 'live-preview' ? 'Close preview' : 'Open preview'}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
        bg-gray-100 dark:bg-[#1c1c1c] text-gray-600 dark:text-[#d4d4d4] border border-gray-200 dark:border-[#333]
        hover:bg-gray-200 dark:hover:bg-[#2e2e2e]
        data-[active=true]:bg-white dark:data-[active=true]:bg-[#2e2e2e] data-[active=true]:text-gray-900 dark:data-[active=true]:text-white data-[active=true]:shadow-sm"
      data-active={mode === 'live-preview'}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      Preview
    </button>
  );
}
