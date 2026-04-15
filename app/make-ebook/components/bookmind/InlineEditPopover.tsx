"use client";

// InlineEditPopover — the Cmd-K floating prompt bar.
//
// Shown when the user presses ⌘K (or Ctrl+K) in the editor with a
// non-empty selection. The popover anchors itself to the selection's
// bounding rectangle, takes an instruction ("make this tighter"),
// calls useBookMind.inlineEdit() against the Spotlight context tier,
// and streams the rewritten passage back into the popover. The user
// then Accepts (replaces the original selection), Regenerates (re-runs
// with the same instruction), or Cancels.
//
// The popover owns its own useBookMind instance for the inlineEdit()
// call. That gives it isolated loading state without touching the
// Inspector Chat tab's state. The underlying book + brief + memory
// are read from localStorage by useBookMind, so this extra hook
// instance doesn't duplicate data — only ephemeral UI state.
//
// Keyboard model:
//   Enter    submit instruction / accept alternative (if focused on input)
//   Cmd+Enter accept alternative (from anywhere in the popover)
//   Tab      accept the currently visible alternative
//   Escape   cancel and close
//
// Positioning: fixed, anchored just below the selection. If the
// selection is near the bottom of the viewport, we flip above instead
// so the popover never gets clipped. Horizontally centered on the
// selection's midpoint and clamped to the viewport.

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useBookMind } from "../../hooks/useBookMind";
import { toast } from "sonner";

export interface InlineEditRequest {
  open: boolean;
  anchorRect: DOMRect | null;
  selectedText: string;
  // The original Range at the moment Cmd-K was pressed. The consumer
  // (page.tsx) re-activates this range before doing the insertion so
  // we write back to exactly the bytes the user originally selected.
  range: Range | null;
}

interface InlineEditPopoverProps {
  request: InlineEditRequest;
  onClose: () => void;
  onAccept: (newText: string) => void;
  bookId?: string;
  userId?: string;
}

// Width and layout tokens — inlined rather than extracted because this
// is the only component using them.
const POPOVER_WIDTH = 440;
const VIEWPORT_MARGIN = 12;
const ANCHOR_GAP = 8;

export default function InlineEditPopover({
  request,
  onClose,
  onAccept,
  bookId,
  userId,
}: InlineEditPopoverProps) {
  const { inlineEdit } = useBookMind({ bookId, userId });

  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Reset state every time a new request opens. Previous alternatives
  // and instructions shouldn't leak across invocations.
  useEffect(() => {
    if (request.open) {
      setInstruction("");
      setResult(null);
      setIsLoading(false);
      setError(null);
      // Focus the input on next tick so the browser doesn't race the
      // caret-restore from the selection change.
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [request.open]);

  // Compute the popover's top/left once per open, based on the anchor
  // rect. We flip above the selection if there isn't room below.
  const position = useMemo(() => {
    if (!request.anchorRect) return { top: 0, left: 0, placement: "below" as const };
    const rect = request.anchorRect;
    const viewportW = typeof window !== "undefined" ? window.innerWidth : 1024;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 768;

    // Horizontal: centered on the selection midpoint, clamped.
    const midX = rect.left + rect.width / 2;
    let left = midX - POPOVER_WIDTH / 2;
    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    if (left + POPOVER_WIDTH > viewportW - VIEWPORT_MARGIN) {
      left = viewportW - POPOVER_WIDTH - VIEWPORT_MARGIN;
    }

    // Vertical: prefer below, flip above if it would spill off the bottom.
    const ESTIMATED_HEIGHT = 260; // enough for input + result + actions
    const spaceBelow = viewportH - rect.bottom - ANCHOR_GAP;
    const placement: "above" | "below" =
      spaceBelow >= ESTIMATED_HEIGHT || rect.top < ESTIMATED_HEIGHT + ANCHOR_GAP
        ? "below"
        : "above";
    const top =
      placement === "below"
        ? rect.bottom + ANCHOR_GAP
        : rect.top - ESTIMATED_HEIGHT - ANCHOR_GAP;

    return { top: Math.max(VIEWPORT_MARGIN, top), left, placement };
  }, [request.anchorRect]);

  // Close on outside click (but not inside the popover itself)
  useEffect(() => {
    if (!request.open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!popoverRef.current) return;
      if (popoverRef.current.contains(e.target as Node)) return;
      onClose();
    };
    // Defer mounting the listener so the same click that opened the
    // popover doesn't immediately close it.
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleMouseDown);
    }, 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [request.open, onClose]);

  // Escape closes from anywhere
  useEffect(() => {
    if (!request.open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [request.open, onClose]);

  const handleSubmit = async () => {
    if (!instruction.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const rewritten = await inlineEdit({
        selectedText: request.selectedText,
        instruction: instruction.trim(),
      });
      if (rewritten) {
        setResult(rewritten);
      } else {
        setError("Inline edit returned no response.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inline edit failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    setResult(null);
    void handleSubmit();
  };

  const handleAccept = () => {
    if (!result) return;
    onAccept(result);
    toast.success("Replaced", {
      description: "Undo with \u2318Z if you change your mind.",
    });
    onClose();
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (result) {
        handleAccept();
      } else {
        handleSubmit();
      }
    } else if (e.key === "Tab" && result) {
      e.preventDefault();
      handleAccept();
    }
  };

  // Handle document-level Tab/Cmd+Enter while the popover is open (not
  // necessarily while the input is focused).
  useEffect(() => {
    if (!request.open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (!result) return;
      if (e.key === "Tab") {
        e.preventDefault();
        handleAccept();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleAccept();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.open, result]);

  if (!request.open || !request.anchorRect) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: POPOVER_WIDTH,
        zIndex: 1000,
      }}
      className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2f2f2f] rounded-xl shadow-2xl overflow-hidden"
      role="dialog"
      aria-label="Edit selection with Book Mind"
    >
      {/* Header: the selected text preview */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-[#262626]">
        <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-[#737373] font-medium mb-1">
          Editing
        </p>
        <p className="text-xs text-gray-500 dark:text-[#a3a3a3] italic truncate">
          &ldquo;{request.selectedText.length > 80 ? request.selectedText.slice(0, 80) + "…" : request.selectedText}&rdquo;
        </p>
      </div>

      {/* Instruction input */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-[#4070ff] flex-shrink-0 mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <textarea
            ref={inputRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleInputKey}
            placeholder="Make this tighter, rewrite as dialogue, add sensory detail…"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373] resize-none leading-relaxed disabled:opacity-50"
            style={{ minHeight: 22, maxHeight: 120 }}
          />
        </div>
      </div>

      {/* Loading / result / error region */}
      {isLoading && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-[#262626] text-xs text-gray-500 dark:text-[#a3a3a3]">
          <span className="inline-flex items-center gap-2">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Rewriting…
          </span>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-[#262626] text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
          {error}
        </div>
      )}

      {result && (
        <div className="border-t border-gray-100 dark:border-[#262626]">
          <div className="px-4 py-3 max-h-[240px] overflow-y-auto">
            <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-[#737373] font-medium mb-1.5">
              Suggested rewrite
            </p>
            <p className="text-sm text-gray-800 dark:text-[#f5f5f5] leading-relaxed whitespace-pre-wrap">
              {result}
            </p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-[#262626] bg-gray-50 dark:bg-[#181818] flex items-center justify-between gap-2">
        <p className="text-2xs text-gray-400 dark:text-[#737373] leading-tight">
          {result
            ? <>Press <Kbd>Tab</Kbd> to accept, <Kbd>Esc</Kbd> to cancel</>
            : <>Press <Kbd>Enter</Kbd> to rewrite, <Kbd>Esc</Kbd> to cancel</>
          }
        </p>
        <div className="flex items-center gap-1">
          {result && (
            <>
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#262626] rounded transition-colors disabled:opacity-50"
                title="Regenerate"
              >
                Try again
              </button>
              <button
                onClick={handleAccept}
                className="px-3 py-1 text-xs font-medium bg-[#4070ff] text-white hover:bg-[#3560e6] rounded transition-colors"
                title="Replace selection with the rewrite"
              >
                Accept
              </button>
            </>
          )}
          {!result && !isLoading && (
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
