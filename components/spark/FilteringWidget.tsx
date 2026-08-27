"use client";

import React, { useState } from "react";
import { WidgetShell } from "./WidgetShell";

const NAMES = ["alice", "bob", "charlie", "diana", "evelyn"];

interface Step {
  label: string;
  code: string;
  detail: (query: string, results: string[]) => string;
}

const STEPS: Step[] = [
  {
    label: "The user presses a key",
    code: "onChange={(e) => setQuery(e.target.value)}",
    detail: (query) =>
      `The browser fires a change event. e.target.value is "${query}".`,
  },
  {
    label: "State is replaced",
    code: "setQuery(...)",
    detail: (query) =>
      `query becomes "${query}". You never assign to query directly, you call the setter.`,
  },
  {
    label: "React re-runs the function",
    code: "function Search() { ... }",
    detail: () =>
      "The whole component body runs again from the top. Nothing is patched in place.",
  },
  {
    label: "The filter runs against the new value",
    code: "names.filter((n) => n.includes(query))",
    detail: (query, results) =>
      `Five names are tested against "${query}". ${results.length} pass.`,
  },
  {
    label: "A new array comes back",
    code: "const results = [...]",
    detail: (query, results) =>
      results.length > 0
        ? `results is ${JSON.stringify(results)}. The original names array is untouched.`
        : "results is an empty array. The original names array is untouched.",
  },
  {
    label: "The list is rebuilt",
    code: "results.map((n) => <li>{n}</li>)",
    detail: (query, results) =>
      `${results.length} list items are produced, and React updates only what actually changed on screen.`,
  },
];

export function FilteringWidget() {
  const [query, setQuery] = useState("");
  const [step, setStep] = useState<number | null>(null);

  const results = NAMES.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );

  const reset = () => {
    setQuery("");
    setStep(null);
  };

  return (
    <WidgetShell
      title="One keystroke, six things happen"
      status={`${results.length} of ${NAMES.length}`}
      onReset={reset}
      caption="Type, then walk the six steps. Every one of them runs again on the next keystroke."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          <label
            htmlFor="spark-filter-input"
            className="spark-eyebrow mb-2 block text-[var(--spark-faint)]"
          >
            Search names
          </label>
          <input
            id="spark-filter-input"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setStep(null);
            }}
            placeholder="Try a or li"
            className="w-full rounded-lg border px-3.5 py-2.5 text-[14px] text-[var(--spark-text)] outline-none transition-colors placeholder:text-[var(--spark-faint)] focus:border-[var(--spark-gold-deep)]"
            style={{ borderColor: "rgba(20,20,19,0.16)", background: "#fff" }}
          />

          <ul className="mt-3 flex list-none flex-col gap-1 pl-0">
            {NAMES.map((name) => {
              const hit = results.includes(name);
              return (
                <li
                  key={name}
                  className="spark-mono rounded px-2.5 py-1.5 text-[12.5px] transition-colors"
                  style={{
                    background: hit
                      ? "rgba(216,180,106,0.16)"
                      : "rgba(20,20,19,0.03)",
                    color: hit ? "var(--spark-text)" : "var(--spark-faint)",
                    textDecoration: hit ? "none" : "line-through",
                  }}
                >
                  {name}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="min-w-0">
          <span className="spark-eyebrow mb-2 block text-[var(--spark-faint)]">
            What just happened
          </span>

          {query === "" ? (
            <p className="rounded-lg bg-black/[0.03] px-3.5 py-3 text-[13px] leading-[1.65] text-[var(--spark-faint)]">
              Type something in the box to trace the cycle.
            </p>
          ) : (
            <ol className="flex list-none flex-col gap-1.5 pl-0">
              {STEPS.map((item, i) => {
                const open = step === i;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setStep(open ? null : i)}
                      aria-expanded={open}
                      className="w-full rounded-lg px-3 py-2 text-left transition-colors"
                      style={{
                        background: open
                          ? "rgba(216,180,106,0.14)"
                          : "transparent",
                        boxShadow: open
                          ? "inset 2px 0 0 var(--spark-gold-deep)"
                          : "inset 0 0 0 1px rgba(20,20,19,0.08)",
                      }}
                    >
                      <span className="flex items-baseline gap-2.5">
                        <span
                          className="spark-mono shrink-0 text-[10.5px] tabular-nums"
                          style={{
                            color: open
                              ? "var(--spark-gold-ink)"
                              : "var(--spark-faint)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 text-[13px] font-medium leading-[1.5] text-[var(--spark-text)]">
                          {item.label}
                        </span>
                      </span>

                      {open && (
                        <span className="spark-fade-up mt-2 block pl-[22px]">
                          <code className="spark-mono block overflow-x-auto rounded bg-[var(--spark-ink)] px-2.5 py-1.5 text-[11.5px] text-[var(--spark-on-dark)]">
                            {item.code}
                          </code>
                          <span className="mt-1.5 block text-[12.5px] leading-[1.6] text-[#44423e]">
                            {item.detail(query, results)}
                          </span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}
