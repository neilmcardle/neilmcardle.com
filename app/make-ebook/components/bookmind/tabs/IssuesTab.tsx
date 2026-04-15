"use client";

// IssuesTab — Phase A stub.
//
// In Phase C this becomes a running list of plot holes, character
// drift, timeline anomalies, and repeated openings. Each issue will
// be a tappable card that scrolls the editor to the offending passage.
// For Phase A it ships empty with the final shape so the Inspector
// has all four tabs on day one.

import { BookMindIcon as BookIcon } from "../../BookMindShared";

export default function IssuesTab() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-sm font-medium">Issues</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-[260px]">
          <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto" />
          <div>
            <h3 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-white">Issues coming soon</h3>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">
              Plot holes, character drift, and timeline anomalies, each tappable to jump straight to the source.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
