"use client";

import React from "react";
import BookMindMark from "../bookmind/BookMindMark";
import styles from "../../styles/studio.module.css";

export type MobileTab = "write" | "preview" | "chapters" | "bookmind";

interface MobileTabBarProps {
  active: MobileTab;
  hasBookMind: boolean;
  onWrite: () => void;
  onPreview: () => void;
  onChapters: () => void;
  onBookMind: () => void;
}

const ICONS: Partial<Record<MobileTab, React.ReactNode>> = {
  write: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  preview: (
    <>
      <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4H9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5h-6A1.5 1.5 0 0 1 2 16z" />
      <path d="M22 5.5A1.5 1.5 0 0 0 20.5 4H15a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5h6a1.5 1.5 0 0 0 1.5-1.5z" />
    </>
  ),
  chapters: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </>
  ),
};

const LABELS: Record<MobileTab, string> = {
  write: "Write",
  preview: "Preview",
  chapters: "Chapters",
  bookmind: "Book Mind",
};

export default function MobileTabBar({
  active,
  hasBookMind,
  onWrite,
  onPreview,
  onChapters,
  onBookMind,
}: MobileTabBarProps) {
  const tabs: Array<{ tab: MobileTab; onSelect: () => void }> = [
    { tab: "write", onSelect: onWrite },
    { tab: "preview", onSelect: onPreview },
    { tab: "chapters", onSelect: onChapters },
    ...(hasBookMind
      ? [{ tab: "bookmind" as MobileTab, onSelect: onBookMind }]
      : []),
  ];

  return (
    <nav
      aria-label="Editor sections"
      className={styles.tabBar}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className={styles.tabBarRow}
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        }}
      >
        {tabs.map(({ tab, onSelect }) => {
          const isActive = active === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={onSelect}
              aria-current={isActive ? "page" : undefined}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            >
              {tab === "bookmind" ? (
                <BookMindMark className="w-[18px] h-[18px]" />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {ICONS[tab]}
                </svg>
              )}
              <span>{LABELS[tab]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
