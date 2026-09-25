"use client";

import React, { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

interface WidgetShellProps {
  title: string;
  children: React.ReactNode;
  caption?: string;
  status?: React.ReactNode;
  onReset?: () => void;
}

export function WidgetShell({
  title,
  children,
  caption,
  status,
  onReset,
}: WidgetShellProps) {
  return (
    <section className="spark-widget my-8">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="spark-eyebrow shrink-0 text-[var(--spark-phosphor)]">
          Try it
        </span>
        <span aria-hidden className="h-px flex-1 bg-[var(--spark-rule)]" />
        {status && (
          <span className="spark-mono shrink-0 text-[11px] tabular-nums text-[var(--spark-faint)]">
            {status}
          </span>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium text-[var(--spark-faint)] transition-colors hover:bg-[var(--spark-pad)] hover:text-[var(--spark-text)]"
          >
            Reset
          </button>
        )}
      </div>

      <div className="spark-grid rounded-xl border border-[var(--spark-rule)] p-2 sm:p-4">
        <div className="overflow-hidden rounded-lg border border-[var(--spark-rule)] bg-[var(--spark-sheet)] shadow-[0_24px_48px_-30px_rgba(0,0,0,0.75)]">
          <h4 className="spark-display border-b border-[var(--spark-rule)] px-5 py-3.5 text-[17px] leading-tight text-[var(--spark-text)]">
            {title}
          </h4>
          <div className="p-5">{children}</div>
        </div>
      </div>

      {caption && (
        <p className="mt-2.5 text-[12.5px] leading-[1.6] text-[var(--spark-faint)]">
          {caption}
        </p>
      )}
    </section>
  );
}
