"use client";

import React from "react";
import DOMPurify from "dompurify";
import type { BookMindAction } from "../hooks/useBookMind";

export function BookMindIcon({
  className = "w-4 h-4",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-[var(--clay-muted)] animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: "900ms" }}
        />
      ))}
    </span>
  );
}

export function formatBookMindMessage(content: string): string {
  if (!content) return "";
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .split(/\n\n+/)
    .map(
      (para) =>
        `<p>${para
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em"],
    ALLOWED_ATTR: [],
  });
}

export interface BookMindQuickAction {
  action: BookMindAction;
  label: string;
  description: string;
}

export const BOOK_MIND_QUICK_ACTIONS: readonly BookMindQuickAction[] = [
  {
    action: "summarize-book",
    label: "Summarise",
    description: "Full book overview",
  },
  {
    action: "list-characters",
    label: "Characters",
    description: "Who appears where",
  },
  {
    action: "find-inconsistencies",
    label: "Inconsistencies",
    description: "Plot holes & gaps",
  },
  { action: "analyze-themes", label: "Themes", description: "Big ideas" },
  {
    action: "timeline-review",
    label: "Timeline",
    description: "Chronology check",
  },
  {
    action: "word-frequency",
    label: "Word usage",
    description: "Overused phrases",
  },
];

export const BOOK_MIND_COMPACT_QUICK_ACTIONS: readonly BookMindQuickAction[] =
  BOOK_MIND_QUICK_ACTIONS.slice(0, 4);
