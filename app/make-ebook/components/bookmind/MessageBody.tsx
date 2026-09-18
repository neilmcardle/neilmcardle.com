"use client";

import React from "react";
import { linkCitations } from "../../utils/citationLinker";
import type { Chapter } from "../../types";
import styles from "../../styles/studio.module.css";

interface MessageBodyProps {
  content: string;
  chapters: Chapter[];
  streaming?: boolean;
  onNavigate: (chapterIndex: number) => void;
}

type Block =
  { kind: "p"; text: string } | { kind: "ul" | "ol"; items: string[] };

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

function toBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of content.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((l) => l.trim());
    if (lines.length === 0) continue;
    let para: string[] = [];
    let list: { kind: "ul" | "ol"; items: string[] } | null = null;
    const flushPara = () => {
      if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
      para = [];
    };
    const flushList = () => {
      if (list) blocks.push(list);
      list = null;
    };
    for (const line of lines) {
      const kind = BULLET.test(line) ? "ul" : NUMBERED.test(line) ? "ol" : null;
      if (kind) {
        flushPara();
        if (!list || list.kind !== kind) {
          flushList();
          list = { kind, items: [] };
        }
        list.items.push(line.replace(kind === "ul" ? BULLET : NUMBERED, ""));
      } else if (list && /^\s{2,}/.test(line)) {
        list.items[list.items.length - 1] += ` ${line.trim()}`;
      } else {
        flushList();
        para.push(line.trim());
      }
    }
    flushPara();
    flushList();
  }
  return blocks;
}

const INLINE = /\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*|_([^_\s][^_]*?)_|`([^`]+)`/g;

function Inline({
  text,
  chapters,
  onNavigate,
}: {
  text: string;
  chapters: Chapter[];
  onNavigate: (chapterIndex: number) => void;
}) {
  const withCitations = (value: string, key: string) =>
    linkCitations(value, chapters).map((seg, i) =>
      seg.type === "chapter" ? (
        <button
          key={`${key}-${i}`}
          type="button"
          className={styles.cite}
          onClick={() => onNavigate(seg.chapterIndex)}
        >
          {seg.label}
        </button>
      ) : (
        <React.Fragment key={`${key}-${i}`}>{seg.value}</React.Fragment>
      ),
    );

  const out: React.ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const start = m.index ?? 0;
    if (start > last) out.push(withCitations(text.slice(last, start), `t${n}`));
    if (m[1])
      out.push(<strong key={`b${n}`}>{withCitations(m[1], `b${n}`)}</strong>);
    else if (m[2] || m[3])
      out.push(<em key={`i${n}`}>{withCitations(m[2] ?? m[3], `i${n}`)}</em>);
    else if (m[4]) out.push(<code key={`c${n}`}>{m[4]}</code>);
    last = start + m[0].length;
    n += 1;
  }
  if (last < text.length) out.push(withCitations(text.slice(last), "end"));
  return <>{out}</>;
}

export default function MessageBody({
  content,
  chapters,
  streaming = false,
  onNavigate,
}: MessageBodyProps) {
  const blocks = toBlocks(content);
  const caret = streaming ? (
    <span className={styles.bmCaret} aria-hidden="true" />
  ) : null;

  return (
    <div className={styles.bmAnswer}>
      {blocks.map((block, i) => {
        const tail = i === blocks.length - 1 ? caret : null;
        if (block.kind === "p") {
          return (
            <p key={i}>
              <Inline
                text={block.text}
                chapters={chapters}
                onNavigate={onNavigate}
              />
              {tail}
            </p>
          );
        }
        const List = block.kind;
        return (
          <List key={i}>
            {block.items.map((item, j) => (
              <li key={j}>
                <Inline
                  text={item}
                  chapters={chapters}
                  onNavigate={onNavigate}
                />
                {j === block.items.length - 1 ? tail : null}
              </li>
            ))}
          </List>
        );
      })}
      {blocks.length === 0 && caret}
    </div>
  );
}
