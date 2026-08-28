"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyIsbn({ isbn }: { isbn: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(isbn);
      if (timer.current) clearTimeout(timer.current);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <button
      onClick={copy}
      aria-label={copied ? "ISBN copied" : `Copy ISBN ${isbn}`}
      title={copied ? "Copied" : "Copy ISBN"}
      className="group/isbn -ml-1.5 mt-1.5 inline-flex items-center gap-1.5 rounded-[0.4rem] px-1.5 py-1 font-mono text-xs tabular-nums text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
    >
      ISBN {isbn}
      {copied ? (
        <Check
          className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
          strokeWidth={2.5}
        />
      ) : (
        <Copy
          className="h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover/isbn:opacity-100"
          strokeWidth={2}
        />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "ISBN copied to clipboard" : ""}
      </span>
    </button>
  );
}
