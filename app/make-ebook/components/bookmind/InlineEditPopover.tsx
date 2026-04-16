"use client";

// InlineEditPopover — the Cmd-K floating prompt bar with branching takes.
//
// Fires THREE parallel inlineEdit() calls against Haiku so the user
// sees up to three alternative rewrites they can cycle through with
// ⌘↑/↓. Each alternative fills its slot independently as it completes.
// Tab accepts the active one; Esc cancels. The popover is viewport-
// aware: it computes available vertical space and constrains itself
// so the result area scrolls instead of spilling below the screen.

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useBookMind } from "../../hooks/useBookMind";
import { toast } from "sonner";

export interface InlineEditRequest {
  open: boolean;
  anchorRect: DOMRect | null;
  selectedText: string;
  range: Range | null;
}

interface InlineEditPopoverProps {
  request: InlineEditRequest;
  onClose: () => void;
  onAccept: (newText: string) => void;
  bookId?: string;
  userId?: string;
}

const POPOVER_WIDTH = 440;
const VIEWPORT_MARGIN = 12;
const ANCHOR_GAP = 8;
const NUM_ALTERNATIVES = 3;

// Fixed-height regions of the popover (header + input + action bar).
// The result area gets whatever vertical space remains.
const CHROME_HEIGHT = 180;

export default function InlineEditPopover({
  request,
  onClose,
  onAccept,
  bookId,
  userId,
}: InlineEditPopoverProps) {
  const { inlineEdit } = useBookMind({ bookId, userId });

  const [instruction, setInstruction] = useState("");
  const [results, setResults] = useState<(string | null)[]>(
    Array(NUM_ALTERNATIVES).fill(null),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hasAnyResult = results.some(r => r !== null);
  const activeResult = results[activeIndex] ?? null;
  const completedCount = results.filter(r => r !== null).length;

  // Reset on every new open.
  useEffect(() => {
    if (request.open) {
      setInstruction("");
      setResults(Array(NUM_ALTERNATIVES).fill(null));
      setActiveIndex(0);
      setIsLoading(false);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [request.open]);

  // Position: anchored below selection, flips above if needed.
  // maxHeight constrains the popover to available viewport space so the
  // result area scrolls instead of extending below the screen.
  const layout = useMemo(() => {
    if (!request.anchorRect) return { top: 0, left: 0, maxHeight: 500 };
    const rect = request.anchorRect;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;

    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    if (left + POPOVER_WIDTH > vw - VIEWPORT_MARGIN) left = vw - POPOVER_WIDTH - VIEWPORT_MARGIN;

    const spaceBelow = vh - rect.bottom - ANCHOR_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - ANCHOR_GAP - VIEWPORT_MARGIN;
    const minUsable = CHROME_HEIGHT + 80;

    let top: number;
    let maxHeight: number;
    if (spaceBelow >= minUsable || spaceBelow >= spaceAbove) {
      top = rect.bottom + ANCHOR_GAP;
      maxHeight = spaceBelow;
    } else {
      maxHeight = spaceAbove;
      top = rect.top - ANCHOR_GAP - Math.min(maxHeight, 480);
    }

    maxHeight = Math.max(maxHeight, minUsable);
    return { top: Math.max(VIEWPORT_MARGIN, top), left, maxHeight };
  }, [request.anchorRect]);

  // Close on outside click (deferred so the opening click doesn't fire it).
  useEffect(() => {
    if (!request.open) return;
    const handle = (e: MouseEvent) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handle), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handle); };
  }, [request.open, onClose]);

  // Escape closes.
  useEffect(() => {
    if (!request.open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [request.open, onClose]);

  // ⌘↑/↓ cycle, Tab/⌘Enter accept — document-level so they work even
  // when the input isn't focused.
  useEffect(() => {
    if (!request.open || !hasAnyResult) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + NUM_ALTERNATIVES) % NUM_ALTERNATIVES);
      } else if (e.key === "ArrowDown" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % NUM_ALTERNATIVES);
      } else if (e.key === "Tab" && activeResult) {
        e.preventDefault();
        handleAccept();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && activeResult) {
        e.preventDefault();
        handleAccept();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.open, hasAnyResult, activeResult, activeIndex]);

  const handleSubmit = useCallback(async () => {
    if (!instruction.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResults(Array(NUM_ALTERNATIVES).fill(null));
    setActiveIndex(0);

    const promises = Array.from({ length: NUM_ALTERNATIVES }, async (_, i) => {
      try {
        const rewritten = await inlineEdit({
          selectedText: request.selectedText,
          instruction: instruction.trim(),
        });
        setResults(prev => {
          const next = [...prev];
          next[i] = rewritten;
          return next;
        });
      } catch (err) {
        if (i === 0) setError(err instanceof Error ? err.message : "Rewrite failed");
      }
    });

    await Promise.allSettled(promises);
    setIsLoading(false);
  }, [instruction, isLoading, inlineEdit, request.selectedText]);

  const handleRegenerate = useCallback(() => {
    setResults(Array(NUM_ALTERNATIVES).fill(null));
    setActiveIndex(0);
    void handleSubmit();
  }, [handleSubmit]);

  const handleAccept = useCallback(() => {
    if (!activeResult) return;
    onAccept(activeResult);
    toast.success("Replaced", { description: "Undo with \u2318Z if you change your mind." });
    onClose();
  }, [activeResult, onAccept, onClose]);

  const handleInputKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (activeResult) handleAccept();
      else handleSubmit();
    }
  };

  if (!request.open || !request.anchorRect) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: layout.top,
        left: layout.left,
        width: POPOVER_WIDTH,
        maxHeight: layout.maxHeight,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
      className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2f2f2f] rounded-xl shadow-2xl overflow-hidden"
      role="dialog"
      aria-label="Edit selection with Book Mind"
    >
      {/* Header: selection preview */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-[#262626] flex-shrink-0">
        <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-[#737373] font-medium mb-1">
          Editing
        </p>
        <p className="text-xs text-gray-500 dark:text-[#a3a3a3] italic truncate">
          &ldquo;{request.selectedText.length > 80 ? request.selectedText.slice(0, 80) + "\u2026" : request.selectedText}&rdquo;
        </p>
      </div>

      {/* Instruction input */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-[#4070ff] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <textarea
            ref={inputRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleInputKey}
            placeholder="Make this tighter, rewrite as dialogue, add sensory detail\u2026"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373] resize-none leading-relaxed disabled:opacity-50"
            style={{ minHeight: 22, maxHeight: 80 }}
          />
        </div>
      </div>

      {/* Results area — flex-1 so it takes remaining space and scrolls */}
      {(isLoading || hasAnyResult || error) && (
        <div className="flex-1 min-h-0 overflow-y-auto border-t border-gray-100 dark:border-[#262626]">
          {error && (
            <div className="px-4 py-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
              {error}
            </div>
          )}

          {/* Dot indicator for alternatives */}
          {(hasAnyResult || isLoading) && (
            <div className="px-4 pt-3 pb-1 flex items-center gap-3">
              <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-[#737373] font-medium">
                {isLoading && !hasAnyResult ? "Generating 3 alternatives\u2026" : "Alternatives"}
              </p>
              <div className="flex items-center gap-1.5">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => r !== null && setActiveIndex(i)}
                    disabled={r === null}
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                      i === activeIndex && r !== null
                        ? "bg-[#4070ff] text-white"
                        : r !== null
                          ? "bg-gray-200 dark:bg-[#2f2f2f] text-gray-600 dark:text-[#a3a3a3] hover:bg-gray-300 dark:hover:bg-[#3a3a3a]"
                          : "bg-gray-100 dark:bg-[#262626] text-gray-300 dark:text-[#525252]"
                    }`}
                    title={r !== null ? `Alternative ${i + 1}` : "Generating\u2026"}
                  >
                    {r !== null ? i + 1 : (
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-[#525252] animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
              {completedCount > 0 && (
                <span className="text-2xs text-gray-400 dark:text-[#737373]">
                  {completedCount}/{NUM_ALTERNATIVES} ready
                </span>
              )}
            </div>
          )}

          {/* Active result */}
          {activeResult && (
            <div className="px-4 pt-2 pb-3">
              <p className="text-sm text-gray-800 dark:text-[#f5f5f5] leading-relaxed whitespace-pre-wrap">
                {activeResult}
              </p>
            </div>
          )}

          {/* Loading spinner when nothing has arrived yet */}
          {isLoading && !hasAnyResult && (
            <div className="px-4 py-4 flex items-center gap-2 text-xs text-gray-500 dark:text-[#a3a3a3]">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Rewriting\u2026
            </div>
          )}
        </div>
      )}

      {/* Action bar — pinned at the bottom, always visible */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-[#262626] bg-gray-50 dark:bg-[#181818] flex items-center justify-between gap-2 flex-shrink-0">
        <p className="text-2xs text-gray-400 dark:text-[#737373] leading-tight">
          {hasAnyResult ? (
            <>
              <Kbd>\u2318\u2191\u2193</Kbd> cycle &middot;{" "}
              <Kbd>Tab</Kbd> accept &middot;{" "}
              <Kbd>Esc</Kbd> cancel
            </>
          ) : (
            <>
              <Kbd>Enter</Kbd> rewrite &middot;{" "}
              <Kbd>Esc</Kbd> cancel
            </>
          )}
        </p>
        <div className="flex items-center gap-1">
          {hasAnyResult && (
            <>
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#262626] rounded transition-colors disabled:opacity-50"
              >
                Try again
              </button>
              <button
                onClick={handleAccept}
                disabled={!activeResult}
                className="px-3 py-1 text-xs font-medium bg-[#4070ff] text-white hover:bg-[#3560e6] rounded transition-colors disabled:opacity-50"
              >
                Accept
              </button>
            </>
          )}
          {!hasAnyResult && !isLoading && (
            <button
              onClick={handleSubmit}
              disabled={!instruction.trim()}
              className="px-3 py-1 text-xs font-medium bg-[#4070ff] text-white hover:bg-[#3560e6] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rewrite
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1 py-0 rounded border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#262626] text-gray-600 dark:text-[#a3a3a3] font-mono text-[10px] leading-tight mx-0.5">
      {children}
    </kbd>
  );
}
