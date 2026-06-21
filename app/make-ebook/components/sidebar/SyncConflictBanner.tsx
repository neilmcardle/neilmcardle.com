'use client';

import React from 'react';
import { BookRecord } from '../../types';
import { formatRelativeTime } from '../../utils/pageUtils';

interface SyncConflictBannerProps {
  conflicts: { local: BookRecord; cloud: BookRecord }[];
  onResolve: (choice: 'local' | 'cloud' | 'both') => void;
}

export default function SyncConflictBanner({ conflicts, onResolve }: SyncConflictBannerProps) {
  if (conflicts.length === 0 || !conflicts[0]) return null;
  const current = conflicts[0];

  return (
    <div className="mb-3 rounded-lg border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#252525] p-3">
      <div className="flex items-start gap-2 mb-2">
        <svg className="w-4 h-4 mt-0.5 text-gray-500 dark:text-[#a3a3a3] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v3.75m0 3h.008v.008H12v-.008zM10.363 3.591l-8.106 13.51A1.914 1.914 0 003.89 20h16.22a1.914 1.914 0 001.632-2.899L13.636 3.59a1.914 1.914 0 00-3.273 0z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Choose a version
          </p>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mt-0.5">
            &ldquo;{current.local.title || 'Untitled'}&rdquo; was edited on another device.
            {conflicts.length > 1 && ` (${conflicts.length} books)`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2 text-2xs">
        <div className="p-2 rounded-md bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333]">
          <p className="font-semibold text-gray-700 dark:text-[#d4d4d4] mb-0.5">This device</p>
          <p className="text-gray-500 dark:text-[#737373]">{current.local.chapters.length} chapters</p>
          <p className="text-gray-500 dark:text-[#737373]">{formatRelativeTime(current.local.savedAt)}</p>
        </div>
        <div className="p-2 rounded-md bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333]">
          <p className="font-semibold text-gray-700 dark:text-[#d4d4d4] mb-0.5">Cloud</p>
          <p className="text-gray-500 dark:text-[#737373]">{current.cloud.chapters.length} chapters</p>
          <p className="text-gray-500 dark:text-[#737373]">{formatRelativeTime(current.cloud.savedAt)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => onResolve('cloud')}
          className="w-full px-3 py-1.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium hover:opacity-90 transition-opacity"
        >
          Keep cloud version
        </button>
        <button
          onClick={() => onResolve('local')}
          className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#1e1e1e] text-xs font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
        >
          Keep this device&apos;s version
        </button>
        <button
          onClick={() => onResolve('both')}
          className="w-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Keep both (creates a copy)
        </button>
      </div>
    </div>
  );
}
