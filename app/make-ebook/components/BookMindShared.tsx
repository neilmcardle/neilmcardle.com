'use client';

// Shared primitives used by both Book Mind surfaces:
//   - The inline right-panel (<BookMindPanel/>)
//   - The standalone /make-ebook/book-mind page
//
// Deliberately NOT a unified chat component. The two surfaces have genuinely
// different layouts (cramped right panel vs. full-page chat with avatars and
// sidebar session history) and forcing them to share a rendering component
// would mean carrying 8+ config props for one tool. Keep the shells separate,
// share the primitives. If you change ThinkingDots or formatBookMindMessage
// here, both surfaces update — no drift.

import React from 'react';
import type { BookMindAction } from '../hooks/useBookMind';

// Book icon — the same book glyph used throughout Book Mind. Default stroke
// and size can be overridden per call site.
export function BookMindIcon({ className = 'w-4 h-4' }: { className?: string }) {
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

// Bouncing dots for the "Book Mind is thinking" state. Uses the default
// Tailwind animate-bounce keyframe with three staggered delays so it reads as
// a sequence rather than three synchronised dots.
export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-[#737373] animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: '900ms' }}
        />
      ))}
    </span>
  );
}

// Very light markdown-to-HTML for Book Mind replies. Bold (**x**) and double
// newlines become paragraphs. Single newlines become <br/>. Anything else is
// passed through verbatim. The output is rendered via dangerouslySetInnerHTML
// by both call sites; the input is trusted because it comes from our own API
// route.
export function formatBookMindMessage(content: string): string {
  if (!content) return '';
  return content
    .split(/\n\n+/)
    .map((para) =>
      `<p>${para
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />')
      }</p>`
    )
    .join('');
}

// Full superset of quick actions. The inline panel renders the first four
// (the most-used set in a small space). The standalone page renders all six,
// including the more detailed timeline and word-frequency reviews that make
// sense when the user has opened the full-page chat.
export interface BookMindQuickAction {
  action: BookMindAction;
  label: string;
  description: string;
}

export const BOOK_MIND_QUICK_ACTIONS: readonly BookMindQuickAction[] = [
  { action: 'summarize-book',       label: 'Summarise',       description: 'Full book overview' },
  { action: 'list-characters',      label: 'Characters',      description: 'Who appears where' },
  { action: 'find-inconsistencies', label: 'Inconsistencies', description: 'Plot holes & gaps' },
  { action: 'analyze-themes',       label: 'Themes',          description: 'Big ideas' },
  { action: 'timeline-review',      label: 'Timeline',        description: 'Chronology check' },
  { action: 'word-frequency',       label: 'Word usage',      description: 'Overused phrases' },
];

// The compact subset surfaced in the right-panel where vertical space is
// tight. Kept as a separate export so the call site reads `COMPACT_QUICK_ACTIONS`
// instead of a magic `.slice(0, 4)`.
export const BOOK_MIND_COMPACT_QUICK_ACTIONS: readonly BookMindQuickAction[] =
  BOOK_MIND_QUICK_ACTIONS.slice(0, 4);
