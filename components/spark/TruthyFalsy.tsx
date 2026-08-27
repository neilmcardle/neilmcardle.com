"use client";

import React, { useState } from "react";
import { WidgetShell } from "./WidgetShell";

interface Value {
  code: string;
  truthy: boolean;
  note: string;
}

const VALUES: Value[] = [
  {
    code: "0",
    truthy: false,
    note: "Zero is falsy. This is why if (count) silently skips when the count is zero, and why you should write if (count > 0) instead.",
  },
  {
    code: '"0"',
    truthy: true,
    note: "A string containing a zero is still a non-empty string. Only the number zero is falsy.",
  },
  {
    code: "[]",
    truthy: true,
    note: "An empty array is truthy, because the array itself exists. Check results.length === 0 rather than the array.",
  },
  {
    code: "{}",
    truthy: true,
    note: "An empty object is truthy for the same reason. The object exists.",
  },
  {
    code: '""',
    truthy: false,
    note: "An empty string is falsy. This is what makes if (!query) a reliable way to detect an empty input.",
  },
  {
    code: "null",
    truthy: false,
    note: "Falsy. Deliberately empty, written by a programmer who meant it.",
  },
  {
    code: "undefined",
    truthy: false,
    note: "Falsy. Nothing was ever assigned here.",
  },
  {
    code: "NaN",
    truthy: false,
    note: "Falsy. The result of an invalid calculation, and the sixth and last falsy value.",
  },
  {
    code: '"false"',
    truthy: true,
    note: "Truthy. It is a seven-character string, and its contents are never inspected.",
  },
];

export function TruthyFalsy() {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);

  const value = VALUES[index];
  const done = index >= VALUES.length - 1 && answered !== null;

  const answer = (saidTruthy: boolean) => {
    if (answered !== null) return;
    const right = saidTruthy === value.truthy;
    if (right) setCorrect((n) => n + 1);
    setAnswered(right);
  };

  const next = () => {
    if (index < VALUES.length - 1) {
      setIndex(index + 1);
      setAnswered(null);
    }
  };

  const reset = () => {
    setIndex(0);
    setCorrect(0);
    setAnswered(null);
  };

  return (
    <WidgetShell
      title="Truthy or falsy?"
      status={`${correct} / ${VALUES.length}`}
      onReset={index === 0 && answered === null ? undefined : reset}
      caption="Six values are falsy and everything else is truthy. Guessing wrong once is a faster way to learn the six than reading them."
    >
      <span className="spark-mono mb-1 block text-[11px] tabular-nums text-[var(--spark-faint)]">
        {index + 1} of {VALUES.length}
      </span>

      <div
        className="flex min-h-[92px] items-center justify-center rounded-lg"
        style={{ background: "var(--spark-ink)" }}
      >
        <code className="spark-mono text-[clamp(1.4rem,5vw,2rem)] font-semibold text-[var(--spark-gold)]">
          {value.code}
        </code>
      </div>

      <div className="mt-3 flex gap-2.5">
        <button
          type="button"
          onClick={() => answer(true)}
          disabled={answered !== null}
          className="min-h-[46px] flex-1 rounded-full border text-[14px] font-semibold transition-colors disabled:opacity-55"
          style={{
            borderColor:
              answered !== null && value.truthy
                ? "var(--spark-gold-deep)"
                : "rgba(20,20,19,0.16)",
            background:
              answered !== null && value.truthy
                ? "rgba(216,180,106,0.14)"
                : "transparent",
            color: "var(--spark-text)",
          }}
        >
          Truthy
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          disabled={answered !== null}
          className="min-h-[46px] flex-1 rounded-full border text-[14px] font-semibold transition-colors disabled:opacity-55"
          style={{
            borderColor:
              answered !== null && !value.truthy
                ? "var(--spark-gold-deep)"
                : "rgba(20,20,19,0.16)",
            background:
              answered !== null && !value.truthy
                ? "rgba(216,180,106,0.14)"
                : "transparent",
            color: "var(--spark-text)",
          }}
        >
          Falsy
        </button>
      </div>

      <div aria-live="polite" className="mt-3 min-h-[4.6em]">
        {answered !== null && (
          <div className="spark-fade-up rounded-lg bg-[var(--spark-gold)]/[0.1] px-3.5 py-3">
            <p className="text-[13px] leading-[1.65] text-[#44423e]">
              <strong
                className="font-semibold"
                style={{
                  color: answered ? "var(--spark-gold-ink)" : "#b8543a",
                }}
              >
                {answered ? "Correct." : "Not quite."}
              </strong>{" "}
              <code className="spark-inline-code">{value.code}</code> is{" "}
              {value.truthy ? "truthy" : "falsy"}. {value.note}
            </p>

            {done ? (
              <p className="mt-2.5 text-[13px] font-medium text-[var(--spark-text)]">
                That is all six falsy values: 0, &quot;&quot;, null, undefined,
                NaN and false.
              </p>
            ) : (
              <button
                type="button"
                onClick={next}
                className="mt-2.5 min-h-[38px] rounded-full bg-[var(--spark-ink)] px-5 text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-px"
              >
                Next value
              </button>
            )}
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
