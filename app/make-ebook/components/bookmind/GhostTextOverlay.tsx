"use client";

// Inline ghost-text sentence completion. Reads caret position from the
// DOM and fires a continuation request when the caret sits idle at the
// end of a sentence. Tab accepts, any other key dismisses.

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useBookMind } from "../../hooks/useBookMind";

interface GhostTextOverlayProps {
  enabled: boolean;
  bookId?: string;
  userId?: string;
  onAccept: (text: string) => void;
}

// Two-stage reveal so users can discover the feature without us burning
// AI tokens on every short pause. HINT_MS shows a quiet "AI is poised"
// pill (no network call). If the user keeps idling past IDLE_MS, the
// real suggestion request fires and the pill morphs into the existing
// "Thinking..." popover. Any keystroke or caret move cancels both.
const HINT_MS = 500;
const IDLE_MS = 1500;
const SENTENCE_END = /[.!?]\s*$/;

function getCaretContext(): { rect: DOMRect; textBefore: string; atEnd: boolean } | null {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || !sel.rangeCount) return null;

  const node = sel.anchorNode;
  const editorEl = node?.parentElement?.closest?.('[contenteditable="true"]');
  if (!editorEl) return null;

  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.height === 0) return null;

  // Gather text before the caret from the current text node
  const text = node?.textContent ?? "";
  const offset = sel.anchorOffset;
  const textBefore = text.slice(0, offset);
  const atEnd = SENTENCE_END.test(textBefore.trimEnd());

  return { rect, textBefore, atEnd };
}

export default function GhostTextOverlay({
  enabled,
  bookId,
  userId,
  onAccept,
}: GhostTextOverlayProps) {
  const { inlineEdit } = useBookMind({ bookId, userId });

  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastTextRef = useRef("");
  // True when the caret sits directly after non-whitespace at suggestion
  // time. Used at accept time to prepend a single space, since the model
  // routinely returns its continuation trimmed even when told otherwise.
  const needsLeadingSpaceRef = useRef(false);
  // Mirror of `suggestion` so the click handler can still resolve the
  // value if a click-triggered selectionchange has already cleared state.
  const suggestionRef = useRef<string | null>(null);
  useEffect(() => { suggestionRef.current = suggestion; }, [suggestion]);

  const clear = useCallback(() => {
    setSuggestion(null);
    setPosition(null);
    setGenerating(false);
    setHintVisible(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
  }, []);

  // Listen for selection changes and input events to detect idle caret
  useEffect(() => {
    if (!enabled) { clear(); return; }

    const handleActivity = () => {
      // Any activity clears the existing suggestion
      if (suggestion) clear();

      // Hide any in-flight discovery hint — it'll re-show below if the
      // user pauses again at sentence-end.
      setHintVisible(false);

      // Reset both timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

      // Stage 1: free, no-network discovery hint near the caret.
      hintTimerRef.current = setTimeout(() => {
        const ctx = getCaretContext();
        if (!ctx || !ctx.atEnd) return;
        setPosition({ top: ctx.rect.top, left: ctx.rect.right + 2 });
        setHintVisible(true);
      }, HINT_MS);

      // Stage 2: the actual AI call.
      timerRef.current = setTimeout(async () => {
        const ctx = getCaretContext();
        if (!ctx || !ctx.atEnd) return;

        // Don't re-generate for the same text
        const text = ctx.textBefore.slice(-200);
        if (text === lastTextRef.current && suggestion) return;
        lastTextRef.current = text;
        needsLeadingSpaceRef.current = !/\s$/.test(ctx.textBefore);

        setPosition({ top: ctx.rect.top, left: ctx.rect.right + 2 });
        setGenerating(true);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          // Continuation requires a different voice than inlineEdit, so
          // call the endpoint directly with a continuation-specific prompt.
        const ghostResponse = await fetch('/api/ai/book-mind', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify({
            voice: 'Continue with one sentence, max 20 words. Match the voice exactly. No preamble. Start with a space. No em dashes.',
            context: `=== TEXT SO FAR ===\n${ctx.textBefore.slice(-800)}\n=== END ===`,
            messages: [{ role: 'user', content: 'Continue from here.' }],
            tier: 'spotlight',
          }),
        });
        if (!ghostResponse.ok || !ghostResponse.body || controller.signal.aborted) return;
        const reader = ghostResponse.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        let result = '';
        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const d = line.slice(6).trim();
            if (d === '[DONE]') break outer;
            try {
              const p = JSON.parse(d);
              if (p.content) result += p.content;
            } catch { /* skip */ }
          }
        }
          if (controller.signal.aborted) return;
          if (result.trim()) {
            setSuggestion(result.trim());
          }
        } catch {
          // Silent — ghost text is best-effort
        } finally {
          if (!controller.signal.aborted) setGenerating(false);
        }
      }, IDLE_MS);
    };

    document.addEventListener("selectionchange", handleActivity);
    document.addEventListener("input", handleActivity, true);
    return () => {
      document.removeEventListener("selectionchange", handleActivity);
      document.removeEventListener("input", handleActivity, true);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [enabled, inlineEdit, clear, suggestion]);

  // Single accept path: reinstates a leading space when the caret sat
  // directly after non-whitespace, so the inserted continuation never
  // glues onto the previous word. Reads from the ref so a stale-by-one-
  // render closure (e.g. click → selectionchange → clear) still works.
  const accept = useCallback(() => {
    const s = suggestionRef.current;
    if (!s) return;
    const body = s.replace(/^\s+/, "");
    const prefix = needsLeadingSpaceRef.current ? " " : "";
    onAccept(prefix + body);
    clear();
  }, [onAccept, clear]);

  // Tab accepts, any other typing key dismisses
  useEffect(() => {
    if (!suggestion) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        accept();
      } else if (!["Shift", "Meta", "Control", "Alt", "CapsLock"].includes(e.key)) {
        clear();
      }
    };
    document.addEventListener("keydown", handle, true);
    return () => document.removeEventListener("keydown", handle, true);
  }, [suggestion, accept, clear]);

  // Escape or click on the thinking bubble dismisses and cancels the call
  useEffect(() => {
    if (!generating || suggestion) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); clear(); }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [generating, suggestion, clear]);

  if (!enabled || !position) return null;
  if (!suggestion && !generating && !hintVisible) return null;

  // Stage 1: discreet discovery pill — appears at HINT_MS, no network
  // call yet. Pointer-events disabled so it never gets in the way of
  // typing or clicking through to the manuscript.
  if (hintVisible && !generating && !suggestion) {
    return (
      <div
        style={{
          position: "fixed",
          top: position.top + 28,
          left: Math.max(24, position.left - 12),
          zIndex: 800,
        }}
        className="pointer-events-none"
      >
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2f2f2f] shadow-sm backdrop-blur-sm animate-pulse">
          <svg className="w-3 h-3 text-[#4070ff]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
          </svg>
          <span className="text-[10px] font-medium text-gray-500 dark:text-[#a3a3a3] tracking-wide">
            AI suggestion
          </span>
        </div>
      </div>
    );
  }

  // Render as a floating card BELOW the caret line, not inline.
  // This avoids the ghost text overlapping existing manuscript text
  // on the lines beneath the cursor.
  return (
    <div
      style={{
        position: "fixed",
        top: position.top + 28, // drop below the line
        left: Math.max(24, position.left - 12),
        zIndex: 800,
        maxWidth: 440,
      }}
    >
      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2f2f2f] rounded-xl shadow-lg px-4 py-3">
        {generating && !suggestion && (
          <button
            onClick={clear}
            className="flex items-center gap-2 text-xs text-gray-400 dark:text-[#737373] animate-pulse hover:text-gray-600 dark:hover:text-[#a3a3a3] transition-colors w-full text-left"
            title="Click or press Esc to dismiss"
          >
            <span>Thinking...</span>
            <svg className="w-3 h-3 flex-shrink-0 opacity-0 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {suggestion && (
          <>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={accept}
              aria-label="Insert suggestion"
              className="group w-full text-left rounded-md -m-1 p-1 transition-colors hover:bg-[#4070ff]/5 dark:hover:bg-[#4070ff]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4070ff]/40 cursor-pointer"
            >
              <p
                className="text-sm text-gray-700 dark:text-[#d4d4d4] leading-relaxed"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {suggestion}
              </p>
            </button>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-[#262626]">
              <span className="text-[10px] text-gray-400 dark:text-[#737373]">
                <kbd className="inline-flex items-center px-1 py-0 rounded border border-gray-200 dark:border-[#3a3a3a] bg-gray-50 dark:bg-[#262626] text-gray-500 dark:text-[#a3a3a3] font-mono text-[10px] mx-0.5">Tab</kbd> or click to insert
              </span>
              <span className="text-[10px] text-gray-400 dark:text-[#636363]">
                Flow mode · toggle off in Inspector
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
