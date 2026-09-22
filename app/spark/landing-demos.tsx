"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { RunMarker } from "@/components/spark/RunMarker";
import { SPARK_MARK_PATH } from "@/components/spark/SparkMark";
import styles from "./landing.module.css";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="21 14 20.927 34.729"
      fill="currentColor"
      className={className ?? styles.mark}
      aria-hidden="true"
    >
      <path d={SPARK_MARK_PATH} />
    </svg>
  );
}

export function Caret() {
  return <span className={styles.caret} aria-hidden="true" />;
}

const TOKEN =
  /("[^"]*")|(\/\/.*$)|(\b(?:import|from|export|function|const|return)\b)|(<\/?[A-Za-z]+|\/?>)|(\b[A-Za-z]+(?==))/g;

function highlight(line: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(line))) {
    if (match.index > last) out.push(line.slice(last, match.index));
    const cls = match[1]
      ? styles.tString
      : match[2]
        ? styles.tComment
        : match[3]
          ? styles.tKeyword
          : match[4]
            ? styles.tTag
            : styles.tAttr;
    out.push(
      <span key={match.index} className={cls}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function useInView<T extends Element>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

const SEARCH_USERS = [
  'import { useState } from "react";',
  "",
  "export function SearchUsers({ users = [] }) {",
  '  const [query, setQuery] = useState("");',
  "",
  "  const filtered = users.filter((user) =>",
  "    user.name.toLowerCase().includes(query.toLowerCase()),",
  "  );",
  "",
  "  return (",
  "    <div>",
  '      <label htmlFor="user-search">Search users</label>',
  "      <input",
  '        id="user-search"',
  '        type="text"',
  '        placeholder="Search users..."',
  "        value={query}",
  "        onChange={(e) => setQuery(e.target.value)}",
  "      />",
  "",
  "      {filtered.length === 0 ? (",
  "        <div>No users found</div>",
  "      ) : (",
  "        <ul>",
  "          {filtered.map((user) => (",
  "            <li key={user.id}>{user.name}</li>",
  "          ))}",
  "        </ul>",
  "      )}",
  "    </div>",
  "  );",
  "}",
];

const NOTES = [
  {
    from: 1,
    to: 1,
    text: "Brings in `useState`, the function React gives you for storing a value that can change while the component is on screen.",
  },
  {
    from: 3,
    to: 3,
    text: "Defines the component. `export` lets another file put it on screen. `users = []` means an empty list if nothing is passed in, so the next lines never filter something missing.",
  },
  {
    from: 4,
    to: 4,
    text: "Creates a piece of state. `query` is what has been typed so far and `setQuery` changes it. It starts as an empty string, like a blank text field.",
  },
  {
    from: 6,
    to: 8,
    text: "Makes a new list holding only the users whose name contains the query. Both sides are lowercased, so capital letters do not stop a match.",
  },
  {
    from: 12,
    to: 12,
    text: "Labels the input. `htmlFor` matches the input's `id`, so screen readers announce it and clicking the words puts the cursor in the box.",
  },
  {
    from: 13,
    to: 19,
    text: "The input shows whatever `query` holds. `onChange` runs on every keystroke and hands the new text to `setQuery`, which makes React run the component again.",
  },
  {
    from: 21,
    to: 29,
    text: "If nothing matches, say so. Otherwise list the matches. Each item gets a `key` so React can tell the items apart from one render to the next.",
  },
];

const PEOPLE = [
  { id: 1, name: "Ana Ruiz" },
  { id: 2, name: "Ben Okafor" },
  { id: 3, name: "Chloe Martin" },
  { id: 4, name: "Dan Hughes" },
  { id: 5, name: "Esther Park" },
  { id: 6, name: "Hannah Lee" },
  { id: 7, name: "Jonas Berg" },
  { id: 8, name: "Maya Patel" },
];

const RUN_ORDER = [18, 4, 6, 21, 26];

export function ReadAlong() {
  const [note, setNote] = useState(2);
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const [running, setRunning] = useState<number | null>(null);
  const [ref, seen] = useInView<HTMLDivElement>();
  const rows = useRef<Array<HTMLElement | null>>([]);
  const runTimers = useRef<number[]>([]);

  useEffect(() => () => runTimers.current.forEach(window.clearTimeout), []);

  function runPass() {
    runTimers.current.forEach(window.clearTimeout);
    runTimers.current = [
      ...RUN_ORDER.map((line, i) =>
        window.setTimeout(() => setRunning(line), i * 260),
      ),
      window.setTimeout(() => setRunning(null), RUN_ORDER.length * 260 + 500),
    ];
  }

  const filtered = PEOPLE.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!seen || touched) return;
    const script = ["", "a", "an"];
    const timers = script.map((value, i) =>
      window.setTimeout(
        () => {
          setQuery(value);
          if (value) {
            setNote(2);
            runPass();
          }
        },
        1100 + i * 520,
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [seen, touched]);

  const active = NOTES[note];

  function select(i: number) {
    setTouched(true);
    setNote(i);
  }

  return (
    <div className={styles.window} ref={ref}>
      <div className={styles.windowBar}>
        <span className={styles.tab}>SearchUsers.jsx</span>
        <span className={styles.windowHint}>
          Pick a line, or type in the preview
        </span>
      </div>
      <div className={styles.readAlong}>
        <div className={styles.codeCol}>
          <pre className={styles.editor} aria-label="SearchUsers.jsx">
            {SEARCH_USERS.map((line, i) => {
              const n = i + 1;
              const owner = NOTES.findIndex((x) => n >= x.from && n <= x.to);
              const on = owner === note;
              const run = running === n;
              const setRow = (node: HTMLElement | null) => {
                rows.current[i] = node;
              };
              const live =
                n === 4 && query
                  ? `  // query is "${query}"`
                  : n === 6 && query
                    ? `  // ${filtered.length} of ${PEOPLE.length} match`
                    : "";
              const body = (
                <>
                  <span
                    className={`${styles.gutter} ${run ? styles.gutterRun : ""}`}
                  >
                    {n}
                  </span>
                  <span className={styles.lineText}>
                    {highlight(line)}
                    {live && <span className={styles.live}>{live}</span>}
                  </span>
                </>
              );
              return owner >= 0 ? (
                <button
                  key={n}
                  ref={setRow}
                  type="button"
                  className={`${styles.line} ${styles.lineButton} ${on ? styles.lineOn : ""} ${run ? "spark-run-line" : ""}`}
                  onClick={() => select(owner)}
                  aria-pressed={on}
                >
                  {body}
                </button>
              ) : (
                <span
                  key={n}
                  ref={setRow}
                  className={`${styles.line} ${run ? "spark-run-line" : ""}`}
                >
                  {body}
                </span>
              );
            })}
            <RunMarker
              rows={rows}
              active={running === null ? null : running - 1}
              left={8}
            />
          </pre>
        </div>
        <div className={styles.sideCol}>
          <div className={styles.note} aria-live="polite">
            <span className={styles.noteLines}>
              {active.from === active.to
                ? `Line ${active.from}`
                : `Lines ${active.from} to ${active.to}`}
            </span>
            <p>{inlineCode(active.text)}</p>
            <div className={styles.noteNav}>
              <button
                type="button"
                onClick={() => select(Math.max(0, note - 1))}
                disabled={note === 0}
              >
                Previous
              </button>
              <span>
                {note + 1} of {NOTES.length}
              </span>
              <button
                type="button"
                onClick={() => select(Math.min(NOTES.length - 1, note + 1))}
                disabled={note === NOTES.length - 1}
              >
                Next
              </button>
            </div>
          </div>
          <div className={styles.previewCol}>
            <span className={styles.previewLabel}>Preview</span>
            <div className={styles.browser}>
              <label htmlFor="lab-user-search">Search users</label>
              <input
                id="lab-user-search"
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => {
                  setTouched(true);
                  setQuery(e.target.value);
                  setNote(e.target.value ? 2 : note);
                  runPass();
                }}
              />
              {filtered.length === 0 ? (
                <div>No users found</div>
              ) : (
                <ul>
                  {filtered.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type LessonSection = { title: string; lede: string };

function inlineCode(text: string) {
  return text
    .split("`")
    .map((part, i) =>
      i % 2 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>,
    );
}

export function LessonSteps({
  moduleTitle,
  sections,
}: {
  moduleTitle: string;
  sections: LessonSection[];
}) {
  const [at, setAt] = useState(0);
  const current = sections[at];
  if (!current) return null;

  return (
    <div className={styles.phone}>
      <div className={styles.phoneHead}>
        <span>Module 01</span>
        <span>{moduleTitle}</span>
      </div>
      <div className={styles.dots} aria-hidden="true">
        {sections.map((s, i) => (
          <span
            key={s.title}
            className={
              i < at ? styles.dotRead : i === at ? styles.dotNow : styles.dot
            }
          />
        ))}
      </div>
      <div className={styles.phoneBody} key={at}>
        <span className={styles.sectionNo}>
          {String(at + 1).padStart(2, "0")} /{" "}
          {String(sections.length).padStart(2, "0")}
        </span>
        <h4 className={styles.sectionTitle}>{current.title}</h4>
        <p className={styles.sectionLede}>{inlineCode(current.lede)}</p>
      </div>
      <div className={styles.phoneFoot}>
        <button
          type="button"
          className={styles.ghostButton}
          onClick={() => setAt((a) => Math.max(0, a - 1))}
          disabled={at === 0}
        >
          Back
        </button>
        <button
          type="button"
          className={styles.inkButton}
          onClick={() => setAt((a) => (a + 1) % sections.length)}
        >
          {at === sections.length - 1 ? "Start again" : "Next section"}
        </button>
      </div>
    </div>
  );
}

const COUNTER = [
  "const [count, setCount] = useState(0);",
  "",
  "return (",
  "  <button onClick={() => setCount(count + 1)}>",
  "    Clicked {count} times",
  "  </button>",
  ");",
];

export function StateDemo() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState<number | null>(null);
  const [log, setLog] = useState([{ n: 1, value: 0 }]);
  const timers = useRef<number[]>([]);
  const rows = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  function click() {
    timers.current.forEach(window.clearTimeout);
    const next = count + 1;
    setStep(4);
    timers.current = [
      window.setTimeout(() => setStep(1), 420),
      window.setTimeout(() => {
        setCount(next);
        setLog((l) =>
          [...l, { n: l[l.length - 1].n + 1, value: next }].slice(-4),
        );
        setStep(5);
      }, 840),
      window.setTimeout(() => setStep(null), 1700),
    ];
  }

  const said =
    step === 4
      ? "`onClick` runs and calls `setCount` with `count + 1`."
      : step === 1
        ? "React stores the new value and runs the component again."
        : step === 5
          ? `This render reads \`count\` as ${count}, so the label changes.`
          : "Click the button to watch one render happen.";

  return (
    <div className={styles.stateDemo}>
      <pre className={`${styles.editor} ${styles.editorSmall}`}>
        {COUNTER.map((line, i) => (
          <span
            key={i}
            ref={(node) => {
              rows.current[i] = node;
            }}
            className={`${styles.line} ${step === i + 1 ? "spark-run-line" : ""}`}
          >
            <span
              className={`${styles.gutter} ${step === i + 1 ? styles.gutterRun : ""}`}
            >
              {i + 1}
            </span>
            <span className={styles.lineText}>
              {highlight(line)}
              {i === 0 && (
                <span className={styles.live}>{`  // count is ${count}`}</span>
              )}
            </span>
          </span>
        ))}
        <RunMarker
          rows={rows}
          active={step === null ? null : step - 1}
          left={8}
        />
      </pre>
      <div className={styles.stateSide}>
        <div className={styles.browser}>
          <button type="button" className={styles.plainButton} onClick={click}>
            Clicked {count} times
          </button>
        </div>
        <p className={styles.stateSaid} aria-live="polite">
          {inlineCode(said)}
        </p>
        <ol className={styles.renderLog}>
          {log.map((entry) => (
            <li key={entry.n}>
              Render {entry.n}: count is {entry.value}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const OPTIONS = [
  "So the component still renders when nothing is passed in",
  "So the list of users is always sorted",
  "So nothing else is allowed to change users",
];

export function CheckDemo() {
  const [picked, setPicked] = useState<number | null>(null);
  const solved = picked === 0;

  return (
    <div className={styles.check}>
      <span className={styles.checkEyebrow}>Checkpoint · Module 01</span>
      <p className={styles.checkQuestion}>
        Why does SearchUsers have <code>users = []</code> as a default?
      </p>
      <div className={styles.checkOptions} role="group" aria-label="Answers">
        {OPTIONS.map((option, i) => (
          <button
            key={option}
            type="button"
            aria-pressed={picked === i}
            className={`${styles.checkOption} ${
              picked === i
                ? i === 0
                  ? styles.checkPass
                  : styles.checkMiss
                : ""
            }`}
            onClick={() => setPicked(i)}
          >
            <span className={styles.checkKey}>
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
      </div>
      <p
        className={`${styles.checkWhy} ${picked === null ? styles.checkWhyIdle : ""}`}
        aria-live="polite"
      >
        {inlineCode(
          picked === null
            ? "Pick an answer to see the reasoning."
            : solved
              ? "Correct. If nothing passes `users` in, the list is empty instead of missing, and filtering an empty list is fine."
              : "Not quite. The default only decides what `users` is when nothing is passed in. Without it, `filter` would run on something missing and the component would stop rendering.",
        )}
      </p>
    </div>
  );
}

type Status = "idle" | "sending" | "done" | "error";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/spark/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website,
          source: "neilmcardle.com/spark",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
        return;
      }
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("That did not send. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <p className={styles.waitDone}>
        Done. I will email you when Spark is finished.
      </p>
    );
  }

  return (
    <form className={styles.wait} onSubmit={submit}>
      <label htmlFor="spark-lab-email" className={styles.srOnly}>
        Email address
      </label>
      <input
        id="spark-lab-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@studio.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.honeypot}
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <button type="submit" className={styles.inkButton}>
        {status === "sending" ? "Sending" : "Notify me"}
      </button>
      {status === "error" && (
        <p className={styles.waitError} role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
