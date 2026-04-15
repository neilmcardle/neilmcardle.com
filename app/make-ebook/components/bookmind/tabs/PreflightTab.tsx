"use client";

// PreflightTab — Phase A stub.
//
// In Phase C this becomes the Amazon KDP pre-flight wizard: hard
// deterministic checks (word count, metadata, cover) plus AI checks
// (chapter length variance, AI tells, repetitive openings, dialogue
// tag overload) plus the disclosure helper. For Phase A it ships as
// a placeholder with the final shape so the Inspector has all four
// tabs on day one.

import { BookMindIcon as BookIcon } from "../../BookMindShared";

export default function PreflightTab() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="text-sm font-medium">Pre-flight</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-[280px]">
          <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto" />
          <div>
            <h3 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-white">Pre-flight coming soon</h3>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">
              Hard checks, AI-quality checks, and the Amazon KDP disclosure helper, all before your book leaves the editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
