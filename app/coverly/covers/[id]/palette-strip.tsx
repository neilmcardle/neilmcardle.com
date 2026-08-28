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
      <div className="mb-2">
        <button
          onClick={() => copy(colors.join(", "), "__all")}
          className="-ml-1.5 inline-flex items-center gap-1.5 rounded-[0.4rem] px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied === "__all" ? (
            <Check
              className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2.5}
            />
          ) : (
            <Copy className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          )}
          {copied === "__all" ? "Palette copied" : "Copy palette"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {colors.map((hex) => {
          const isCopied = copied === hex;
          return (
            <button
              key={hex}
              onClick={() => copy(hex, hex)}
              aria-label={isCopied ? `${hex} copied` : `Copy ${hex}`}
              title={isCopied ? "Copied" : `Copy ${hex}`}
              className="group/sw text-center"
            >
              <span
                className="relative flex h-11 w-11 items-center justify-center rounded-md border border-black/10 outline outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-200 group-hover/sw:outline-foreground/25"
                style={{ backgroundColor: hex }}
              >
                {isCopied ? (
                  <Check
                    className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    strokeWidth={3}
                  />
                ) : (
                  <Copy
                    className="h-3.5 w-3.5 text-white opacity-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-opacity group-hover/sw:opacity-90"
                    strokeWidth={2.5}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
      <span aria-live="polite" className="sr-only">
        {copied === "__all"
          ? "Palette copied"
          : copied
            ? `${copied} copied`
            : ""}
      </span>
    </div>
  );
}
