"use client";

import React from "react";

export type RightPanelMode = "none" | "live-preview" | "inspector";

interface LayoutSwitcherProps {
  mode: RightPanelMode;
  onChange: (mode: RightPanelMode) => void;
}

export default function LayoutSwitcher({
  mode,
  onChange,
}: LayoutSwitcherProps) {
  return (
    <button
      onClick={() =>
        onChange(mode === "live-preview" ? "none" : "live-preview")
      }
      title={mode === "live-preview" ? "Close preview" : "Open preview"}
      className="flex items-center gap-2 h-10 px-4 rounded-full text-125 font-medium whitespace-nowrap transition-colors duration-[var(--me-dur)]
        bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#d4d4d4] border border-gray-200 dark:border-transparent
        hover:bg-gray-200 dark:hover:bg-[#333]
        data-[active=true]:bg-gray-900 dark:data-[active=true]:bg-white data-[active=true]:text-white dark:data-[active=true]:text-gray-900 data-[active=true]:border-transparent"
      data-active={mode === "live-preview"}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      Preview
    </button>
  );
}
