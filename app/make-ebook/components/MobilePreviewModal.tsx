"use client";
import React from "react";
import { Chapter } from "../types";

type MobilePreviewTheme = "light" | "sepia" | "dark";
type MobilePreviewDevice = "kindle" | "ipad" | "phone";

export const mobileDeviceDimensions = {
  kindle: { width: 260, height: 380, name: "Kindle" },
  ipad: { width: 300, height: 400, name: "iPad" },
  phone: { width: 220, height: 380, name: "Phone" },
};

export function MobilePreviewModal({
  chapters,
  selectedChapter,
  onChapterSelect,
  onClose,
}: {
  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect: (i: number) => void;
  onClose: () => void;
}) {
  const [device, setDevice] = React.useState<MobilePreviewDevice>("kindle");
  const [theme, setTheme] = React.useState<MobilePreviewTheme>("light");
  const dim = mobileDeviceDimensions[device];
  const chapter = chapters[selectedChapter];

  const textColor = theme === "dark" ? "#e5e5e5" : "#141413";
  const screenBg =
    theme === "light" ? "#faf9f5" : theme === "sepia" ? "#f4ecd8" : "#1a1a1a";

  return (
    <div className="fixed inset-0 z-[130] flex flex-col lg:hidden overflow-hidden bg-white dark:bg-[var(--ink-window)]">
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-[var(--rule)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[var(--ink-deep)] dark:text-white">
            Live Preview
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] rounded transition-colors -mr-2"
            aria-label="Close preview"
          >
            <svg
              className="w-4 h-4 text-gray-400 dark:text-[var(--clay-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex gap-1">
          {(
            Object.entries(mobileDeviceDimensions) as [
              MobilePreviewDevice,
              typeof mobileDeviceDimensions.kindle,
            ][]
          ).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                device === key
                  ? "bg-[var(--ink-deep)] text-white dark:bg-white dark:text-black"
                  : "bg-gray-100 dark:bg-[var(--rule)] text-gray-600 dark:text-[var(--clay)] hover:bg-gray-200 dark:hover:bg-[var(--rule)]"
              }`}
            >
              {val.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          className="relative bg-[var(--rule)] p-2 shadow-2xl"
          style={{ width: dim.width + 16, borderRadius: 24 }}
        >
          <div
            className="w-full overflow-hidden transition-colors"
            style={{
              width: dim.width,
              height: dim.height,
              maxWidth: "100%",
              backgroundColor: screenBg,
              borderRadius: 16,
            }}
          >
            <div className="h-full overflow-y-auto">
              {chapter ? (
                <article
                  className="p-5"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    color: textColor,
                    lineHeight: 1.8,
                    fontSize: "13px",
                  }}
                >
                  {chapter.title && (
                    <h1
                      className="text-base font-bold mb-3 text-center"
                      style={{ color: textColor }}
                    >
                      {chapter.title}
                    </h1>
                  )}
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        chapter.content ||
                        '<p style="color: #999; font-style: italic;">No content yet...</p>',
                    }}
                    style={{ textAlign: "justify" }}
                    className="[&_p]:mb-3 [&_p]:text-indent-4"
                  />
                </article>
              ) : (
                <div className="h-full flex items-center justify-center p-6">
                  <p className="text-gray-400 text-sm">No chapter selected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {chapters.length > 1 && (
        <div className="flex-shrink-0 px-3 pb-2 border-t border-gray-200 dark:border-[var(--rule)]">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => onChapterSelect(i)}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  i === selectedChapter
                    ? "bg-[var(--ink-deep)] text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 dark:bg-[var(--ink-raised)] text-gray-600 dark:text-[var(--clay)] hover:bg-gray-200 dark:hover:bg-[var(--rule)]"
                }`}
              >
                {ch.title || `Ch ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-[var(--rule)]">
        <div className="flex items-center justify-center gap-3">
          {(["light", "sepia", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                theme === t
                  ? "scale-110 border-[var(--ink-deep)] dark:border-white shadow-md"
                  : "border-gray-300 dark:border-[var(--ink-hover)] hover:border-gray-500"
              }`}
              style={{
                backgroundColor:
                  t === "light"
                    ? "#faf9f5"
                    : t === "sepia"
                      ? "#f4ecd8"
                      : "#1a1a1a",
              }}
              aria-label={`${t} theme`}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
