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

// Discovery-first reveal so we never burn AI tokens on a pause alone.
// HINT_MS shows a quiet "AI suggestion" pill (no network call). The pill
// stays put until the user clicks it; only then does the real request
// fire and the pill morphs into the "Thinking..." popover. Any keystroke
// or caret move dismisses the pill without ever calling the model.
const HINT_MS = 500;
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
  useBookMind({ bookId, userId });

  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastTextRef = useRef("");
  // Caret context captured at the moment the hint pill appears. Clicking
  // the pill steals focus and collapses the selection, so we cannot re-read
  // the DOM at click time — we generate from this snapshot instead.
  const pendingCtxRef = useRef<{ textBefore: string } | null>(null);
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
    pendingCtxRef.current = null;
    if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
  }, []);

  // Fires the actual continuation request from the caret snapshot taken
  // when the hint pill appeared. Invoked only by clicking the pill.
  const generate = useCallback(async () => {
    const ctx = pendingCtxRef.current;
    if (!ctx) return;

    const text = ctx.textBefore.slice(-200);
    lastTextRef.current = text;
    needsLeadingSpaceRef.current = !/\s$/.test(ctx.textBefore);

    setHintVisible(false);
    setGenerating(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Continuation requires a different voice than inlineEdit, so call
      // the endpoint directly with a continuation-specific prompt.
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
  }, []);

  // Listen for selection changes and input events to detect idle caret
  useEffect(() => {
    if (!enabled) { clear(); return; }

    const handleActivity = () => {
      // Any activity clears the existing suggestion
      if (suggestion) clear();

      // Hide any in-flight discovery hint — it'll re-show below if the
      // user pauses again at sentence-end. Drop the stale caret snapshot.
      setHintVisible(false);
      pendingCtxRef.current = null;

      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

      // The only timer left is the free, no-network discovery hint. The
      // model is never called until the user clicks the pill, so the pill
      // simply sits at the caret until clicked or dismissed by activity.
      hintTimerRef.current = setTimeout(() => {
        const ctx = getCaretContext();
        if (!ctx || !ctx.atEnd) return;
        pendingCtxRef.current = { textBefore: ctx.textBefore };
        setPosition({ top: ctx.rect.top, left: ctx.rect.right + 2 });
        setHintVisible(true);
      }, HINT_MS);
    };

    document.addEventListener("selectionchange", handleActivity);
    document.addEventListener("input", handleActivity, true);
    return () => {
      document.removeEventListener("selectionchange", handleActivity);
      document.removeEventListener("input", handleActivity, true);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [enabled, clear, suggestion]);

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

  // Stage 1: discreet discovery pill — appears at HINT_MS, no network call
  // yet. It stays put until the user clicks it; the click is what fires the
  // model. onMouseDown is prevented so clicking doesn't collapse the caret
  // selection before we read the snapshot.
  if (hintVisible && !generating && !suggestion) {
    return (
      <div
        style={{
          position: "fixed",
          top: position.top + 28,
          left: Math.max(24, position.left - 12),
          zIndex: 800,
        }}
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { void generate(); }}
          aria-label="Generate AI suggestion"
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2f2f2f] shadow-sm backdrop-blur-sm transition-colors hover:border-[#4070ff]/40 hover:bg-[#4070ff]/5 dark:hover:bg-[#4070ff]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4070ff]/40 cursor-pointer"
        >
          <svg className="w-3 h-3 text-[#4070ff]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
          </svg>
          <span className="text-[10px] font-medium text-gray-500 dark:text-[#a3a3a3] tracking-wide">
            AI suggestion
          </span>
        </button>
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
                Flow mode · switch off in the Mode menu
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
