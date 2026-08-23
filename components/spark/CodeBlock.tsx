"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import hljs from "highlight.js/lib/common";

export interface CodeNote {
  line: number;
  text: string;
  kind: "note" | "thread";
}

interface CodeBlockProps {
  children: string;
  language?: string;
  file?: string;
  focus?: string[];
}

const NOTE_PATTERNS: RegExp[] = [
  /\s*\/\/(!{1,2})\s?(.*)$/,
  /\s*\/\*(!{1,2})\s?(.*?)\*\/\s*$/,
  /\s*<!--(!{1,2})\s?(.*?)-->\s*$/,
];

const LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  bash: "Terminal",
  sh: "Terminal",
  shell: "Terminal",
  sql: "SQL",
  md: "Markdown",
  python: "Python",
};

function extractNotes(source: string): { code: string; notes: CodeNote[] } {
  const notes: CodeNote[] = [];
  const kept: string[] = [];

  source.split("\n").forEach((line) => {
    let stripped = line;

    for (const pattern of NOTE_PATTERNS) {
      const match = stripped.match(pattern);
      if (!match) continue;

      const text = match[2].trim();
      if (text) {
        notes.push({
          line: kept.length + 1,
          text,
          kind: match[1] === "!!" ? "thread" : "note",
        });
      }
      stripped = stripped.slice(0, match.index);
      break;
    }

    if (stripped.trim() === "" && stripped !== line) return;
    kept.push(stripped);
  });

  return { code: kept.join("\n"), notes };
}

function highlight(code: string, language: string): string {
  try {
    return hljs.highlight(code, { language, ignoreIllegals: true }).value;
  } catch {
    try {
      return hljs.highlightAuto(code).value;
    } catch {
      return code.replace(
        /[&<>]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string,
      );
    }
  }
}

function applyFocus(root: HTMLElement, terms: string[]) {
  if (terms.length === 0) return;

  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "g");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];

  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue && pattern.test(node.nodeValue))
      targets.push(node as Text);
    pattern.lastIndex = 0;
    node = walker.nextNode();
  }

  targets.forEach((textNode) => {
    const parent = textNode.parentNode;
    if (!parent) return;

    const fragment = document.createDocumentFragment();
    const value = textNode.nodeValue ?? "";
    let cursor = 0;
    let match: RegExpExecArray | null;

    pattern.lastIndex = 0;
    while ((match = pattern.exec(value)) !== null) {
      if (match.index > cursor) {
        fragment.appendChild(
          document.createTextNode(value.slice(cursor, match.index)),
        );
      }
      const mark = document.createElement("span");
      mark.className = "spark-code-focus";
      mark.textContent = match[0];
      fragment.appendChild(mark);
      cursor = match.index + match[0].length;
    }

    if (cursor < value.length) {
      fragment.appendChild(document.createTextNode(value.slice(cursor)));
    }
    parent.replaceChild(fragment, textNode);
  });
}

export function CodeBlock({
  children,
  language = "javascript",
  file,
  focus = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const { code, notes } = useMemo(() => extractNotes(children), [children]);
  const lines = useMemo(() => code.split("\n"), [code]);
  const html = useMemo(() => highlight(code, language), [code, language]);

  const noteByLine = useMemo(() => {
    const map = new Map<number, CodeNote>();
    notes.forEach((note) => map.set(note.line, note));
    return map;
  }, [notes]);

  const focusedLines = useMemo(() => {
    if (focus.length === 0) return new Set<number>();
    const marked = new Set<number>();
    lines.forEach((line, i) => {
      if (
        focus.some((term) =>
          new RegExp(
            `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          ).test(line),
        )
      ) {
        marked.add(i + 1);
      }
    });
    return marked;
  }, [lines, focus]);

  const highlightedLines = useMemo(() => html.split("\n"), [html]);

  useEffect(() => {
    if (codeRef.current) applyFocus(codeRef.current, focus);
  }, [html, focus]);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const label = LANGUAGE_LABELS[language] ?? language.toUpperCase();

  return (
    <div className="spark-code my-7 overflow-hidden rounded-xl bg-[var(--spark-ink)]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="spark-eyebrow text-[var(--spark-gold-deep)]">
            + {label}
          </span>
          {file && (
            <span className="spark-mono text-[10.5px] text-[var(--spark-on-dark-muted)]">
              {file}
            </span>
          )}
        </div>
        <button
          onClick={copy}
          className="rounded-full px-3 py-1 text-[10.5px] font-medium text-[var(--spark-on-dark-muted)] transition-colors hover:bg-white/[0.07] hover:text-white/80"
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div
        ref={codeRef}
        className="overflow-x-auto py-4 spark-mono text-[13px] leading-[1.85]"
      >
        {highlightedLines.map((lineHtml, i) => {
          const lineNumber = i + 1;
          const note = noteByLine.get(lineNumber);
          const isFocused = focusedLines.has(lineNumber);

          return (
            <React.Fragment key={i}>
              <div
                className={`grid grid-cols-[44px_minmax(0,1fr)] ${isFocused ? "spark-code-line-focus" : ""}`}
              >
                <span className="select-none pr-3 text-right text-[var(--spark-on-dark-dim)]">
                  {lineNumber}
                </span>
                <code
                  className="hljs whitespace-pre pr-5"
                  dangerouslySetInnerHTML={{ __html: lineHtml || "&nbsp;" }}
                />
              </div>

              {note && (
                <div className="px-5 py-2 pl-[44px]">
                  <div
                    className={`flex items-start gap-2.5 rounded-lg border border-dashed px-3 py-2.5 ${
                      note.kind === "thread"
                        ? "border-[var(--spark-terracotta)]/35 bg-[var(--spark-terracotta)]/[0.07]"
                        : "border-[var(--spark-gold)]/35 bg-[var(--spark-gold)]/[0.07]"
                    }`}
                  >
                    <span
                      className={`spark-eyebrow shrink-0 pt-0.5 ${
                        note.kind === "thread"
                          ? "text-[var(--spark-terracotta)]"
                          : "text-[var(--spark-gold)]"
                      }`}
                    >
                      {note.kind === "thread" ? "Thread" : "Note"}
                    </span>
                    <span className="font-sans text-[12.5px] leading-[1.6] text-[var(--spark-on-dark)]">
                      {note.text}
                    </span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
