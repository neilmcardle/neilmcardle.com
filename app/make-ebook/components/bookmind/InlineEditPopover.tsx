"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { useBookMind } from "../../hooks/useBookMind";
import { toast } from "sonner";
import { useIsMac } from "../PlatformKey";
import InlineEditSheet from "./InlineEditSheet";
import { Spinner } from "../Spinner";

export interface InlineEditRequest {
  open: boolean;
  anchorRect: DOMRect | null;
  selectedText: string;
  range: Range | null;
  initialInstruction?: string;
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
const INITIAL_ALTERNATIVES = 1;
const MAX_ALTERNATIVES = 3;

const CHROME_HEIGHT = 180;

export default function InlineEditPopover({
  request,
  onClose,
  onAccept,
  bookId,
  userId,
}: InlineEditPopoverProps) {
  const { inlineEdit } = useBookMind({ bookId, userId });
  const isMac = useIsMac();
  const modKey = isMac ? "⌘" : "Ctrl+";
  const undoCombo = isMac ? "⌘Z" : "Ctrl+Z";

  const [instruction, setInstruction] = useState("");
  const [results, setResults] = useState<(string | null)[]>(
    Array(INITIAL_ALTERNATIVES).fill(null),
  );
  const [numAlternatives, setNumAlternatives] = useState(INITIAL_ALTERNATIVES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const autoRunRef = useRef<string | null>(null);

  const hasAnyResult = results.some((r) => r !== null);
  const activeResult = results[activeIndex] ?? null;
  const completedCount = results.filter((r) => r !== null).length;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (request.open) {
      setInstruction(request.initialInstruction ?? "");
      autoRunRef.current = request.initialInstruction ?? null;
      setNumAlternatives(INITIAL_ALTERNATIVES);
      setResults(Array(INITIAL_ALTERNATIVES).fill(null));
      setActiveIndex(0);
      setIsLoading(false);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [request.open]);

  const layout = useMemo(() => {
    if (!request.anchorRect) return { top: 0, left: 0, maxHeight: 500 };
    const rect = request.anchorRect;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;

    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    if (left + POPOVER_WIDTH > vw - VIEWPORT_MARGIN)
      left = vw - POPOVER_WIDTH - VIEWPORT_MARGIN;

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

  useEffect(() => {
    if (!request.open) return;
    const handle = (e: MouseEvent) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handle),
      50,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handle);
    };
  }, [request.open, onClose]);

  useEffect(() => {
    if (!request.open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [request.open, onClose]);

  useEffect(() => {
    if (!request.open || !hasAnyResult) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + numAlternatives) % numAlternatives);
      } else if (e.key === "ArrowDown" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % numAlternatives);
      } else if (e.key === "Tab" && activeResult) {
        e.preventDefault();
        handleAccept();
      } else if (
        e.key === "Enter" &&
        (e.metaKey || e.ctrlKey) &&
        activeResult
      ) {
        e.preventDefault();
        handleAccept();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.open, hasAnyResult, activeResult, activeIndex]);

  const handleSubmit = useCallback(
    async (count?: number) => {
      if (!instruction.trim() || isLoading) return;
      const n = count ?? numAlternatives;
      setIsLoading(true);
      setError(null);
      setResults(Array(n).fill(null));
      setActiveIndex(0);

      const promises = Array.from({ length: n }, async (_, i) => {
        try {
          const rewritten = await inlineEdit({
            selectedText: request.selectedText,
            instruction: instruction.trim(),
          });
          setResults((prev) => {
            const next = [...prev];
            next[i] = rewritten;
            return next;
          });
        } catch (err) {
          if (i === 0)
            setError(err instanceof Error ? err.message : "Rewrite failed");
        }
      });

      await Promise.allSettled(promises);
      setIsLoading(false);
    },
    [instruction, isLoading, inlineEdit, request.selectedText, numAlternatives],
  );
  useEffect(() => {
    if (!request.open || !autoRunRef.current) return;
    if (autoRunRef.current !== instruction) return;
    autoRunRef.current = null;
    void handleSubmit();
  }, [request.open, instruction, handleSubmit]);

  const handleRegenerate = useCallback(() => {
    setResults(Array(numAlternatives).fill(null));
    setActiveIndex(0);
    void handleSubmit();
  }, [handleSubmit, numAlternatives]);

  const handleMoreTakes = useCallback(() => {
    setNumAlternatives(MAX_ALTERNATIVES);
    void handleSubmit(MAX_ALTERNATIVES);
  }, [handleSubmit]);

  const handleAccept = useCallback(() => {
    if (!activeResult) return;

    const leading = request.selectedText.match(/^\s+/)?.[0] ?? "";
    const trailing = request.selectedText.match(/\s+$/)?.[0] ?? "";
    const core = activeResult.replace(/^\s+/, "").replace(/\s+$/, "");
    onAccept(leading + core + trailing);
    toast.success("Replaced", {
      description: `Undo with ${undoCombo} if you change your mind.`,
    });
    onClose();
  }, [activeResult, onAccept, onClose, request.selectedText, undoCombo]);

  const handleInputKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (activeResult) handleAccept();
      else handleSubmit();
    }
  };

  if (!request.open || !request.anchorRect) return null;
  if (typeof document === "undefined") return null;

  if (isMobile) {
    return createPortal(
      <InlineEditSheet
        selectedText={request.selectedText}
        instruction={instruction}
        onInstructionChange={setInstruction}
        onSubmit={() => handleSubmit()}
        isLoading={isLoading}
        error={error}
        results={results}
        activeIndex={activeIndex}
        activeResult={activeResult}
        numAlternatives={numAlternatives}
        maxAlternatives={MAX_ALTERNATIVES}
        onSelectAlternative={setActiveIndex}
        onMoreTakes={handleMoreTakes}
        onRegenerate={handleRegenerate}
        onAccept={handleAccept}
        onClose={onClose}
      />,
      document.body,
    );
  }

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
      className="bg-white dark:bg-[var(--ink)] border border-gray-200 dark:border-[var(--rule)] rounded-xl shadow-2xl overflow-hidden"
      role="dialog"
      aria-label="Edit selection with Book Mind"
    >
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-[var(--ink-raised)] flex-shrink-0">
        <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-[var(--clay-muted)] font-medium mb-1">
          Editing
        </p>
        <p className="text-xs text-gray-500 dark:text-[var(--clay-muted)] italic truncate">
          &ldquo;
          {request.selectedText.length > 80
            ? request.selectedText.slice(0, 80) + "…"
            : request.selectedText}
          &rdquo;
        </p>
      </div>

      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-[var(--acid)] flex-shrink-0 mt-1"
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
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[var(--clay-muted)] resize-none leading-relaxed disabled:opacity-50"
            style={{ minHeight: 22, maxHeight: 80 }}
          />
        </div>
      </div>

      {(isLoading || hasAnyResult || error) && (
        <div className="flex-1 min-h-0 overflow-y-auto border-t border-gray-100 dark:border-[var(--ink-raised)]">
          {error && (
            <div className="px-4 py-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
              {error}
            </div>
          )}

          {(hasAnyResult || isLoading) && numAlternatives > 1 && (
            <div className="px-4 pt-3 pb-1 flex items-center gap-3">
              <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-[var(--clay-muted)] font-medium">
                {isLoading && !hasAnyResult
                  ? "Generating 3 alternatives…"
                  : "Alternatives"}
              </p>
              <div className="flex items-center gap-2">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => r !== null && setActiveIndex(i)}
                    disabled={r === null}
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                      i === activeIndex && r !== null
                        ? "bg-[var(--paper)] text-[var(--ink-deep)]"
                        : r !== null
                          ? "bg-gray-200 dark:bg-[var(--rule)] text-gray-600 dark:text-[var(--clay-muted)] hover:bg-gray-300 dark:hover:bg-[var(--ink-hover)]"
                          : "bg-gray-100 dark:bg-[var(--ink-raised)] text-gray-300 dark:text-[var(--clay-muted)]"
                    }`}
                    title={r !== null ? `Alternative ${i + 1}` : "Generating…"}
                  >
                    {r !== null ? (
                      i + 1
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-[var(--clay-muted)] animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
              {completedCount > 0 && (
                <span className="text-2xs text-gray-400 dark:text-[var(--clay-muted)]">
                  {completedCount}/{numAlternatives} ready
                </span>
              )}
            </div>
          )}

          {activeResult && (
            <div className="px-4 pt-2 pb-3 space-y-3">
              <div>
                <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-[var(--clay-muted)] font-medium mb-1">
                  Original
                </p>
                <p className="text-xs text-gray-400 dark:text-[var(--clay-muted)] leading-relaxed line-through decoration-gray-300 dark:decoration-[var(--clay-muted)]">
                  {request.selectedText.length > 300
                    ? request.selectedText.slice(0, 300) + "…"
                    : request.selectedText}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAccept}
                aria-label="Accept this suggestion"
                className="group w-full text-left rounded-lg p-2 -m-2 cursor-pointer transition-colors hover:bg-[var(--paper)]/5 dark:hover:bg-[var(--paper)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)]/40"
              >
                <p className="text-2xs uppercase tracking-wider text-[var(--acid)] font-medium mb-1 flex items-center gap-2">
                  Suggestion
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] normal-case tracking-normal text-gray-400 dark:text-[var(--clay-muted)]">
                    click to accept
                  </span>
                </p>
                <p className="text-sm text-gray-800 dark:text-[var(--paper)] leading-relaxed whitespace-pre-wrap">
                  {activeResult}
                </p>
              </button>
            </div>
          )}

          {isLoading && !hasAnyResult && (
            <div className="px-4 py-4 flex items-center gap-2 text-xs text-gray-500 dark:text-[var(--clay-muted)]">
              <Spinner size="xs" />
              Rewriting…
            </div>
          )}
        </div>
      )}

      <div className="px-3 py-2 border-t border-gray-100 dark:border-[var(--ink-raised)] bg-gray-50 dark:bg-[var(--ink-window)] flex items-center justify-between gap-2 flex-shrink-0">
        <p className="text-2xs text-gray-400 dark:text-[var(--clay-muted)] leading-tight min-w-0 truncate">
          {hasAnyResult ? (
            <>
              {numAlternatives > 1 && (
                <>
                  <Kbd>{modKey}↑↓</Kbd> cycle &middot;{" "}
                </>
              )}
              <Kbd>Tab</Kbd> accept &middot; <Kbd>Esc</Kbd> cancel
            </>
          ) : (
            <>
              <Kbd>Enter</Kbd> rewrite &middot; <Kbd>Esc</Kbd> cancel
            </>
          )}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasAnyResult && (
            <>
              {numAlternatives < MAX_ALTERNATIVES && (
                <button
                  onClick={handleMoreTakes}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs font-medium text-[var(--acid)] border border-[var(--acid)]/30 hover:bg-[var(--paper)]/5 dark:hover:bg-[var(--paper)]/10 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                >
                  More takes
                </button>
              )}
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-[var(--clay-muted)] border border-gray-200 dark:border-[var(--ink-hover)] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] rounded-md transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
              >
                Try again
              </button>
              <button
                onClick={handleAccept}
                disabled={!activeResult}
                className="px-3 py-1 text-xs font-medium bg-[var(--paper)] text-[var(--ink-deep)] hover:bg-[var(--clay)] rounded-md transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
              >
                Accept
              </button>
            </>
          )}
          {!hasAnyResult && !isLoading && (
            <button
              onClick={() => handleSubmit()}
              disabled={!instruction.trim()}
              className="px-3 py-1 text-xs font-medium bg-[var(--paper)] text-[var(--ink-deep)] hover:bg-[var(--clay)] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
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
    <kbd className="inline-flex items-center px-1 py-0 rounded border border-gray-200 dark:border-[var(--ink-hover)] bg-white dark:bg-[var(--ink-raised)] text-gray-600 dark:text-[var(--clay-muted)] font-mono text-[10px] leading-tight mx-0.5">
      {children}
    </kbd>
  );
}
