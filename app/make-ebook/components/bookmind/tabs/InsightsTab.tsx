"use client";

// InsightsTab — Phase A stub.
//
// In Phase C this becomes a live analytical cache surface: themes,
// character map, pacing arc, word frequency, each generated in the
// background on book open and rendered as cards. For Phase A it ships
// as a placeholder with the final shape so the Inspector has all four
// tabs on day one.

import { BookMindIcon as BookIcon } from "../../BookMindShared";

export default function InsightsTab() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19V6l12-3v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="text-sm font-medium">Insights</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-[260px]">
          <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto" />
          <div>
            <h3 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-white">Insights coming soon</h3>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">
              Themes, character map, pacing, and word frequency will live here, pre-computed and instant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
