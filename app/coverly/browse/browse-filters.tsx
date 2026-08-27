"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  ART_STYLES,
  LAYOUTS,
  PEOPLE,
  SUB_GENRES,
  TYPOGRAPHY,
} from "@/lib/coverly/tags";
import { COLOR_FAMILIES, FAMILY_SWATCH } from "@/lib/coverly/color";
import {
  PUBLISHER_TIERS,
  PUBLISHER_TIER_LABELS,
} from "@/lib/coverly/publisher-tier";

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
  {
    key: "publisher_tier",
    label: "Publisher",
    kind: "chips",
    options: PUBLISHER_TIERS,
  },
  { key: "color", label: "Colour", kind: "color", options: COLOR_OPTIONS },
  { key: "tone", label: "Tone", kind: "tone", options: ["light", "dark"] },
];

const cap = (s: string) =>
  PUBLISHER_TIER_LABELS[s as keyof typeof PUBLISHER_TIER_LABELS] ??
  s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function BrowseFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [query, setQuery] = useState(sp.get("q") ?? "");
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

  const commit = (params: URLSearchParams, source?: string) => {
    const qs = params.toString();
    setPendingKey(source ?? null);
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
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
    commit(params, cat.key);
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

  const clearCat = (cat: Cat) => {
    const params = new URLSearchParams(sp.toString());
    params.delete(cat.key);
    commit(params, cat.key);
    setOpenKey(null);
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

  const toggleMobile = () => {
    setOpenKey(null);
    setMobileOpen((o) => !o);
  };

  return (
    <div ref={barRef}>
      <button
        onClick={toggleMobile}
        aria-expanded={mobileOpen}
        aria-controls="coverly-filter-row"
        className={`flex items-center gap-1.5 rounded-[0.625rem] border px-3 py-1.5 text-sm transition-colors sm:hidden ${
          activeChips.length ? "border-foreground/30 bg-muted/60" : "bg-card"
        }`}
      >
        <SlidersHorizontal
          className="h-3.5 w-3.5 opacity-70"
          strokeWidth={2.5}
        />
        Filters
        {activeChips.length > 0 && (
          <span className="rounded-md bg-foreground px-1.5 text-[11px] font-medium text-background">
            {activeChips.length}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-50 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      <div
        id="coverly-filter-row"
        className={`${mobileOpen ? "mt-2 flex" : "hidden"} flex-wrap items-center gap-2 sm:mt-0 sm:flex`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams(sp.toString());
            if (query.trim()) params.set("q", query.trim());
            else params.delete("q");
            commit(params, "q");
          }}
          className="relative flex h-[34px] items-center"
        >
          {pending && pendingKey === "q" ? (
            <Loader2 className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors"
            aria-label="Search covers"
            className="h-[34px] w-44 rounded-[0.625rem] border bg-card pl-8 pr-7 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-foreground/40"
          />
          <button type="submit" className="sr-only">
            Search
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                const params = new URLSearchParams(sp.toString());
                params.delete("q");
                commit(params, "q");
              }}
              aria-label="Clear search"
              className="absolute right-1.5 flex h-5 w-5 items-center justify-center rounded-[0.35rem] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          )}
        </form>
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
                aria-haspopup="true"
                className={`flex h-[34px] max-w-[15rem] items-center gap-1.5 rounded-[0.625rem] border px-3 text-sm transition-colors ${
                  selected.length
                    ? "border-foreground bg-foreground text-background"
                    : "bg-card hover:border-foreground/30"
                }`}
              >
                <span className={selected.length ? "opacity-70" : ""}>
                  {cat.label}
                </span>
                {selected.length > 0 && (
                  <span className="truncate font-medium">
                    {cap(selected[0])}
                    {selected.length > 1 ? ` +${selected.length - 1}` : ""}
                  </span>
                )}
                {pending && pendingKey === cat.key ? (
                  <Loader2
                    className="h-3.5 w-3.5 shrink-0 animate-spin opacity-70"
                    strokeWidth={2.5}
                  />
                ) : (
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 ${selected.length ? "opacity-60" : "opacity-50"}`}
                    strokeWidth={2.5}
                  />
                )}
              </button>

              {isOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-52 rounded-[0.875rem] border bg-card p-1.5 shadow-xl"
                >
                  <div className="flex items-center justify-between gap-2 px-2 pb-1.5 pt-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {cat.label}
                    </span>
                    {selected.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearCat(cat);
                        }}
                        className="text-xs text-muted-foreground underline hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div
                    className={
                      cat.kind === "color"
                        ? "flex flex-wrap gap-1.5 px-1 pb-1"
                        : "flex flex-col"
                    }
                  >
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
                          role="menuitemcheckbox"
                          aria-checked={on}
                          className="flex w-full items-center gap-2 rounded-[0.5rem] px-2 py-1.5 text-left text-sm hover:bg-muted"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[0.25rem] border ${
                              on
                                ? "border-foreground bg-foreground text-background"
                                : "border-border"
                            }`}
                          >
                            {on && (
                              <Check className="h-3 w-3" strokeWidth={3} />
                            )}
                          </span>
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
