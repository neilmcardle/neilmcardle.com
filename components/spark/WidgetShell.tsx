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
        <span className="spark-eyebrow shrink-0 text-[var(--spark-gold-ink)]">
          + Try it
        </span>
        <span aria-hidden className="h-px flex-1 bg-black/[0.1]" />
        {status && (
          <span className="spark-mono shrink-0 text-[11px] tabular-nums text-[var(--spark-faint)]">
            {status}
          </span>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium text-[var(--spark-faint)] transition-colors hover:bg-black/[0.05] hover:text-[var(--spark-text)]"
          >
            Reset
          </button>
        )}
      </div>

      <div className="spark-card overflow-hidden rounded-xl bg-[var(--spark-paper)]">
        <h4 className="border-b border-black/[0.07] px-5 py-3.5 font-serif text-[17px] font-bold leading-tight tracking-[-0.015em] text-[var(--spark-text)]">
          {title}
        </h4>
        <div className="p-5">{children}</div>
      </div>

      {caption && (
        <p className="mt-2.5 text-[12.5px] leading-[1.6] text-[var(--spark-faint)]">
          {caption}
        </p>
      )}
    </section>
  );
}
