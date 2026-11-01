"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { hash, useActive, usePrefersReducedMotion } from "../lib";
import s from "./teletype.module.css";

const FILES: Record<string, string> = {
  readme:
    "this is a pdp-11/20 with 24k bytes of core.\neverything is a file. directories are files too.\nls lists them. cat prints one.",
  todo: "finish the manual\nshow the patent department roff\nbuy more paper",
  "doc/manual":
    "unix programmer's manual\nk. thompson, d. m. ritchie\nnovember 3, 1971",
};

const DIRS: Record<string, string[]> = {
  "": ["bin", "doc", "readme", "todo"],
  bin: ["as", "cat", "date", "ed", "echo", "ls", "who"],
  doc: ["manual"],
};

const BOOT = "unix v1\n\nlogin: ken\n";
const PROMPT = "@ ";
const SUGGEST = ["ls", "cat readme", "cat todo", "who", "date", "ed"];

function run(line: string, ed: boolean): { out: string; ed: boolean } {
  const input = line.trim();
  if (ed) {
    if (input === "q") return { out: "", ed: false };
    return { out: "?\n", ed: true };
  }
  if (!input) return { out: "", ed: false };
  const [cmd, ...args] = input.split(/\s+/);
  switch (cmd) {
    case "ls": {
      const dir = (args.find((a) => !a.startsWith("-")) ?? "").replace(
        /\/$/,
        "",
      );
      const list = DIRS[dir];
      if (!list) return { out: `${dir} nonexistent\n`, ed: false };
      return { out: list.join("\n") + "\n", ed: false };
    }
    case "cat": {
      if (!args.length) return { out: "", ed: false };
      return {
        out: args
          .map((a) => {
            if (DIRS[a.replace(/\/$/, "")]) return `${a}: directory\n`;
            const f = FILES[a];
            return f == null ? `${a}: cannot open\n` : f + "\n";
          })
          .join(""),
        ed: false,
      };
    }
    case "date":
      return { out: "wed nov  3 10:42:17 est 1971\n", ed: false };
    case "who":
      return {
        out: "ken     tty0  nov  3 09:12\ndmr     tty1  nov  3 09:40\nyou     tty2  nov  3 10:42\n",
        ed: false,
      };
    case "echo":
      return { out: args.join(" ") + "\n", ed: false };
    case "ed":
      return { out: "", ed: true };
    case "help":
    case "man":
      return {
        out: `${cmd}: not found\ntry ls, cat readme, who, date, echo or ed\n`,
        ed: false,
      };
    case "clear":
      return { out: "clear: not found\nthis is paper.\n", ed: false };
    default:
      return { out: `${cmd}: not found\n`, ed: false };
  }
}

const Line = memo(function Line({
  text,
  at,
  children,
}: {
  text: string;
  at: number;
  children?: ReactNode;
}) {
  return (
    <div className={s.line}>
      {text.length === 0 && !children
        ? "\u00a0"
        : Array.from(text).map((ch, j) => (
            <span
              key={j}
              style={{
                opacity: 0.66 + hash(at + j, 7) * 0.34,
                transform: `translateY(${(hash(at + j, 3) - 0.5) * 1.4}px)`,
              }}
            >
              {ch}
            </span>
          ))}
      {children}
    </div>
  );
});

function Ink({ text, cursor }: { text: string; cursor?: ReactNode }) {
  const lines = useMemo(() => {
    const all = text.split("\n");
    const start = Math.max(0, all.length - 160);
    let offset = 0;
    for (let i = 0; i < start; i++) offset += all[i].length + 1;
    return all.slice(start).map((l) => {
      const o = offset;
      offset += l.length + 1;
      return { l, o };
    });
  }, [text]);

  return (
    <>
      {lines.map(({ l, o }, i) => (
        <Line key={o} text={l} at={o}>
          {i === lines.length - 1 ? cursor : undefined}
        </Line>
      ))}
    </>
  );
}

export default function Teletype() {
  const active = useActive();
  const reduced = usePrefersReducedMotion();
  const [paper, setPaper] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(true);
  const [focused, setFocused] = useState(false);
  const pending = useRef(BOOT + PROMPT);
  const ed = useRef(false);
  const [editing, setEditing] = useState(false);
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (!pending.current.length) {
        setBusy(false);
        return;
      }
      const n = reduced ? pending.current.length : 2;
      const chunk = pending.current.slice(0, n);
      pending.current = pending.current.slice(n);
      setPaper((p) => p + chunk);
      setBusy(true);
    }, 34);
    return () => window.clearInterval(id);
  }, [active, reduced]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [paper, typed]);

  const submit = useCallback(
    (line: string) => {
      if (busy) return;
      const { out, ed: nextEd } = run(line, ed.current);
      ed.current = nextEd;
      setEditing(nextEd);
      if (line.trim()) {
        history.current.unshift(line);
        histIdx.current = -1;
      }
      setPaper((p) => p + line + "\n");
      setTyped("");
      pending.current += out + (nextEd ? "" : PROMPT);
      setBusy(true);
    },
    [busy],
  );

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(typed);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      histIdx.current = Math.min(h.length - 1, histIdx.current + 1);
      setTyped(h[histIdx.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      histIdx.current = Math.max(-1, histIdx.current - 1);
      setTyped(histIdx.current < 0 ? "" : history.current[histIdx.current]);
    }
  };

  return (
    <div
      className={s.machine}
      onClick={() => input.current?.focus({ preventScroll: true })}
    >
      <div className={s.paperWell}>
        <div
          ref={scroller}
          className={s.paper}
          role="log"
          aria-label="Teletype paper"
        >
          <div className={s.sheet}>
            <Ink
              text={paper + (busy ? "" : typed)}
              cursor={
                busy ? undefined : (
                  <span
                    className={s.head}
                    data-focused={focused || undefined}
                    aria-hidden
                  />
                )
              }
            />
          </div>
        </div>
        <div className={s.platen} aria-hidden />
      </div>
      <div className={s.deck}>
        <label className={s.typeLine}>
          <span className={s.srOnly}>Command</span>
          <input
            ref={input}
            className={s.input}
            value={typed}
            onChange={(e) => setTyped(e.target.value.toLowerCase())}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="send"
            placeholder={focused ? "" : "Click here and type"}
          />
        </label>
        <div className={s.chips}>
          {(editing ? ["q"] : SUGGEST).map((c) => (
            <button
              key={c}
              type="button"
              className={s.chip}
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                submit(c);
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
