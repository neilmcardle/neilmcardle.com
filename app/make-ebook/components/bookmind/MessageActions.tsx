"use client";

// Per-message action row. Revealed on hover of the message bubble in
// ChatTab. Keeps the chat surface quiet by default and surfaces
// affordances only when the user is actually looking at a message.
//
// Actions supported:
//   - Copy: copy message content to clipboard, flash a "Copied" state
//   - Regenerate: re-run the same prompt with the same context
//   - Continue: ask for more of the same response
//   - Open in Reading View: promote a long response to the slide-over
//
// All actions are optional props — callers pass in only what makes
// sense for their message (e.g. no Regenerate for the current message
// if it's still streaming).

import React, { useState } from "react";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  onContinue?: () => void;
  onOpenReadingView?: () => void;
  disabled?: boolean;
}

export default function MessageActions({
  content,
  onRegenerate,
  onContinue,
  onOpenReadingView,
  disabled,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (non-HTTPS, old browser) — silently
      // skip. The UI stays unchanged so nothing breaks.
    }
  };

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <ActionButton
        onClick={handleCopy}
        disabled={disabled}
        title={copied ? "Copied" : "Copy"}
        aria-label={copied ? "Copied to clipboard" : "Copy message"}
      >
        {copied ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </ActionButton>

      {onRegenerate && (
        <ActionButton
          onClick={onRegenerate}
          disabled={disabled}
          title="Regenerate"
          aria-label="Regenerate response"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </ActionButton>
      )}

      {onContinue && (
        <ActionButton
          onClick={onContinue}
          disabled={disabled}
          title="Continue"
          aria-label="Continue response"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </ActionButton>
      )}

      {onOpenReadingView && (
        <ActionButton
          onClick={onOpenReadingView}
          disabled={disabled}
          title="Open in reading view"
          aria-label="Open in reading view"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M14 10l6.16-6.16M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5" />
          </svg>
        </ActionButton>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  title,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  "aria-label": string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
