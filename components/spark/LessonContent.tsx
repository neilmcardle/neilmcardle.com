"use client";

import React, { useMemo } from "react";
import { CodeBlock } from "./CodeBlock";
import { Check } from "./Check";
import { Checklist } from "./Checklist";
import { FilteringWidget } from "./FilteringWidget";

const KNOWN_COMPONENTS = new Set(["Check", "FilteringWidget"]);

function renderComponent(
  name: string,
  attrs: Record<string, string>,
  key: number,
) {
  switch (name) {
    case "Check":
      return (
        <Check
          key={key}
          question={attrs.question ?? ""}
          answer={attrs.answer}
          options={attrs.options}
          correct={attrs.correct}
          why={attrs.why}
        />
      );
    case "FilteringWidget":
      return <FilteringWidget key={key} />;
    default:
      return null;
  }
}

type Block =
  | {
      kind: "code";
      language: string;
      file?: string;
      focus: string[];
      body: string;
    }
  | { kind: "component"; name: string; attrs: Record<string, string> }
  | { kind: "heading"; level: 3 | 4; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "checklist"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "rule" }
  | { kind: "paragraph"; text: string };

const FENCE = /^```(\S*)\s*(.*)$/;
const COMPONENT_TAG = /^<([A-Z]\w*)([\s\S]*?)\/>\s*$/;
const HEADING = /^(#{3,4})\s+(.*)$/;
const UNORDERED = /^[-*]\s+(.+)$/;
const TASK = /^\s*[-*]\s+\[([ xX])\]\s+(.+)$/;
const ORDERED = /^\d+[.)]\s+(.+)$/;
const TABLE_ROW = /^\|(.+)\|\s*$/;
const TABLE_DIVIDER = /^\|[\s:|-]+\|\s*$/;
const RULE = /^(---|\*\*\*|___)\s*$/;

function parseAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const pattern = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    attrs[match[1]] = match[2] ?? match[3] ?? "";
  }
  return attrs;
}

function parseFenceMeta(meta: string): { file?: string; focus: string[] } {
  const attrs = parseAttributes(meta);
  const bare = /(?:^|\s)(file|focus)=([^\s"']+)/g;
  let match;
  while ((match = bare.exec(meta)) !== null) {
    if (!attrs[match[1]]) attrs[match[1]] = match[2];
  }
  return {
    file: attrs.file,
    focus: attrs.focus
      ? attrs.focus
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  };
}

function splitRow(row: string): string[] {
  return row.split("|").map((cell) => cell.trim());
}

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.split("\n");
  let i = 0;

  const flushParagraph = (buffer: string[]) => {
    const text = buffer.join("\n").trim();
    if (text) blocks.push({ kind: "paragraph", text });
  };

  let paragraph: string[] = [];

  const closeParagraph = () => {
    flushParagraph(paragraph);
    paragraph = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(FENCE);
    if (fence) {
      closeParagraph();
      const language = fence[1] || "javascript";
      const { file, focus } = parseFenceMeta(fence[2] || "");
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({
        kind: "code",
        language,
        file,
        focus,
        body: body.join("\n"),
      });
      continue;
    }

    if (/^\s*<[A-Z]/.test(line)) {
      let joined = "";
      let consumed = 0;

      for (let j = i; j < Math.min(lines.length, i + 8); j++) {
        joined += (j > i ? "\n" : "") + lines[j];
        const tag = joined.trim().match(COMPONENT_TAG);
        if (tag && KNOWN_COMPONENTS.has(tag[1])) {
          closeParagraph();
          blocks.push({
            kind: "component",
            name: tag[1],
            attrs: parseAttributes(tag[2]),
          });
          consumed = j - i + 1;
          break;
        }
      }

      if (consumed > 0) {
        i += consumed;
      } else {
        paragraph.push(line);
        i++;
      }
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      closeParagraph();
      blocks.push({
        kind: "heading",
        level: heading[1].length === 3 ? 3 : 4,
        text: heading[2].trim(),
      });
      i++;
      continue;
    }

    if (RULE.test(line.trim())) {
      closeParagraph();
      blocks.push({ kind: "rule" });
      i++;
      continue;
    }

    if (
      TABLE_ROW.test(line) &&
      i + 1 < lines.length &&
      TABLE_DIVIDER.test(lines[i + 1])
    ) {
      closeParagraph();
      const head = splitRow(line.replace(/^\||\|$/g, ""));
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && TABLE_ROW.test(lines[i])) {
        rows.push(splitRow(lines[i].replace(/^\||\|$/g, "")));
        i++;
      }
      blocks.push({ kind: "table", head, rows });
      continue;
    }

    if (TASK.test(line)) {
      closeParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const task = lines[i].match(TASK);
        if (task) {
          items.push(task[2].trim());
          i++;
          continue;
        }
        if (/^\s{2,}\S/.test(lines[i]) && items.length > 0) {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i++;
          continue;
        }
        break;
      }
      blocks.push({ kind: "checklist", items });
      continue;
    }

    const unordered = line.match(UNORDERED);
    const ordered = line.match(ORDERED);
    if (unordered || ordered) {
      closeParagraph();
      const isOrdered = Boolean(ordered);
      const items: string[] = [];
      while (i < lines.length) {
        const itemMatch = isOrdered
          ? lines[i].match(ORDERED)
          : lines[i].match(UNORDERED);
        if (itemMatch) {
          items.push(itemMatch[1].trim());
          i++;
          continue;
        }
        if (/^\s{2,}\S/.test(lines[i]) && items.length > 0) {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i++;
          continue;
        }
        break;
      }
      blocks.push({ kind: "list", ordered: isOrdered, items });
      continue;
    }

    if (line.trim() === "") {
      closeParagraph();
      i++;
      continue;
    }

    paragraph.push(line);
    i++;
  }

  closeParagraph();
  return blocks;
}

const SAFE_HREF = /^(?:https?:\/\/|mailto:|[./#])/i;

const INLINE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(\*[^*\s][^*]*\*)|(_[^_\s][^_]*_)/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(
        <code key={`${keyPrefix}-${key++}`} className="spark-inline-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong
          key={`${keyPrefix}-${key++}`}
          className="font-semibold text-[var(--spark-text)]"
        >
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch && SAFE_HREF.test(linkMatch[2])) {
        const external = /^https?:\/\//.test(linkMatch[2]);
        nodes.push(
          <a
            key={`${keyPrefix}-${key++}`}
            href={linkMatch[2]}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="spark-link"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(
        <em key={`${keyPrefix}-${key++}`} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function LessonContent({
  children,
  moduleNumber,
}: {
  children: string;
  moduleNumber: number;
}) {
  const blocks = useMemo(() => parseBlocks(children), [children]);

  return (
    <div className="spark-prose">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "code":
            return (
              <CodeBlock
                key={i}
                language={block.language}
                file={block.file}
                focus={block.focus}
              >
                {block.body}
              </CodeBlock>
            );

          case "component":
            return renderComponent(block.name, block.attrs, i);

          case "heading":
            return block.level === 3 ? (
              <h3
                key={i}
                className="mb-3 mt-9 font-serif text-[23px] font-bold leading-tight tracking-[-0.02em] text-[var(--spark-text)]"
              >
                {renderInline(block.text, `h${i}`)}
              </h3>
            ) : (
              <h4
                key={i}
                className="mb-2 mt-7 text-[15px] font-semibold tracking-[-0.01em] text-[var(--spark-text)]"
              >
                {renderInline(block.text, `h${i}`)}
              </h4>
            );

          case "rule":
            return (
              <hr
                key={i}
                className="my-9 border-0 border-t border-black/[0.09]"
              />
            );

          case "checklist":
            return (
              <Checklist
                key={i}
                moduleNumber={moduleNumber}
                items={block.items.map((item, j) => ({
                  text: item,
                  content: renderInline(item, `ck${i}-${j}`),
                }))}
              />
            );

          case "list":
            return block.ordered ? (
              <ol key={i} className="my-5 flex list-none flex-col gap-2.5 pl-0">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="grid grid-cols-[26px_minmax(0,1fr)] gap-3"
                  >
                    <span className="pt-0.5 text-right spark-mono text-[12px] text-[var(--spark-gold-ink)]">
                      {j + 1}
                    </span>
                    <span className="text-[16px] leading-[1.72] text-[#44423e]">
                      {renderInline(item, `ol${i}-${j}`)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="my-5 flex list-none flex-col gap-2.5 pl-0">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="grid grid-cols-[26px_minmax(0,1fr)] gap-3"
                  >
                    <span
                      aria-hidden
                      className="mt-[11px] h-[5px] w-[5px] justify-self-end rounded-full bg-[var(--spark-gold-deep)]"
                    />
                    <span className="text-[16px] leading-[1.72] text-[#44423e]">
                      {renderInline(item, `ul${i}-${j}`)}
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "table":
            return (
              <div key={i} className="my-7 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      {block.head.map((cell, j) => (
                        <th
                          key={j}
                          className="spark-eyebrow border-b border-black/[0.14] px-3 py-3 text-[var(--spark-faint)] first:pl-0"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="border-b border-black/[0.06] px-3 py-3 align-top text-[14px] leading-[1.6] text-[#44423e] first:pl-0"
                          >
                            {renderInline(cell, `td${i}-${j}-${k}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return (
              <p
                key={i}
                className="my-5 text-[16.5px] leading-[1.75] text-[#44423e]"
              >
                {renderInline(block.text, `p${i}`)}
              </p>
            );
        }
      })}
    </div>
  );
}
