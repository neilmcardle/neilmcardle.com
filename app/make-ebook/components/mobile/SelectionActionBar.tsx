"use client";

import React, { useEffect, useState } from "react";
import {
  currentEditorSelection,
  subscribeSelection,
  type EditorSelection,
} from "../../editor/registry";
import { domRangeAt } from "../../editor/dom";

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
    const read = (current: EditorSelection | null) => {
      const view = current?.handle.view() ?? null;
      const range =
        current && view ? domRangeAt(view, current.from, current.to) : null;
      if (!current || !range) {
        setSelection(null);
        return;
      }
      setSelection({
        text: current.text,
        range,
        rect: range.getBoundingClientRect(),
      });
    };
    read(currentEditorSelection());
    return subscribeSelection(read);
  }, []);

  if (!selection) return null;

  const act = (fn: SelectionActionBarProps["onRewrite"]) => () =>
    fn(selection.text, selection.range, selection.rect);

  return (
    <div
      className="me-rise-in fixed left-3 right-3 z-[110] flex items-center gap-1 p-1.5 rounded-[12px] bg-[var(--ink-deep)] border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)" }}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={act(onRewrite)}
        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[8px] bg-white/10 text-sm font-medium text-white active:bg-white/20"
      >
        <svg
          className="w-3.5 h-3.5 text-[var(--acid)]"
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
