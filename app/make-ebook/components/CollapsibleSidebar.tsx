"use client";

import React, { useState, useRef, useEffect } from "react";

import LibraryPanel from "./sidebar/LibraryPanel";
import BookDetailsPanel from "./sidebar/BookDetailsPanel";
import ChaptersPanel from "./sidebar/ChaptersPanel";
import BookSummaryHeader from "./sidebar/BookSummaryHeader";
import SyncConflictBanner from "./sidebar/SyncConflictBanner";
import { keys, readLocal, writeLocal } from "../storage/keys";
import { useBook } from "../providers/BookProvider";
import { useEditor, useEditorActions } from "../providers/EditorProvider";
import { shallowEqual } from "../providers/store";

const MIN_WIDTH = 220;
const MAX_WIDTH = 560;
const DEFAULT_WIDTH = 350;

export default function CollapsibleSidebar() {
  const { isPanelOpen, activeView } = useEditor(
    (s) => ({ isPanelOpen: s.isPanelOpen, activeView: s.sidebarView }),
    shallowEqual,
  );
  const { setSidebarView } = useEditorActions();
  const onClose = () => setSidebarView(null);
  const summary = useBook(
    (s) => ({
      title: s.title,
      author: s.author,
      genre: s.genre,
      completedChapters: s.chapters.filter((c) => c.completed).length,
      totalChapters: s.chapters.length,
    }),
    shallowEqual,
  );
  const totalWords = useEditor((s) => s.bookStats.totalWords);

  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = readLocal(keys.panelWidth());
      return saved
        ? Math.min(Math.max(parseInt(saved, 10), MIN_WIDTH), MAX_WIDTH)
        : DEFAULT_WIDTH;
    }
    return DEFAULT_WIDTH;
  });
  const sidebarRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    if (sidebarRef.current) sidebarRef.current.style.transition = "none";
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const commitWidth = (next: number) => {
    const clamped = Math.min(Math.max(next, MIN_WIDTH), MAX_WIDTH);
    setWidth(clamped);
    if (sidebarRef.current) sidebarRef.current.style.width = `${clamped}px`;
    if (innerRef.current) {
      innerRef.current.style.width = `${clamped}px`;
      innerRef.current.style.minWidth = `${clamped}px`;
    }
    writeLocal(keys.panelWidth(), String(clamped));
  };

  const handleResizeKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 48 : 16;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      commitWidth(width + step);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      commitWidth(width - step);
    } else if (e.key === "Home") {
      e.preventDefault();
      commitWidth(MIN_WIDTH);
    } else if (e.key === "End") {
      e.preventDefault();
      commitWidth(MAX_WIDTH);
    }
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isResizing.current) return;
      const next = Math.min(
        Math.max(startWidth.current + e.clientX - startX.current, MIN_WIDTH),
        MAX_WIDTH,
      );
      if (sidebarRef.current) sidebarRef.current.style.width = `${next}px`;
      if (innerRef.current) {
        innerRef.current.style.width = `${next}px`;
        innerRef.current.style.minWidth = `${next}px`;
      }
    };
    const onUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (sidebarRef.current) {
        sidebarRef.current.style.transition = "";
        const final = Math.min(
          Math.max(
            Math.round(
              parseFloat(sidebarRef.current.style.width) || startWidth.current,
            ),
            MIN_WIDTH,
          ),
          MAX_WIDTH,
        );
        setWidth(final);
        writeLocal(keys.panelWidth(), String(final));
      }
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className={`hidden lg:block h-full z-40 transition-all duration-300 overflow-hidden relative ${
        isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ width: isPanelOpen ? width : 0 }}
    >
      <div
        ref={innerRef}
        className="flex flex-col h-full bg-white dark:bg-[var(--ink)] border-r border-gray-200 dark:border-[var(--rule)]"
        style={{ width, minWidth: width }}
      >
        <div className="flex justify-end px-4 pt-2 pb-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 dark:hover:bg-[var(--ink-raised)] rounded-lg transition-colors"
            title="Close panel"
            aria-label="Close panel"
          >
            <img
              src="/close-sidebar-icon.svg"
              alt="Close"
              className="w-5 h-5 dark:hidden"
            />
            <img
              src="/dark-close-sidebar-icon.svg"
              alt="Close"
              className="w-5 h-5 hidden dark:block"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--clay-muted)] hover:scrollbar-thumb-[var(--clay-muted)] dark:scrollbar-thumb-[var(--clay-muted)] dark:hover:scrollbar-thumb-[var(--clay-muted)]">
          {activeView === "library" && (
            <>
              <SyncConflictBanner />
              <LibraryPanel />
            </>
          )}

          {activeView === "book" && <BookDetailsPanel />}

          {activeView === "chapters" && (
            <>
              <BookSummaryHeader
                title={summary.title}
                author={summary.author}
                genre={summary.genre}
                totalWords={totalWords ?? 0}
                completedChapters={summary.completedChapters}
                totalChapters={summary.totalChapters}
              />
              <ChaptersPanel />
            </>
          )}
        </div>
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        tabIndex={0}
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize z-50 hidden lg:block touch-none hover:bg-gray-300 dark:hover:bg-[var(--ink-hover)] focus-visible:bg-gray-400 dark:focus-visible:bg-[var(--ink-hover)] focus-visible:outline-none transition-colors"
        onPointerDown={handleResizeStart}
        onKeyDown={handleResizeKeyDown}
      />
    </aside>
  );
}
