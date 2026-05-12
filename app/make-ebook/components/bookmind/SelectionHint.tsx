"use client";

// Tiny floating badge near a text selection that teaches the user
// Cmd-K exists. Disappears forever once Cmd-K has been used at least
// once (tracked in localStorage). Also hides when the selection clears
// or the inline edit popover is open. Debounces 800ms after a
// selection settles to avoid flashing on click-and-drag.

import React, { useState, useEffect, useCallback } from "react";
import { useIsMac, ModKey } from "../marketing/sections-v2/PlatformKey";

const STORAGE_KEY = "me_cmdk_hint_dismissed";

interface SelectionHintProps {
  hasBookMind: boolean;
  inlineEditOpen: boolean;
  onTriggerCmdK: () => void;
}

export default function SelectionHint({
  hasBookMind,
  inlineEditOpen,
  onTriggerCmdK,
}: SelectionHintProps) {
  const isMac = useIsMac();
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  const dismiss = useCallback(() => {
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* quota */ }
  }, []);

  useEffect(() => {
    if (inlineEditOpen) dismiss();
  }, [inlineEditOpen, dismiss]);

  useEffect(() => {
    if (!hasBookMind || dismissed || inlineEditOpen) {
      setVisible(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const handleSelection = () => {
      if (timer) clearTimeout(timer);
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setVisible(false);
        return;
      }

      timer = setTimeout(() => {
        const sel2 = window.getSelection();
        if (!sel2 || sel2.isCollapsed) { setVisible(false); return; }

        // Only show if the selection is inside the editor (contenteditable).
        const node = sel2.anchorNode;
        const editorEl = node
          ? (node as HTMLElement).closest?.('[contenteditable="true"]') ??
            (node.parentElement?.closest('[contenteditable="true"]') ?? null)
          : null;
        if (!editorEl) { setVisible(false); return; }

        try {
          const range = sel2.getRangeAt(0);
          setRect(range.getBoundingClientRect());
          setVisible(true);
        } catch {
          setVisible(false);
        }
      }, 800);
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      if (timer) clearTimeout(timer);
    };
  }, [hasBookMind, dismissed, inlineEditOpen]);

  const handleClick = () => {
    dismiss();
    onTriggerCmdK();
  };

  if (!visible || !rect || dismissed || inlineEditOpen) return null;

  // Position: just below the selection's bottom-right corner.
  const top = rect.bottom + 6;
  const left = rect.right - 4;

  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        top,
        left,
        zIndex: 900,
      }}
      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-900 dark:bg-[#2a2a2a] text-white text-[11px] font-medium shadow-lg hover:bg-gray-700 dark:hover:bg-[#3a3a3a] transition-all animate-in fade-in slide-in-from-bottom-1 duration-200"
      title="Edit selection with Book Mind"
      aria-label={`Edit selection with Book Mind (${isMac ? '⌘K' : 'Ctrl+K'})`}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span><ModKey keyName="K" /></span>
    </button>
  );
}
