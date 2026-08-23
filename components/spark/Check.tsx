"use client";

import { useState } from "react";

interface CheckProps {
  question: string;
  answer?: string;
  options?: string;
  correct?: string | number;
  why?: string;
}

function split(value?: string): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function Check({ question, answer, options, correct, why }: CheckProps) {
  const choices = split(options);
  const reasons = split(why);
  const correctIndex =
    typeof correct === "string" ? parseInt(correct, 10) : (correct ?? 0);

  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const solved = picked === correctIndex;

  if (choices.length > 0) {
    return (
      <div
        className={`spark-check my-8 rounded-xl bg-[var(--spark-paper)] p-6 ${
          picked !== null && !solved ? "spark-shake" : ""
        }`}
        style={{
          boxShadow: solved
            ? "0 0 0 1px var(--spark-gold-deep), 0 2px 5px 0 rgba(0,0,0,0.04)"
            : "0px 0px 0px 1px rgba(0,0,0,0.07), 0px 2px 3px -1px rgba(0,0,0,0.06), 0px 2px 5px 0px rgba(0,0,0,0.04)",
        }}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="spark-eyebrow text-[var(--spark-gold-deep)]">
            + Checkpoint
          </span>
          <span className="h-px flex-1 bg-black/[0.08]" />
        </div>

        <p className="mb-5 font-serif text-[21px] leading-[1.4] text-[var(--spark-text)]">
          {question}
        </p>

        <div
          className="flex flex-col gap-2.5"
          role="group"
          aria-label="Answer options"
        >
          {choices.map((choice, i) => {
            const isPicked = picked === i;
            const isCorrect = i === correctIndex;
            const showReason = picked !== null && (isPicked || isCorrect);

            let border = "rgba(20,20,19,0.14)";
            let background = "transparent";
            if (isPicked && isCorrect) {
              border = "var(--spark-gold-deep)";
              background = "rgba(216,180,106,0.1)";
            } else if (isPicked) {
              border = "var(--spark-terracotta)";
              background = "rgba(232,146,124,0.08)";
            } else if (picked !== null && isCorrect) {
              border = "rgba(184,146,63,0.5)";
            }

            return (
              <button
                key={i}
                onClick={() => setPicked(i)}
                aria-pressed={isPicked}
                className="flex min-h-[44px] items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:border-black/30"
                style={{ borderColor: border, background }}
              >
                <span
                  className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold ${
                    isPicked && isCorrect
                      ? "spark-pop bg-[var(--spark-gold-deep)] text-white"
                      : isPicked
                        ? "bg-[var(--spark-terracotta)] text-white"
                        : "border border-black/[0.16] text-[#8a8780]"
                  }`}
                >
                  {isPicked && isCorrect
                    ? "✓"
                    : isPicked
                      ? "✕"
                      : String.fromCharCode(65 + i)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block spark-mono text-[13px] text-[var(--spark-text)]">
                    {choice}
                  </span>
                  {showReason && reasons[i] && (
                    <span className="mt-2 block text-[12.5px] leading-[1.6] text-[#55534e]">
                      {reasons[i]}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className="spark-check my-8 rounded-xl bg-[var(--spark-paper)] p-6"
      style={{
        boxShadow: revealed
          ? "0 0 0 1px var(--spark-gold-deep), 0 2px 5px 0 rgba(0,0,0,0.04)"
          : "0px 0px 0px 1px rgba(0,0,0,0.07), 0px 2px 3px -1px rgba(0,0,0,0.06), 0px 2px 5px 0px rgba(0,0,0,0.04)",
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="spark-eyebrow text-[var(--spark-gold-deep)]">
          + Checkpoint
        </span>
        <span className="h-px flex-1 bg-black/[0.08]" />
      </div>

      <p className="mb-5 font-serif text-[21px] leading-[1.4] text-[var(--spark-text)]">
        {question}
      </p>

      {revealed ? (
        <div className="spark-fade-up rounded-lg bg-[var(--spark-gold)]/[0.1] px-4 py-3.5">
          <span className="spark-eyebrow mb-2 block text-[var(--spark-gold-deep)]">
            + Answer
          </span>
          <p className="text-[14px] leading-[1.7] text-[#44423e]">{answer}</p>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="min-h-[44px] rounded-full bg-[var(--spark-ink)] px-5 py-2.5 text-[13px] font-medium text-white transition-transform hover:-translate-y-px"
        >
          Answer it in your head, then reveal
        </button>
      )}
    </div>
  );
}
