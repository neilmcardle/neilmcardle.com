"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function PaletteStrip({ colors }: { colors: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(key);
      timer.current = setTimeout(() => setCopied(null), 1600);
    } catch {}
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-3">
        <p className="text-xs text-muted-foreground">Palette</p>
        <button
          onClick={() => copy(colors.join(", "), "__all")}
          className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {copied === "__all" ? "All copied" : "Copy all"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {colors.map((hex) => {
          const isCopied = copied === hex;
          return (
            <button
              key={hex}
              onClick={() => copy(hex, hex)}
              aria-label={isCopied ? `${hex} copied` : `Copy ${hex}`}
              title={isCopied ? "Copied" : `Copy ${hex}`}
              className="group/sw w-[4.5rem] rounded-lg p-1 text-center transition-colors hover:bg-muted"
            >
              <span
                className="relative flex h-12 w-full items-center justify-center rounded-md border border-black/10 ring-offset-2 ring-offset-background transition-shadow group-hover/sw:ring-2 group-hover/sw:ring-foreground/20"
                style={{ backgroundColor: hex }}
              >
                {isCopied ? (
                  <Check
                    className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                    strokeWidth={3}
                  />
                ) : (
                  <Copy
                    className="h-3.5 w-3.5 text-white opacity-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] transition-opacity group-hover/sw:opacity-90"
                    strokeWidth={2.5}
                  />
                )}
              </span>
              <span className="mt-1 block font-mono text-[10px] tabular-nums text-muted-foreground group-hover/sw:text-foreground">
                {isCopied ? "Copied" : hex}
              </span>
            </button>
          );
        })}
      </div>
      <span aria-live="polite" className="sr-only">
        {copied === "__all"
          ? "All hex codes copied"
          : copied
            ? `${copied} copied`
            : ""}
      </span>
    </div>
  );
}
