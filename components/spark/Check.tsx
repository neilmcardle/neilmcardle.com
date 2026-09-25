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
          solved ? "spark-card-pass" : "spark-card"
        } ${picked !== null && !solved ? "spark-shake" : ""}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="spark-eyebrow text-[var(--spark-phosphor)]">
            Checkpoint
          </span>
          <span className="h-px flex-1 bg-[var(--spark-rule)]" />
        </div>

        <p className="mb-5 text-[19px] font-semibold leading-[1.4] tracking-[-0.01em] text-[var(--spark-text)]">
          {question}
        </p>

        <p aria-live="polite" className="sr-only">
          {picked === null
            ? ""
            : solved
              ? `Correct. ${choices[correctIndex]}`
              : `Not quite. You chose ${choices[picked]}. The answer is ${choices[correctIndex]}.`}
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

            let border = "var(--spark-hairline)";
            let background = "transparent";
            if (isPicked && isCorrect) {
              border = "var(--spark-pass)";
              background = "rgba(59,232,107,0.08)";
            } else if (isPicked) {
              border = "var(--spark-redline)";
              background = "rgba(255,107,94,0.08)";
            } else if (picked !== null && isCorrect) {
              border = "rgba(59,232,107,0.55)";
            }

            return (
              <button
                key={i}
                onClick={() => setPicked(i)}
                aria-pressed={isPicked}
                className="flex min-h-[44px] items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:border-[var(--spark-text)]"
                style={{ borderColor: border, background }}
              >
                <span
                  className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold ${
                    isPicked && isCorrect
                      ? "spark-pop bg-[var(--spark-pass)] text-[var(--spark-screen-ink)]"
                      : isPicked
                        ? "bg-[var(--spark-redline)] text-[var(--spark-screen-ink)]"
                        : "border border-[var(--spark-rule)] bg-[var(--spark-sheet)] text-[var(--spark-faint)]"
                  }`}
                >
                  <span aria-hidden>
                    {isPicked && isCorrect
                      ? "\u2713"
                      : isPicked
                        ? "\u2715"
                        : String.fromCharCode(65 + i)}
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block spark-mono text-[13px] text-[var(--spark-text)]">
                    {choice}
                  </span>
                  {showReason && reasons[i] && (
                    <span className="mt-2 block text-[12.5px] leading-[1.6] text-[var(--spark-muted)]">
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
      className={`spark-check my-8 rounded-xl bg-[var(--spark-paper)] p-6 ${"spark-card"}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="spark-eyebrow text-[var(--spark-phosphor)]">
          Checkpoint
        </span>
        <span className="h-px flex-1 bg-[var(--spark-rule)]" />
      </div>

      <p className="mb-5 text-[19px] font-semibold leading-[1.4] tracking-[-0.01em] text-[var(--spark-text)]">
        {question}
      </p>

      {revealed ? (
        <div
          aria-live="polite"
          className="spark-fade-up rounded-lg bg-[rgba(59,232,107,0.1)] px-4 py-3.5"
        >
          <span className="spark-eyebrow mb-2 block text-[var(--spark-phosphor)]">
            Answer
          </span>
          <p className="text-[14px] leading-[1.7] text-[var(--spark-text)]">
            {answer}
          </p>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="min-h-[44px] rounded-md bg-[var(--spark-ink)] px-5 py-2.5 text-[13.5px] font-semibold text-[var(--spark-sheet)] transition-opacity hover:opacity-85"
        >
          Answer it in your head, then reveal
        </button>
      )}
    </div>
  );
}
