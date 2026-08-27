"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { WidgetShell, useReducedMotion } from "./WidgetShell";

const USERS = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
];

interface Line {
  text: string;
  indent: number;
  note?: (query: string, matches: string[]) => string;
}

const LINES: Line[] = [
  { text: "function UserSearch() {", indent: 0 },
  {
    text: 'const [query, setQuery] = useState("");',
    indent: 1,
    note: (query) =>
      query === ""
        ? 'First render. useState returns the initial value, "".'
        : `useState returns "${query}". Not the initial value. React kept it for you.`,
  },
  {
    text: "const matches = users.filter(",
    indent: 1,
    note: () => "This line runs again from scratch on every single render.",
  },
  { text: "(user) => user.includes(query)", indent: 2 },
  {
    text: ");",
    indent: 1,
    note: (query, matches) =>
      `matches is a brand new array: ${matches.length} of ${USERS.length}.`,
  },
  { text: "return (", indent: 1 },
  {
    text: "<input value={query} onChange={...} />",
    indent: 2,
    note: (query) => `The input is told to show "${query}".`,
  },
  {
    text: "{matches.map((u) => <li>{u}</li>)}",
    indent: 2,
    note: () => "The list is rebuilt from the new matches array.",
  },
  { text: ");", indent: 1 },
  { text: "}", indent: 0 },
];

function matchesFor(query: string): string[] {
  const term = query.trim().toLowerCase();
  return USERS.filter((user) => user.toLowerCase().includes(term));
}

export function UseStateCycle() {
  const [query, setQuery] = useState("");
  const [renders, setRenders] = useState(1);
  const [step, setStep] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const matches = matchesFor(query);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback(() => {
    stop();
    setStep(0);
    if (reduced) return;
    setPlaying(true);
  }, [reduced, stop]);

  useEffect(() => {
    if (!playing || step === null) return;

    if (step >= LINES.length - 1) {
      timer.current = window.setTimeout(() => setPlaying(false), 700);
      return () => {
        if (timer.current !== null) window.clearTimeout(timer.current);
      };
    }

    timer.current = window.setTimeout(() => setStep(step + 1), 340);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [playing, step]);

  const onType = (value: string) => {
    setQuery(value);
    setRenders((n) => n + 1);
    play();
  };

  const reset = () => {
    stop();
    setQuery("");
    setRenders(1);
    setStep(null);
  };

  const activeLine = step === null ? null : LINES[step];
  const noteText = activeLine?.note?.(query, matches);

  return (
    <WidgetShell
      title="The component function runs again. The state does not."
      status={`render ${renders}`}
      onReset={reset}
      caption="Type a letter and watch the whole function re-run top to bottom. The one thing that survives is the value useState hands back."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-lg bg-[var(--spark-ink)] py-3">
            {LINES.map((line, i) => {
              const isActive = step === i;
              const hasRun = step !== null && i < step;

              return (
                <div
                  key={i}
                  className="grid grid-cols-[28px_minmax(0,1fr)] items-start px-1 transition-colors duration-150"
                  style={{
                    background: isActive
                      ? "rgba(216,180,106,0.14)"
                      : "transparent",
                    boxShadow: isActive
                      ? "inset 2px 0 0 var(--spark-gold)"
                      : "none",
                  }}
                >
                  <span
                    aria-hidden
                    className="spark-mono select-none pr-2 pt-[3px] text-right text-[10.5px] tabular-nums"
                    style={{
                      color: isActive
                        ? "var(--spark-gold)"
                        : "var(--spark-on-dark-dim)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <code
                    className="spark-mono whitespace-pre-wrap break-words pr-3 text-[12.5px] leading-[1.75] transition-opacity"
                    style={{
                      paddingLeft: line.indent * 14,
                      color: isActive
                        ? "#fff"
                        : hasRun
                          ? "var(--spark-on-dark)"
                          : "var(--spark-on-dark-dim)",
                    }}
                  >
                    {line.text}
                  </code>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 min-h-[3.4em] rounded-lg border border-dashed border-[var(--spark-gold)]/40 bg-[var(--spark-gold)]/[0.07] px-3 py-2.5">
            {step === null ? (
              <p className="text-[12.5px] leading-[1.6] text-[var(--spark-faint)]">
                Type below to run the function.
              </p>
            ) : (
              <p className="text-[12.5px] leading-[1.6] text-[#44423e]">
                <span className="spark-eyebrow mr-2 text-[var(--spark-gold-ink)]">
                  Line {step + 1}
                </span>
                {noteText ??
                  "Nothing to remember on this line. It is rebuilt exactly as written."}
              </p>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stop();
                setStep((s) => (s === null ? 0 : Math.max(0, s - 1)));
              }}
              disabled={step === null || step === 0}
              aria-label="Previous line"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--spark-muted)] transition-colors hover:bg-black/[0.05] disabled:pointer-events-none disabled:opacity-25"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                stop();
                setStep((s) =>
                  s === null ? 0 : Math.min(LINES.length - 1, s + 1),
                );
              }}
              disabled={step !== null && step >= LINES.length - 1}
              aria-label="Next line"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--spark-muted)] transition-colors hover:bg-black/[0.05] disabled:pointer-events-none disabled:opacity-25"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
            <span className="spark-mono text-[11px] tabular-nums text-[var(--spark-faint)]">
              {step === null ? "idle" : `line ${step + 1} of ${LINES.length}`}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <label className="spark-eyebrow mb-2 block text-[var(--spark-faint)]">
            The real input
          </label>
          <input
            type="search"
            value={query}
            onChange={(event) => onType(event.target.value)}
            placeholder="Type a name"
            className="w-full rounded-lg border px-3.5 py-2.5 text-[14px] text-[var(--spark-text)] outline-none transition-colors placeholder:text-[var(--spark-faint)] focus:border-[var(--spark-gold-deep)]"
            style={{ borderColor: "rgba(20,20,19,0.16)", background: "#fff" }}
          />

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-lg bg-[var(--spark-gold)]/[0.12] px-3 py-2.5">
              <span className="spark-eyebrow block text-[var(--spark-gold-ink)]">
                State, kept
              </span>
              <span className="spark-mono mt-1 block truncate text-[13px] text-[var(--spark-text)]">
                {query === "" ? '""' : `"${query}"`}
              </span>
            </div>
            <div className="rounded-lg bg-black/[0.035] px-3 py-2.5">
              <span className="spark-eyebrow block text-[var(--spark-faint)]">
                Renders
              </span>
              <span className="spark-mono mt-1 block text-[13px] tabular-nums text-[var(--spark-text)]">
                {renders}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <span className="spark-eyebrow mb-2 block text-[var(--spark-faint)]">
              Rebuilt every render
            </span>
            <ul className="flex list-none flex-col gap-1 pl-0">
              {USERS.map((user) => {
                const hit = matches.includes(user);
                return (
                  <li
                    key={user}
                    className="spark-mono rounded px-2.5 py-1.5 text-[12px] transition-colors"
                    style={{
                      background: hit
                        ? "rgba(216,180,106,0.16)"
                        : "rgba(20,20,19,0.03)",
                      color: hit ? "var(--spark-text)" : "var(--spark-faint)",
                      textDecoration: hit ? "none" : "line-through",
                    }}
                  >
                    {user}
                  </li>
                );
              })}
            </ul>
            {matches.length === 0 && (
              <p className="mt-2 text-[12px] text-[var(--spark-faint)]">
                No matches. The list is empty, not broken.
              </p>
            )}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}
