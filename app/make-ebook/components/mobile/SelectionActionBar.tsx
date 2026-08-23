"use client";

import React, { useEffect, useState } from "react";

interface SelectionActionBarProps {
  onRewrite: (selectedText: string, range: Range, rect: DOMRect) => void;
  onTighten: (selectedText: string, range: Range, rect: DOMRect) => void;
  onAsk: (selectedText: string, range: Range, rect: DOMRect) => void;
}

interface ActiveSelection {
  text: string;
  range: Range;
  rect: DOMRect;
}

export default function SelectionActionBar({
  onRewrite,
  onTighten,
  onAsk,
}: SelectionActionBarProps) {
  const [selection, setSelection] = useState<ActiveSelection | null>(null);

  useEffect(() => {
    const read = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setSelection(null);
        return;
      }
      const node = sel.anchorNode;
      const host = node
        ? ((node as HTMLElement).closest?.('[contenteditable="true"]') ??
          node.parentElement?.closest('[contenteditable="true"]') ??
          null)
        : null;
      if (!host) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      setSelection({
        text,
        range: range.cloneRange(),
        rect: range.getBoundingClientRect(),
      });
    };

    document.addEventListener("selectionchange", read);
    return () => document.removeEventListener("selectionchange", read);
  }, []);

  if (!selection) return null;

  const act = (fn: SelectionActionBarProps["onRewrite"]) => () =>
    fn(selection.text, selection.range, selection.rect);

  return (
    <div
      className="me-rise-in fixed left-3 right-3 z-[110] flex items-center gap-1 p-1.5 rounded-[12px] bg-[#101010] border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)" }}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={act(onRewrite)}
        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[8px] bg-white/10 text-sm font-medium text-white active:bg-white/20"
      >
        <svg
          className="w-3.5 h-3.5 text-[#7fc8ff]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
        </svg>
        Rewrite
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={act(onTighten)}
        className="flex-1 flex items-center justify-center h-10 rounded-[8px] text-sm text-white/85 active:bg-white/10"
      >
        Tighten
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={act(onAsk)}
        className="flex-1 flex items-center justify-center h-10 rounded-[8px] text-sm text-white/85 active:bg-white/10"
      >
        Ask
      </button>
    </div>
  );
}
