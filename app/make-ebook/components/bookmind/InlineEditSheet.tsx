"use client";

import React from "react";

interface InlineEditSheetProps {
  selectedText: string;
  instruction: string;
  onInstructionChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  results: (string | null)[];
  activeIndex: number;
  activeResult: string | null;
  numAlternatives: number;
  maxAlternatives: number;
  onSelectAlternative: (index: number) => void;
  onMoreTakes: () => void;
  onRegenerate: () => void;
  onAccept: () => void;
  onClose: () => void;
}

export default function InlineEditSheet({
  selectedText,
  instruction,
  onInstructionChange,
  onSubmit,
  isLoading,
  error,
  results,
  activeIndex,
  activeResult,
  numAlternatives,
  maxAlternatives,
  onSelectAlternative,
  onMoreTakes,
  onRegenerate,
  onAccept,
  onClose,
}: InlineEditSheetProps) {
  const hasAnyResult = results.some((r) => r !== null);
  const completedCount = results.filter((r) => r !== null).length;

  return (
    <div
      role="dialog"
      aria-label="Rewrite with Book Mind"
      className="me-rise-in fixed left-3 right-3 z-[1000] flex flex-col p-1.5 rounded-[12px] bg-[#101010] border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        maxHeight: "70vh",
      }}
    >
      <div className="flex items-center gap-2 px-2 pt-1 pb-2 flex-shrink-0">
        <svg
          className="w-3.5 h-3.5 text-[#7fc8ff] flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
        </svg>
        <span className="text-13 font-medium text-white">Rewrite</span>
        <span className="flex-1 min-w-0 text-11 text-white/35 truncate">
          &ldquo;{selectedText}&rdquo;
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          className="flex items-center justify-center w-8 h-8 -mr-1 rounded-[8px] text-white/45 active:bg-white/10 flex-shrink-0"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 px-2 py-1.5 rounded-[8px] bg-white/[0.07] flex-shrink-0">
        <input
          value={instruction}
          onChange={(e) => onInstructionChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Tighten this, add sensory detail…"
          disabled={isLoading}
          enterKeyHint="go"
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!instruction.trim() || isLoading}
          aria-label="Run rewrite"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#101010] disabled:bg-white/15 disabled:text-white/30 flex-shrink-0"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {(isLoading || hasAnyResult || error) && (
        <div className="flex-1 min-h-0 overflow-y-auto mt-1.5 px-2">
          {error && <p className="py-2 text-11 text-red-400">{error}</p>}

          {isLoading && !hasAnyResult && (
            <p className="me-breathe py-3 text-11 text-white/45">Rewriting…</p>
          )}

          {activeResult && (
            <p className="py-2 text-sm leading-relaxed text-white whitespace-pre-wrap">
              {activeResult}
            </p>
          )}
        </div>
      )}

      {hasAnyResult && numAlternatives > 1 && (
        <div className="flex items-center gap-2 px-2 py-1.5 flex-shrink-0">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => r !== null && onSelectAlternative(i)}
              disabled={r === null}
              aria-label={`Take ${i + 1}`}
              className={`w-7 h-7 rounded-full text-11 font-semibold ${
                i === activeIndex && r !== null
                  ? "bg-white text-[#101010]"
                  : r !== null
                    ? "bg-white/10 text-white/70"
                    : "bg-white/5 text-white/25"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <span className="text-11 text-white/35">
            {completedCount}/{numAlternatives} ready
          </span>
        </div>
      )}

      {hasAnyResult && (
        <div className="flex items-center gap-1.5 pt-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={onAccept}
            disabled={!activeResult}
            className="flex-1 h-11 rounded-[8px] bg-white text-sm font-semibold text-[#101010] disabled:opacity-40 active:opacity-80"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
            className="h-11 px-4 rounded-[8px] bg-white/10 text-sm text-white/85 disabled:opacity-40 active:bg-white/20"
          >
            Try again
          </button>
          {numAlternatives < maxAlternatives && (
            <button
              type="button"
              onClick={onMoreTakes}
              disabled={isLoading}
              className="h-11 px-4 rounded-[8px] bg-white/10 text-sm text-white/85 disabled:opacity-40 active:bg-white/20"
            >
              More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
