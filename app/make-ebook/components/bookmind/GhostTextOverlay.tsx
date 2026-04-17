"use client";

// GhostTextOverlay — inline ghost-text sentence completion.
//
// Self-contained: reads the caret position and surrounding text
// directly from the DOM via window.getSelection(). No props needed
// from RichTextEditor. Fires a Haiku call when the caret sits idle
// for 2+ seconds at the end of a sentence. Tab accepts, any other
// key dismisses. Mounted at the page level, gated on Flow mode + Pro.

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useBookMind } from "../../hooks/useBookMind";

interface GhostTextOverlayProps {
  enabled: boolean;
  bookId?: string;
  userId?: string;
  onAccept: (text: string) => void;
}

const IDLE_MS = 2000;
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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastTextRef = useRef("");

  const clear = useCallback(() => {
    setSuggestion(null);
    setPosition(null);
    setGenerating(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
  }, []);

  // Listen for selection changes and input events to detect idle caret
  useEffect(() => {
    if (!enabled) { clear(); return; }

    const handleActivity = () => {
      // Any activity clears the existing suggestion
      if (suggestion) clear();

      // Reset the idle timer
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        const ctx = getCaretContext();
        if (!ctx || !ctx.atEnd) return;

        // Don't re-generate for the same text
        const text = ctx.textBefore.slice(-200);
        if (text === lastTextRef.current && suggestion) return;
        lastTextRef.current = text;

        setPosition({ top: ctx.rect.top, left: ctx.rect.right + 2 });
        setGenerating(true);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          // Call the API directly instead of inlineEdit, because
        // inlineEdit uses a "rewrite" voice that confuses the model
        // when asked to continue. This uses a bare fetch with a
        // continuation-specific system prompt.
        const ghostResponse = await fetch('/api/ai/book-mind', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify({
            voice: 'You continue prose. The author has paused at the end of a sentence. Write 1-2 sentences that continue naturally from where they stopped. Match the voice, tense, point of view, and rhythm exactly. Return ONLY the continuation text. No preamble, no quotes, no explanation. Start with a space. Never use em dashes.',
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
    };
  }, [enabled, inlineEdit, clear, suggestion]);

  // Tab accepts, any other typing key dismisses
  useEffect(() => {
    if (!suggestion) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        onAccept(suggestion);
        clear();
      } else if (!["Shift", "Meta", "Control", "Alt", "CapsLock"].includes(e.key)) {
        clear();
      }
    };
    document.addEventListener("keydown", handle, true);
    return () => document.removeEventListener("keydown", handle, true);
  }, [suggestion, onAccept, clear]);

  if (!enabled || (!suggestion && !generating) || !position) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 800,
        pointerEvents: "none",
        maxWidth: 480,
      }}
    >
      {generating && !suggestion && (
        <span
          className="text-gray-300 dark:text-[#525252] animate-pulse"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "15px", lineHeight: "1.75" }}
        >
          ...
        </span>
      )}
      {suggestion && (
        <span
          className="text-gray-300 dark:text-[#525252]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "15px", lineHeight: "1.75" }}
        >
          {" "}{suggestion}
          <span className="ml-2 text-[10px] text-gray-400 dark:text-[#636363] font-sans align-middle">
            Tab ↵
          </span>
        </span>
      )}
    </div>
  );
}
