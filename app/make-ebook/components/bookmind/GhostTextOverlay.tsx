"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useBookMind } from "../../hooks/useBookMind";

interface GhostTextOverlayProps {
  enabled: boolean;
  bookId?: string;
  userId?: string;
  onAccept: (text: string) => void;
}

const HINT_MS = 500;
const SENTENCE_END = /[.!?]\s*$/;

function getCaretContext(): {
  rect: DOMRect;
  textBefore: string;
  atEnd: boolean;
} | null {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || !sel.rangeCount) return null;

  const node = sel.anchorNode;
  const editorEl = node?.parentElement?.closest?.('[contenteditable="true"]');
  if (!editorEl) return null;

  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.height === 0) return null;

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
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastTextRef = useRef("");

  const pendingCtxRef = useRef<{ textBefore: string } | null>(null);

  const needsLeadingSpaceRef = useRef(false);

  const suggestionRef = useRef<string | null>(null);
  useEffect(() => {
    suggestionRef.current = suggestion;
  }, [suggestion]);

  const clear = useCallback(() => {
    setSuggestion(null);
    setPosition(null);
    setGenerating(false);
    setHintVisible(false);
    pendingCtxRef.current = null;
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

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
      const ghostResponse = await fetch("/api/ai/book-mind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          voice:
            "Continue with one sentence, max 20 words. Match the voice exactly. No preamble. Start with a space. No em dashes.",
          context: `=== TEXT SO FAR ===\n${ctx.textBefore.slice(-800)}\n=== END ===`,
          messages: [{ role: "user", content: "Continue from here." }],
          tier: "spotlight",
        }),
      });
      if (!ghostResponse.ok || !ghostResponse.body || controller.signal.aborted)
        return;
      const reader = ghostResponse.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let result = "";
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") break outer;
          try {
            const p = JSON.parse(d);
            if (p.content) result += p.content;
          } catch {
            /* skip */
          }
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

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    const handleActivity = () => {
      if (suggestion) clear();

      setHintVisible(false);
      pendingCtxRef.current = null;

      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

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

  const accept = useCallback(() => {
    const s = suggestionRef.current;
    if (!s) return;
    const body = s.replace(/^\s+/, "");
    const prefix = needsLeadingSpaceRef.current ? " " : "";
    onAccept(prefix + body);
    clear();
  }, [onAccept, clear]);

  useEffect(() => {
    if (!suggestion) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        accept();
      } else if (
        !["Shift", "Meta", "Control", "Alt", "CapsLock"].includes(e.key)
      ) {
        clear();
      }
    };
    document.addEventListener("keydown", handle, true);
    return () => document.removeEventListener("keydown", handle, true);
  }, [suggestion, accept, clear]);

  useEffect(() => {
    if (!generating || suggestion) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clear();
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [generating, suggestion, clear]);

  if (!enabled || !position) return null;
  if (!suggestion && !generating && !hintVisible) return null;

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
          onClick={() => {
            void generate();
          }}
          aria-label="Generate AI suggestion"
          className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/95 dark:bg-[color:color-mix(in_srgb,var(--ink)_95%,transparent)] border border-gray-200 dark:border-[var(--rule)] shadow-sm backdrop-blur-sm transition-colors hover:border-[color:color-mix(in_srgb,var(--acid)_40%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--paper)_5%,transparent)] dark:hover:bg-[color:color-mix(in_srgb,var(--paper)_10%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--acid)_40%,transparent)] cursor-pointer"
        >
          <svg
            className="w-3 h-3 text-[var(--acid)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
          </svg>
          <span className="text-[10px] font-medium text-gray-500 dark:text-[var(--clay-muted)] tracking-wide">
            AI suggestion
          </span>
        </button>
      </div>
    );
  }

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
      <div className="bg-white dark:bg-[var(--ink)] border border-gray-200 dark:border-[var(--rule)] rounded-xl shadow-lg px-4 py-3">
        {generating && !suggestion && (
          <button
            onClick={clear}
            className="flex items-center gap-2 text-xs text-gray-400 dark:text-[var(--clay-muted)] animate-pulse hover:text-gray-600 dark:hover:text-[var(--clay-muted)] transition-colors w-full text-left"
            title="Click or press Esc to dismiss"
          >
            <span>Thinking...</span>
            <svg
              className="w-3 h-3 flex-shrink-0 opacity-0 hover:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
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
              className="group w-full text-left rounded-md -m-1 p-1 transition-colors hover:bg-[color:color-mix(in_srgb,var(--paper)_5%,transparent)] dark:hover:bg-[color:color-mix(in_srgb,var(--paper)_10%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--acid)_40%,transparent)] cursor-pointer"
            >
              <p
                className="text-sm text-gray-700 dark:text-[var(--clay)] leading-relaxed"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {suggestion}
              </p>
            </button>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-[var(--ink-raised)]">
              <span className="text-[10px] text-gray-400 dark:text-[var(--clay-muted)]">
                <kbd className="inline-flex items-center px-1 py-0 rounded border border-gray-200 dark:border-[var(--ink-hover)] bg-gray-50 dark:bg-[var(--ink-raised)] text-gray-500 dark:text-[var(--clay-muted)] font-mono text-[10px] mx-0.5">
                  Tab
                </kbd>{" "}
                or click to insert
              </span>
              <span className="text-[10px] text-gray-400 dark:text-[var(--clay-muted)]">
                Flow mode · switch off in the Mode menu
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
