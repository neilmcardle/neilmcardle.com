"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scrollContainer } from "@/lib/spark/scrollContainer";

interface Note {
  id: string;
  note: string;
  path: string;
  viewport: number;
  selector: string;
  descriptor: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = "spark_annotations";
const SKIP = new Set([
  "HTML",
  "BODY",
  "SCRIPT",
  "STYLE",
  "NEXT-ROUTE-ANNOUNCER",
]);

function meaningfulClasses(el: Element): string[] {
  const raw = typeof el.className === "string" ? el.className.split(/\s+/) : [];
  const spark = raw.filter((c) => c.startsWith("spark-"));
  if (spark.length > 0) return spark.slice(0, 2);
  return raw
    .filter((c) => c && !c.includes("[") && !c.includes(":"))
    .slice(0, 2);
}

function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const classes = meaningfulClasses(el);
  const label = classes.length > 0 ? `${tag}.${classes.join(".")}` : tag;
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  return text
    ? `${label} "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`
    : label;
}

function selectorFor(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;

  while (node && node.tagName !== "BODY") {
    if (node.id) {
      parts.unshift(`#${node.id}`);
      break;
    }

    const tag = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;

    if (!parent) {
      parts.unshift(tag);
      break;
    }

    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === node!.tagName,
    );

    parts.unshift(
      siblings.length > 1
        ? `${tag}:nth-of-type(${siblings.indexOf(node) + 1})`
        : tag,
    );
    node = parent;
  }

  return parts.join(" > ");
}

export function AnnotationLayer() {
  const [active, setActive] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [hover, setHover] = useState<DOMRect | null>(null);
  const [hoverLabel, setHoverLabel] = useState("");
  const [target, setTarget] = useState<{ el: Element; rect: DOMRect } | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [pins, setPins] = useState<
    Array<{ id: string; x: number; y: number; n: number }>
  >([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) setNotes(parsed as Note[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((next: Note[]) => {
    setNotes(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyA") {
        event.preventDefault();
        setActive((prev) => !prev);
        setTarget(null);
        return;
      }
      if (event.key === "Escape") {
        setTarget(null);
        setActive(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!active || target) {
      setHover(null);
      return;
    }

    const onMove = (event: MouseEvent) => {
      const el = document.elementFromPoint(event.clientX, event.clientY);
      if (!el || SKIP.has(el.tagName) || el.closest("[data-spark-annotator]")) {
        setHover(null);
        return;
      }
      setHover(el.getBoundingClientRect());
      setHoverLabel(describe(el));
    };

    const onClick = (event: MouseEvent) => {
      const el = document.elementFromPoint(event.clientX, event.clientY);
      if (!el || SKIP.has(el.tagName) || el.closest("[data-spark-annotator]"))
        return;
      event.preventDefault();
      event.stopPropagation();
      setTarget({ el, rect: el.getBoundingClientRect() });
      setDraft("");
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
    };
  }, [active, target]);

  useEffect(() => {
    if (target) inputRef.current?.focus();
  }, [target]);

  useEffect(() => {
    const here = notes.filter((n) => n.path === window.location.pathname);
    if (here.length === 0) {
      setPins([]);
      return;
    }

    let frame = 0;

    const place = () => {
      frame = 0;
      const next: Array<{ id: string; x: number; y: number; n: number }> = [];
      here.forEach((note, i) => {
        let el: Element | null = null;
        try {
          el = document.querySelector(note.selector);
        } catch {
          el = null;
        }
        if (!el) return;
        const rect = el.getBoundingClientRect();
        next.push({ id: note.id, x: rect.left, y: rect.top, n: i + 1 });
      });
      setPins(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(place);
    };

    place();
    const container = scrollContainer(
      document.body.firstElementChild as HTMLElement,
    );
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [notes]);

  const save = () => {
    if (!target || !draft.trim()) return;
    const note: Note = {
      id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      note: draft.trim(),
      path: window.location.pathname,
      viewport: window.innerWidth,
      selector: selectorFor(target.el),
      descriptor: describe(target.el),
      text: (target.el.textContent ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120),
      createdAt: new Date().toISOString(),
    };
    persist([...notes, note]);
    setTarget(null);
    setDraft("");
  };

  const asMarkdown = () => {
    const byPath = new Map<string, Note[]>();
    notes.forEach((note) => {
      byPath.set(note.path, [...(byPath.get(note.path) ?? []), note]);
    });

    const blocks: string[] = [`# Spark review notes (${notes.length})`, ""];
    byPath.forEach((items, path) => {
      blocks.push(`## ${path}`, "");
      items.forEach((note, i) => {
        blocks.push(
          `**${i + 1}. ${note.note}**`,
          "",
          `- Element: \`${note.descriptor}\``,
          `- Selector: \`${note.selector}\``,
          `- Viewport: ${note.viewport}px`,
          "",
        );
      });
    });
    return blocks.join("\n");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(asMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const here = notes.filter(
    (n) =>
      n.path ===
      (typeof window === "undefined" ? "" : window.location.pathname),
  );

  return (
    <div data-spark-annotator>
      {active && (
        <div
          className="pointer-events-none fixed inset-0 z-[9998]"
          style={{ cursor: "crosshair" }}
        />
      )}

      {active && hover && !target && (
        <>
          <div
            className="pointer-events-none fixed z-[9999] rounded-[3px]"
            style={{
              left: hover.left - 2,
              top: hover.top - 2,
              width: hover.width + 4,
              height: hover.height + 4,
              boxShadow: "0 0 0 2px #d8b46a, 0 0 0 6px rgba(216,180,106,0.22)",
            }}
          />
          <div
            className="pointer-events-none fixed z-[9999] max-w-[380px] truncate rounded-md bg-[#0a0a0a] px-2.5 py-1.5 text-[11px] text-white shadow-lg"
            style={{
              left: hover.left,
              top: hover.top > 34 ? hover.top - 30 : hover.bottom + 8,
              fontFamily: "var(--font-jetbrains-mono)",
            }}
          >
            {hoverLabel}
          </div>
        </>
      )}

      {pins.map((pin) => (
        <button
          key={pin.id}
          onClick={() => {
            const note = notes.find((n) => n.id === pin.id);
            if (note && window.confirm(`Delete note?\n\n"${note.note}"`)) {
              persist(notes.filter((n) => n.id !== pin.id));
            }
          }}
          className="fixed z-[9997] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#d8b46a] text-[11px] font-bold text-[#0a0a0a] shadow-md"
          style={{ left: pin.x - 11, top: pin.y - 11 }}
          title="Click to delete this note"
        >
          {pin.n}
        </button>
      ))}

      {target && (
        <div
          className="fixed z-[10000] w-[320px] rounded-xl bg-[#0a0a0a] p-3 shadow-2xl"
          style={{
            left: Math.min(target.rect.left, window.innerWidth - 340),
            top: Math.min(target.rect.bottom + 10, window.innerHeight - 190),
            boxShadow:
              "0 0 0 1px rgba(216,180,106,0.35), 0 20px 40px -12px rgba(0,0,0,0.7)",
          }}
        >
          <p
            className="mb-2 truncate text-[10.5px] text-[#d8b46a]"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {describe(target.el)}
          </p>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") setTarget(null);
            }}
            rows={3}
            placeholder="What should change here?"
            className="w-full resize-none rounded-lg bg-white/[0.07] px-2.5 py-2 text-[13px] text-white outline-none placeholder:text-white/35"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-white/40">
              Enter to save, Esc to cancel
            </span>
            <button
              onClick={save}
              disabled={!draft.trim()}
              className="rounded-full bg-[#d8b46a] px-3 py-1 text-[11px] font-semibold text-[#0a0a0a] disabled:opacity-30"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-4 z-[9996] flex items-center gap-1.5">
        <button
          onClick={() => {
            setActive((p) => !p);
            setTarget(null);
          }}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-medium shadow-lg transition-colors"
          style={{
            background: active ? "#d8b46a" : "rgba(10,10,10,0.92)",
            color: active ? "#0a0a0a" : "rgba(255,255,255,0.75)",
          }}
          title="Toggle annotate mode (Alt+A)"
        >
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: active ? "#0a0a0a" : "#d8b46a" }}
          />
          {active
            ? "Click an element"
            : `Notes${notes.length ? ` (${notes.length})` : ""}`}
        </button>

        {notes.length > 0 && (
          <>
            <button
              onClick={copy}
              className="rounded-full bg-[rgba(10,10,10,0.92)] px-3 py-2 text-[11px] font-medium text-white/75 shadow-lg"
            >
              {copied ? "Copied" : `Copy ${notes.length}`}
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Clear all ${notes.length} notes?`))
                  persist([]);
              }}
              className="rounded-full bg-[rgba(10,10,10,0.92)] px-3 py-2 text-[11px] font-medium text-white/45 shadow-lg"
            >
              Clear
            </button>
          </>
        )}

        {here.length > 0 && !active && (
          <span className="rounded-full bg-[rgba(10,10,10,0.92)] px-2.5 py-2 text-[10px] text-white/45 shadow-lg">
            {here.length} here
          </span>
        )}
      </div>
    </div>
  );
}
