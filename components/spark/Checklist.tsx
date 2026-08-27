"use client";

import React, { useCallback, useEffect, useState } from "react";

export interface ChecklistItem {
  text: string;
  content: React.ReactNode;
}

interface ChecklistProps {
  moduleNumber: number;
  items: ChecklistItem[];
}

function itemKey(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

type Ticks = Record<string, boolean>;

function read(storageKey: string): Ticks {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    return parsed as Ticks;
  } catch {
    return {};
  }
}

export function Checklist({ moduleNumber, items }: ChecklistProps) {
  const storageKey = `spark_checklist_m${moduleNumber}`;
  const [ticks, setTicks] = useState<Ticks>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTicks(read(storageKey));
    setHydrated(true);
  }, [storageKey]);

  const toggle = useCallback(
    (key: string) => {
      const next = read(storageKey);
      if (next[key]) delete next[key];
      else next[key] = true;

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Private browsing or a full quota. The tick still applies for this
        // session, and there is nothing useful to tell the reader.
      }
      setTicks(next);
    },
    [storageKey],
  );

  const keys = items.map((item) => itemKey(item.text));
  const done = hydrated ? keys.filter((key) => ticks[key]).length : 0;
  const complete = hydrated && done === items.length && items.length > 0;

  return (
    <div className="my-7">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="spark-eyebrow text-[var(--spark-gold-ink)]">
          + Checklist
        </span>
        <span aria-hidden className="h-px flex-1 bg-black/[0.1]" />
        <span
          className={`spark-mono shrink-0 text-[11px] tabular-nums ${
            complete
              ? "text-[var(--spark-gold-ink)]"
              : "text-[var(--spark-faint)]"
          }`}
        >
          {done} / {items.length}
        </span>
      </div>

      <ul
        className={`spark-card flex list-none flex-col rounded-xl p-1.5 pl-1.5 ${
          complete ? "spark-card-gold" : ""
        }`}
      >
        {items.map((item, i) => {
          const key = keys[i];
          const checked = Boolean(ticks[key]);

          return (
            <li key={key + i}>
              <label
                className={`group grid cursor-pointer grid-cols-[18px_minmax(0,1fr)] items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-black/[0.025] ${
                  checked ? "text-[var(--spark-faint)]" : "text-[#44423e]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--spark-gold-deep)]"
                  style={
                    checked
                      ? {
                          background: "var(--spark-gold-deep)",
                          borderColor: "var(--spark-gold-deep)",
                        }
                      : { borderColor: "rgba(20,20,19,0.22)" }
                  }
                >
                  {checked && (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className="text-[15.5px] leading-[1.65]">
                  {item.content}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
