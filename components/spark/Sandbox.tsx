"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Pane = "html" | "css";

const FRAME_BASE = `*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  padding: 20px;
  background: #f7f7f5;
  color: #16181a;
  font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}`;

export function Sandbox({
  html = "",
  css = "",
  title = "Try it",
  caption,
  height = 300,
}: {
  html?: string;
  css?: string;
  title?: string;
  caption?: string;
  height?: number;
}) {
  const original = useMemo(
    () => ({ html: html.trim(), css: css.trim() }),
    [html, css],
  );
  const [code, setCode] = useState(original);
  const [pane, setPane] = useState<Pane>(css ? "css" : "html");
  const [live, setLive] = useState(original);
  const dirty = code.html !== original.html || code.css !== original.css;
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const tick = window.setTimeout(() => setLive(code), 280);
    return () => window.clearTimeout(tick);
  }, [code]);

  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${FRAME_BASE}
${live.css}</style></head><body>${live.html}</body></html>`;

  return (
    <section className="spark-sandbox my-10">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="spark-eyebrow shrink-0 text-[var(--spark-phosphor)]">
          {title}
        </span>
        <span aria-hidden className="h-px flex-1 bg-[var(--spark-rule)]" />
        {dirty && (
          <button
            type="button"
            className="spark-quiet min-h-[32px] text-[12px]"
            onClick={() => setCode(original)}
          >
            Reset
          </button>
        )}
      </div>

      {caption && (
        <p className="mb-3 border-l-2 border-[var(--spark-phosphor)] bg-[var(--spark-phosphor-tint)] px-4 py-3 text-[14.5px] leading-[1.6] text-[var(--spark-text)]">
          {caption}
        </p>
      )}

      <div className="grid overflow-hidden rounded-xl border border-[var(--spark-rule)] bg-[var(--spark-ink)] lg:grid-cols-2">
        <div className="flex min-w-0 flex-col border-b border-[var(--spark-rule)] lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-1 border-b border-[var(--spark-rule)] px-2 py-1.5">
            {(["css", "html"] as Pane[])
              .filter((name) => (name === "css" ? css : html))
              .map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPane(name)}
                  aria-pressed={pane === name}
                  className={`spark-mono rounded px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition-colors ${
                    pane === name
                      ? "bg-[rgba(78,255,145,0.14)] text-[var(--spark-run)]"
                      : "text-[var(--spark-faint)] hover:text-[var(--spark-on-dark)]"
                  }`}
                >
                  {name}
                </button>
              ))}
            <span className="spark-eyebrow ml-auto pr-1 text-[var(--spark-faint)]">
              editable
            </span>
          </div>
          <textarea
            ref={area}
            spellCheck={false}
            value={code[pane]}
            onChange={(e) => setCode({ ...code, [pane]: e.target.value })}
            aria-label={`${pane.toUpperCase()} for this example, editable`}
            className="spark-mono w-full resize-none bg-transparent p-4 text-[12.5px] leading-[1.75] text-[var(--spark-on-dark)] outline-none"
            style={{ height }}
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-[var(--spark-rule)] px-3 py-1.5">
            <span className="spark-eyebrow text-[var(--spark-faint)]">
              result
            </span>
            <span className="spark-eyebrow text-[var(--spark-faint)]">
              live
            </span>
          </div>
          <iframe
            title={`${title} result`}
            srcDoc={doc}
            sandbox="allow-scripts"
            className="w-full border-0 bg-white"
            style={{ height }}
          />
        </div>
      </div>
    </section>
  );
}
