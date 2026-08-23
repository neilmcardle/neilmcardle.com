"use client";

import React from "react";

export type MobileTab = "write" | "chapters" | "bookmind" | "export";

interface MobileTabBarProps {
  active: MobileTab;
  hasBookMind: boolean;
  onWrite: () => void;
  onChapters: () => void;
  onBookMind: () => void;
  onExport: () => void;
}

const ICONS: Record<MobileTab, React.ReactNode> = {
  write: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  chapters: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8" />
    </>
  ),
  bookmind: (
    <>
      <path d="M12 3a6 6 0 0 1 6 6c0 2.4-1.4 3.6-2 4.8V16H8v-2.2c-.6-1.2-2-2.4-2-4.8a6 6 0 0 1 6-6z" />
      <path d="M9 20h6" />
    </>
  ),
  export: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
};

const LABELS: Record<MobileTab, string> = {
  write: "Write",
  chapters: "Chapters",
  bookmind: "Book Mind",
  export: "Export",
};

function Tab({
  tab,
  active,
  onSelect,
}: {
  tab: MobileTab;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center justify-center gap-1 h-14 rounded-[10px] transition-colors ${
        active
          ? "bg-gray-100 dark:bg-[#262626]"
          : "active:bg-gray-100 dark:active:bg-[#262626]"
      }`}
    >
      <svg
        className={`w-5 h-5 ${active ? "text-gray-900 dark:text-[#f5f5f5]" : "text-gray-400 dark:text-[#737373]"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICONS[tab]}
      </svg>
      <span
        className={`text-[10px] leading-none ${
          active
            ? "font-semibold text-gray-900 dark:text-[#f5f5f5]"
            : "text-gray-400 dark:text-[#737373]"
        }`}
      >
        {LABELS[tab]}
      </span>
    </button>
  );
}

export default function MobileTabBar({
  active,
  hasBookMind,
  onWrite,
  onChapters,
  onBookMind,
  onExport,
}: MobileTabBarProps) {
  const tabs: Array<{ tab: MobileTab; onSelect: () => void }> = [
    { tab: "write", onSelect: onWrite },
    { tab: "chapters", onSelect: onChapters },
    ...(hasBookMind
      ? [{ tab: "bookmind" as MobileTab, onSelect: onBookMind }]
      : []),
    { tab: "export", onSelect: onExport },
  ];

  return (
    <nav
      aria-label="Editor sections"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-gray-50 dark:bg-[#151515] border-t border-gray-200 dark:border-[#2a2a2a]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="grid gap-1 px-2 py-1.5"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        }}
      >
        {tabs.map(({ tab, onSelect }) => (
          <Tab
            key={tab}
            tab={tab}
            active={active === tab}
            onSelect={onSelect}
          />
        ))}
      </div>
    </nav>
  );
}
