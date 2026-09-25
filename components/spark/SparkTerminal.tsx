"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { TerminalModule } from "@/lib/spark/content";
import { SparkMark } from "./SparkMark";
import styles from "./terminal.module.css";

type Tone = "dim" | "amber";
type Line = { text: string; tone?: Tone };

type Progress = { furthest: number; complete: boolean };

const BOOT: Line[] = [
  { text: "SPARK TERMINAL MODEL 1.0", tone: "amber" },
  { text: "type help for commands", tone: "dim" },
];

const HELP: Line[] = [
  { text: "where       what you are reading now" },
  { text: "resume      pick up where you left off" },
  { text: "next        the module after this one" },
  { text: "open <n>    open module n, 1 to 19" },
  { text: "toc         sections in this module" },
  { text: "go <n>      jump to section n" },
  { text: "find <word> search every module" },
  { text: "ls          the phases" },
  { text: "progress    how far you have read" },
  { text: "done        mark this module read" },
  { text: "dock        put the terminal back in the corner" },
  { text: "clear       wipe the screen" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function readProgress(module: number): Progress {
  try {
    const furthest = parseInt(
      window.localStorage.getItem(`spark_progress_m${module}`) ?? "0",
      10,
    );
    return {
      furthest: Number.isNaN(furthest) ? 0 : furthest,
      complete:
        window.localStorage.getItem(`spark_module_${module}_complete`) ===
        "true",
    };
  } catch {
    return { furthest: 0, complete: false };
  }
}

export function SparkTerminal({
  index,
  variant = "dock",
}: {
  index: TerminalModule[];
  variant?: "dock" | "cabinet";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [feed, setFeed] = useState<Line[]>([]);
  const [typing, setTyping] = useState<{ line: number; shown: number } | null>(
    null,
  );
  const [entry, setEntry] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [recall, setRecall] = useState<number | null>(null);
  const [open, setOpen] = useState(variant === "cabinet");
  const [stowed, setStowed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [dockReady, setDockReady] = useState(variant === "dock");
  const [bootDone, setBootDone] = useState(false);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const grab = useRef<{ dx: number; dy: number } | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const here = useMemo(() => {
    const match = pathname?.match(/\/spark\/lessons\/([a-z0-9-]+)/);
    return match ? (index.find((m) => m.slug === match[1]) ?? null) : null;
  }, [pathname, index]);

  useEffect(() => {
    if (!open || bootDone || typing) return;
    const start = window.setTimeout(
      () => setTyping({ line: 0, shown: 0 }),
      variant === "cabinet" ? 320 : 120,
    );
    return () => window.clearTimeout(start);
  }, [open, bootDone, typing, variant]);

  useEffect(() => {
    if (!typing) return;
    const current = BOOT[typing.line];
    if (!current) return;

    if (typing.shown < current.text.length) {
      const tick = window.setTimeout(
        () => setTyping({ line: typing.line, shown: typing.shown + 1 }),
        18,
      );
      return () => window.clearTimeout(tick);
    }

    const next = window.setTimeout(() => {
      setFeed((f) => [...f, current]);
      if (typing.line + 1 < BOOT.length) {
        setTyping({ line: typing.line + 1, shown: 0 });
      } else {
        setTyping(null);
        setBootDone(true);
      }
    }, 200);
    return () => window.clearTimeout(next);
  }, [typing]);

  useEffect(() => {
    const node = feedRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [feed, typing]);

  useEffect(() => {
    if (variant !== "dock") return;
    if (!document.querySelector("[data-spark-cabinet]")) return;
    setDockReady(false);
    const onStow = (event: Event) => {
      const detail = (
        event as CustomEvent<{ x?: number; y?: number; open?: boolean }>
      ).detail;
      setDockReady(true);
      if (detail?.open) {
        if (typeof detail.x === "number" && typeof detail.y === "number")
          setSpot({ x: detail.x, y: detail.y });
        setOpen(true);
      }
    };
    window.addEventListener("spark-terminal-stow", onStow);
    return () => window.removeEventListener("spark-terminal-stow", onStow);
  }, [variant, pathname]);

  useEffect(() => {
    if (variant !== "dock" || !dockReady) return;
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      const typingHere =
        el &&
        (el.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

      if (event.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      if (event.key === "`" && !typingHere) {
        event.preventDefault();
        setOpen((was) => !was);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, variant, dockReady]);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  useEffect(() => {
    if (variant !== "dock") return;
    try {
      const saved = window.localStorage.getItem("spark_terminal_spot");
      if (saved) setSpot(JSON.parse(saved) as { x: number; y: number });
    } catch {
      setSpot(null);
    }
  }, [variant]);

  const settle = useCallback((x: number, y: number) => {
    const box = shell.current?.getBoundingClientRect();
    const width = box?.width ?? 400;
    const height = box?.height ?? 360;
    const next = {
      x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - width - 8)),
      y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - height - 8)),
    };
    setSpot(next);
    return next;
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      if (!grab.current) return;
      settle(event.clientX - grab.current.dx, event.clientY - grab.current.dy);
    };
    const onUp = () => {
      setDragging(false);
      grab.current = null;
      setSpot((current) => {
        try {
          if (current)
            window.localStorage.setItem(
              "spark_terminal_spot",
              JSON.stringify(current),
            );
        } catch {
          return current;
        }
        return current;
      });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, settle]);

  useEffect(() => {
    if (!spot) return;
    const onResize = () => settle(spot.x, spot.y);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [spot, settle]);

  function toCorner() {
    setSpot(null);
    try {
      window.localStorage.removeItem("spark_terminal_spot");
    } catch {
      return;
    }
  }

  function onGrab(event: React.PointerEvent<HTMLDivElement>) {
    if (
      (event.target as HTMLElement).closest(
        "button, input, [data-terminal-screen]",
      )
    )
      return;
    const box = shell.current?.getBoundingClientRect();
    if (!box) return;

    if (variant === "cabinet") {
      setStowed(true);
      window.dispatchEvent(
        new CustomEvent("spark-terminal-stow", {
          detail: { x: box.left, y: box.top, open: true },
        }),
      );
      return;
    }

    grab.current = {
      dx: event.clientX - box.left,
      dy: event.clientY - box.top,
    };
    settle(box.left, box.top);
    setDragging(true);
  }

  const goto = useCallback(
    (slug: string) => {
      window.setTimeout(() => router.push(`/spark/lessons/${slug}`), 520);
    },
    [router],
  );

  function answer(raw: string): Line[] {
    const input = raw.trim();
    const [verb, ...rest] = input.toLowerCase().split(/\s+/);
    const arg = rest.join(" ");
    if (!verb) return [];

    const states = index.map((m) => ({
      module: m,
      state: readProgress(m.module),
    }));
    const done = states.filter((s) => s.state.complete);

    const openModule = (module: TerminalModule): Line[] => {
      goto(module.slug);
      return [
        { text: `opening ${pad(module.module)} ${module.title}` },
        { text: "loading...", tone: "dim" },
      ];
    };

    if (verb === "help" || verb === "?") return HELP;
    if (verb === "clear") return [];

    if (verb === "where" || verb === "pwd") {
      if (!here)
        return [
          {
            text:
              pathname === "/spark/lessons"
                ? "the curriculum"
                : "the front page",
          },
          { text: "type resume to get back to reading", tone: "dim" },
        ];
      const state = readProgress(here.module);
      return [
        { text: `${pad(here.module)} ${here.title}` },
        {
          text: `phase ${here.phaseIndex} ${here.phase} · section ${Math.min(
            state.furthest + 1,
            here.sections.length,
          )} of ${here.sections.length}`,
          tone: "dim",
        },
      ];
    }

    if (verb === "toc" || verb === "sections") {
      if (!here)
        return [{ text: "open a module first. try open 1", tone: "amber" }];
      const state = readProgress(here.module);
      return here.sections.map((section, i) => ({
        text: `${pad(i + 1)} ${section.title}`,
        tone: i <= state.furthest ? undefined : "dim",
      }));
    }

    if (verb === "go" || verb === "jump") {
      if (!here)
        return [{ text: "open a module first. try open 1", tone: "amber" }];
      const n = parseInt(arg, 10);
      const section = here.sections[n - 1];
      if (!section)
        return [
          {
            text: `no section ${arg || "?"}. this module has ${here.sections.length}`,
            tone: "amber",
          },
        ];
      window.setTimeout(() => {
        const node = document.getElementById(section.id);
        node?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 260);
      return [{ text: `jumping to ${pad(n)} ${section.title}` }];
    }

    if (verb === "ls" || verb === "curriculum" || verb === "phases") {
      const phases = Array.from(new Set(index.map((m) => m.phase)));
      return phases.map((phase) => {
        const group = index.filter((m) => m.phase === phase);
        const read = group.filter(
          (m) => readProgress(m.module).complete,
        ).length;
        return {
          text: `${pad(group[0].module)}-${pad(
            group[group.length - 1].module,
          )}  ${phase}  ${read}/${group.length}`,
        };
      });
    }

    if (verb === "progress" || verb === "status") {
      const left = states
        .filter((s) => !s.state.complete)
        .reduce((total, s) => total + s.module.minutes, 0);
      return [
        {
          text: `${done.length} of ${index.length} modules read · ${Math.round(
            (done.length / index.length) * 100,
          )}%`,
        },
        {
          text: `about ${Math.round(left / 60)}h of reading left`,
          tone: "dim",
        },
      ];
    }

    if (verb === "resume" || verb === "continue") {
      const inFlight = states.find(
        (s) => !s.state.complete && s.state.furthest > 0,
      );
      const target = (inFlight ?? states.find((s) => !s.state.complete))
        ?.module;
      if (!target)
        return [{ text: "every module is read. that is the whole course." }];
      return openModule(target);
    }

    if (verb === "next") {
      const after = here
        ? index.find((m) => m.module === here.module + 1)
        : states.find((s) => !s.state.complete)?.module;
      if (!after)
        return [{ text: "that was the last one. the capstone is yours." }];
      return openModule(after);
    }

    if (verb === "start" || verb === "open" || verb === "cd") {
      const n = verb === "start" && !arg ? 1 : parseInt(arg, 10);
      const found = index.find((m) => m.module === n);
      if (!found)
        return [
          {
            text: `no module ${arg || "?"}. try open 1 to open ${index.length}`,
            tone: "amber",
          },
        ];
      return openModule(found);
    }

    if (verb === "find" || verb === "search" || verb === "grep") {
      if (!arg) return [{ text: "find what? try find state", tone: "amber" }];
      const hits = index.filter(
        (m) =>
          `${m.title} ${m.promise}`.toLowerCase().includes(arg) ||
          m.sections.some((s) => s.title.toLowerCase().includes(arg)),
      );
      if (hits.length === 0)
        return [{ text: `nothing matches ${arg}`, tone: "amber" }];
      return hits
        .slice(0, 6)
        .map((m) => ({ text: `${pad(m.module)} ${m.title}` }));
    }

    if (verb === "done" || verb === "read") {
      if (!here)
        return [{ text: "open a module first. try open 1", tone: "amber" }];
      try {
        window.localStorage.setItem(
          `spark_module_${here.module}_complete`,
          "true",
        );
        window.localStorage.setItem(
          `spark_progress_m${here.module}`,
          String(here.sections.length - 1),
        );
      } catch {
        return [
          { text: "this browser will not let me save that", tone: "amber" },
        ];
      }
      return [
        { text: `${pad(here.module)} marked as read` },
        { text: "type next for the one after it", tone: "dim" },
      ];
    }

    if (verb === "dock" || verb === "corner") {
      toCorner();
      return [{ text: "back in the corner" }];
    }

    if (verb === "random" || verb === "surprise") {
      return openModule(index[Math.floor(Math.random() * index.length)]);
    }

    if (verb === "whoami")
      return [
        { text: "a designer who is about to write software." },
        { text: "that is the whole idea.", tone: "dim" },
      ];

    if (verb === "about")
      return [
        { text: "spark. a course for designers who want to build." },
        { text: "written by one designer, in the open.", tone: "dim" },
      ];

    if (verb === "sudo")
      return [{ text: "no need. it is all yours already.", tone: "amber" }];

    return [
      { text: `command not found: ${verb}`, tone: "amber" },
      { text: "type help for commands", tone: "dim" },
    ];
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const raw = entry;
    setEntry("");
    setRecall(null);
    if (raw.trim()) setHistory((h) => [...h, raw.trim()].slice(-20));
    if (raw.trim().toLowerCase() === "clear") {
      setFeed([]);
      return;
    }
    setFeed((f) =>
      [...f, { text: `spark:~$ ${raw}` }, ...answer(raw)].slice(-60),
    );
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    if (history.length === 0) return;
    event.preventDefault();
    const at =
      recall === null
        ? history.length - 1
        : Math.min(
            history.length - 1,
            Math.max(0, recall + (event.key === "ArrowUp" ? -1 : 1)),
          );
    setRecall(at);
    setEntry(history[at]);
  }

  const screen = (
    <div
      className={styles.screen}
      data-terminal-screen="true"
      onClick={() => field.current?.focus()}
      role="presentation"
    >
      <div className={styles.feed} ref={feedRef}>
        {feed.map((line, i) => (
          <div
            key={i}
            className={
              line.tone === "dim"
                ? styles.dim
                : line.tone === "amber"
                  ? styles.amber
                  : undefined
            }
          >
            {line.text}
          </div>
        ))}
        {typing && (
          <div
            className={
              BOOT[typing.line].tone === "amber" ? styles.amber : styles.dim
            }
          >
            {BOOT[typing.line].text.slice(0, typing.shown)}
            <span className={styles.caret} aria-hidden="true" />
          </div>
        )}
        <form
          className={`${styles.inputRow} ${typing ? styles.hidden : ""}`}
          onSubmit={submit}
        >
          <span className={styles.prompt}>spark:~$</span>
          <span>{entry}</span>
          <span className={styles.caret} aria-hidden="true" />
          <label
            className={styles.srOnly}
            htmlFor={`spark-terminal-${variant}`}
          >
            Spark terminal, type a command
          </label>
          <input
            id={`spark-terminal-${variant}`}
            ref={field}
            className={styles.field}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );

  function stow() {
    if (variant === "cabinet") {
      setStowed(true);
      window.dispatchEvent(new CustomEvent("spark-terminal-stow"));
      return;
    }
    setOpen(false);
  }

  const lights = (
    <div className={styles.lights}>
      <button
        type="button"
        className={`${styles.light} ${styles.close}`}
        onClick={stow}
        aria-label="Put the terminal away"
      >
        <svg className={styles.glyph} viewBox="0 0 12 12" aria-hidden="true">
          <path d="M4 4l4 4M8 4l-4 4" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.light} ${styles.minimise}`}
        onClick={stow}
        aria-label="Minimise the terminal"
      >
        <svg className={styles.glyph} viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3.6 6h4.8" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.light} ${styles.zoom}`}
        onClick={() => setZoomed((was) => !was)}
        aria-label={zoomed ? "Shrink the terminal" : "Grow the terminal"}
      >
        <svg
          className={`${styles.glyph} ${styles.glyphFill}`}
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path d="M3.2 3.2h4.1L3.2 7.3zM8.8 8.8H4.7l4.1-4.1z" />
        </svg>
      </button>
    </div>
  );

  const chin = (
    <div className={styles.chin}>
      <span className={styles.badge}>
        <SparkMark className={styles.mark} />
        spark
      </span>
      <span className={styles.model}>
        terminal model 1.0
        <span className={styles.led} aria-hidden="true" />
      </span>
    </div>
  );

  if (variant === "cabinet") {
    if (stowed) return null;
    return (
      <div
        ref={shell}
        className={`${styles.cabinet} ${zoomed ? styles.zoomed : ""}`}
        data-spark-cabinet="true"
        onPointerDown={onGrab}
      >
        {lights}
        {screen}
        {chin}
      </div>
    );
  }

  if (!dockReady) return null;

  return (
    <div
      className={styles.dock}
      style={
        open && spot
          ? { left: spot.x, top: spot.y, right: "auto", bottom: "auto" }
          : undefined
      }
    >
      {open ? (
        <div
          ref={shell}
          className={`${styles.cabinet} ${styles.docked} ${zoomed ? styles.zoomed : ""} ${
            dragging ? styles.dragging : ""
          }`}
          role="dialog"
          aria-label="Spark terminal"
          onPointerDown={onGrab}
          onDoubleClick={toCorner}
        >
          {lights}
          {screen}
          {chin}
        </div>
      ) : (
        <button
          type="button"
          className={styles.pill}
          onClick={() => setOpen(true)}
          aria-expanded={false}
        >
          <SparkMark className={styles.pillMark} />
          terminal
        </button>
      )}
    </div>
  );
}
