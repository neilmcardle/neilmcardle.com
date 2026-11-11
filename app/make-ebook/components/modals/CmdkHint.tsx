"use client";
import React from "react";
import { useEditor } from "../../providers/EditorProvider";
import { shallowEqual } from "../../providers/store";

export default function CmdkHint() {
  const { rect, inlineOpen } = useEditor(
    (s) => ({ rect: s.cmdkHintRect, inlineOpen: s.inlineEditRequest.open }),
    shallowEqual,
  );
  if (
    !rect ||
    inlineOpen ||
    typeof navigator === "undefined" ||
    /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent)
  )
    return null;
  return (
    <div
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left,
        zIndex: 900,
        pointerEvents: "none",
      }}
      className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900/90 dark:bg-[color:color-mix(in_srgb,var(--rule)_95%,transparent)] text-white text-[11px] font-medium shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-1 duration-200"
    >
      <svg
        className="w-3 h-3 opacity-70"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span>
        {typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)
          ? "⌘"
          : "Ctrl+"}
        K for AI writer
      </span>
    </div>
  );
}
