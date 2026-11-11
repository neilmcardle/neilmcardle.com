"use client";
import React from "react";
import { displayTitle } from "../../utils/bookLibrary";
import { useBook } from "../../providers/BookProvider";
import { useEditor, useEditorActions } from "../../providers/EditorProvider";
import { shallowEqual } from "../../providers/store";

export default function NewBookConfirmDialog() {
  const open = useEditor((s) => s.newBookConfirmOpen);
  const { title, chapters } = useBook(
    (s) => ({ title: s.title, chapters: s.chapters }),
    shallowEqual,
  );
  const actions = useEditorActions();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[130] bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-book-title"
    >
      <div className="bg-[var(--ink-panel)] border border-[var(--rule)] rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <h2
          id="new-book-title"
          className="text-[17px] font-semibold text-[var(--paper)] mb-2"
        >
          Save your changes to “{displayTitle({ title, chapters })}”?
        </h2>
        <p className="text-[13.5px] leading-relaxed text-[var(--clay-muted)] mb-6">
          You’re starting a new, blank book. “
          {displayTitle({ title, chapters })}” stays in your library either way.
          Only your latest edits are at stake.
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => actions.setNewBookConfirmOpen(false)}
            className="mr-auto h-9 px-3 rounded-full text-[13px] font-medium text-[var(--clay)] hover:text-[var(--paper)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void actions.startNewBook(false)}
            className="h-9 px-4 rounded-full border border-[var(--rule)] text-[13px] font-medium text-[var(--paper)] hover:bg-[var(--ink-hover)] transition-colors"
          >
            Don’t save
          </button>
          <button
            type="button"
            onClick={() => void actions.startNewBook(true)}
            className="h-9 px-4 rounded-full bg-[var(--acid)] text-[13px] font-semibold text-[var(--ink-deep)] hover:bg-[var(--acid-hover)] transition-colors"
          >
            Save and start new
          </button>
        </div>
      </div>
    </div>
  );
}
