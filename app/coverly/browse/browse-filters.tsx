"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import {
  ART_STYLES,
  LAYOUTS,
  PEOPLE,
  SUB_GENRES,
  TYPOGRAPHY,
} from "@/lib/coverly/tags";
import { COLOR_FAMILIES, FAMILY_SWATCH } from "@/lib/coverly/color";

const COLOR_OPTIONS = COLOR_FAMILIES.filter((f) => f !== "neutral");

type Cat =
  | { key: string; label: string; kind: "chips"; options: readonly string[] }
  | { key: "color"; label: string; kind: "color"; options: readonly string[] }
  | { key: "tone"; label: string; kind: "tone"; options: readonly string[] };

const CATS: Cat[] = [
  {
    key: "sub_genre",
    label: "Sub-genre",
    kind: "chips",
    options: SUB_GENRES.thriller,
  },
  { key: "art_style", label: "Art style", kind: "chips", options: ART_STYLES },
  {
    key: "typography",
    label: "Typography",
    kind: "chips",
    options: TYPOGRAPHY,
  },
  { key: "people", label: "People", kind: "chips", options: PEOPLE },
  { key: "layout", label: "Layout", kind: "chips", options: LAYOUTS },
  { key: "color", label: "Colour", kind: "color", options: COLOR_OPTIONS },
  { key: "tone", label: "Tone", kind: "tone", options: ["light", "dark"] },
];

const cap = (s: string) =>
  s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function BrowseFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node))
        setOpenKey(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const valuesOf = (key: string) =>
    sp.get(key)?.split(",").filter(Boolean) ?? [];

  const commit = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggle = (cat: Cat, opt: string) => {
    const params = new URLSearchParams(sp.toString());
    if (cat.kind === "tone") {
      if (params.get("tone") === opt) params.delete("tone");
      else params.set("tone", opt);
    } else {
      const next = new Set(valuesOf(cat.key));
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      if (next.size) params.set(cat.key, [...next].join(","));
      else params.delete(cat.key);
    }
    commit(params);
  };

  const removeOne = (key: string, opt: string) => {
    const params = new URLSearchParams(sp.toString());
    if (key === "tone") params.delete("tone");
    else {
      const next = valuesOf(key).filter((v) => v !== opt);
      if (next.length) params.set(key, next.join(","));
      else params.delete(key);
    }
    commit(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(sp.toString());
    for (const cat of CATS) params.delete(cat.key);
    commit(params);
  };

  const selectedFor = (cat: Cat) =>
    cat.kind === "tone" ? valuesOf("tone") : valuesOf(cat.key);
  const activeChips = CATS.flatMap((cat) =>
    selectedFor(cat).map((opt) => ({ key: cat.key, label: cat.label, opt })),
  );

  return (
    <div ref={barRef}>
      <div className="flex flex-wrap items-center gap-2">
        {CATS.map((cat) => {
          const selected = selectedFor(cat);
          const isOpen = openKey === cat.key;
          return (
            <div key={cat.key} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenKey(isOpen ? null : cat.key);
                }}
                aria-expanded={isOpen}
                className={`flex items-center gap-1.5 rounded-[0.625rem] border px-3 py-1.5 text-sm transition-colors ${
                  selected.length
                    ? "border-foreground/30 bg-muted/60"
                    : "bg-card hover:border-foreground/30"
                }`}
              >
                {cat.label}
                {selected.length > 0 && (
                  <span className="rounded-md bg-foreground px-1.5 text-[11px] font-medium text-background">
                    {selected.length}
                  </span>
                )}
                <ChevronDown
                  className="h-3.5 w-3.5 opacity-50"
                  strokeWidth={2.5}
                />
              </button>

              {isOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-44 rounded-[1rem] border bg-card p-2.5 shadow-xl">
                  <div className="flex flex-wrap gap-1.5">
                    {cat.options.map((opt) => {
                      const on = selected.includes(opt);
                      if (cat.kind === "color") {
                        return (
                          <button
                            key={opt}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(cat, opt);
                            }}
                            aria-pressed={on}
                            title={on ? `Remove ${cap(opt)}` : cap(opt)}
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                              on ? "border-foreground" : "border-transparent"
                            }`}
                            style={{
                              backgroundColor:
                                FAMILY_SWATCH[
                                  opt as keyof typeof FAMILY_SWATCH
                                ],
                            }}
                          >
                            {on && (
                              <X
                                className="h-3.5 w-3.5 text-white [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.55))]"
                                strokeWidth={3}
                              />
                            )}
                            <span className="sr-only">{opt}</span>
                          </button>
                        );
                      }
                      return (
                        <button
                          key={opt}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(cat, opt);
                          }}
                          aria-pressed={on}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            on
                              ? "border-foreground bg-foreground text-background"
                              : "text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                          }`}
                        >
                          {cap(opt)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {activeChips.map(({ key, label, opt }) => (
          <span
            key={`${key}:${opt}`}
            className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 py-1 pl-3 pr-1.5 text-xs"
          >
            <span className="text-muted-foreground">{label}:</span> {cap(opt)}
            <button
              onClick={() => removeOne(key, opt)}
              aria-label={`Remove ${label} ${opt}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              ×
            </button>
          </span>
        ))}
        {activeChips.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear all
          </button>
        )}
        <span className="text-xs text-muted-foreground">{total} covers</span>
      </div>
    </div>
  );
}
