"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fit, useScale } from "../lib";
import s from "./nls.module.css";

type Node = { id: string; text: string; link?: string; children?: Node[] };

const DOC: Node[] = [
  {
    id: "1",
    text: "PRODUCE",
    children: [
      { id: "1a", text: "APPLES" },
      { id: "1b", text: "CARROTS" },
      { id: "1c", text: "ORANGES", link: "3a" },
    ],
  },
  {
    id: "2",
    text: "ERRANDS",
    children: [
      {
        id: "2a",
        text: "LIBRARY",
        children: [
          {
            id: "2a1",
            text: "RETURN THE REPORT ON AUGMENTING HUMAN INTELLECT",
          },
        ],
      },
      { id: "2b", text: "PICK UP FILM FOR THE DEMO" },
      { id: "2c", text: "BANK" },
    ],
  },
  {
    id: "3",
    text: "NOTES",
    children: [
      { id: "3a", text: "ORANGES ARE CHEAPER AT THE MARKET ON FRIDAY" },
      { id: "3b", text: "THE BUG NEEDS A BETTER NAME", link: "4" },
    ],
  },
  {
    id: "4",
    text: "IDEAS FOR THE BUG",
    children: [
      { id: "4a", text: "CALL IT A MOUSE. THE CORD LOOKS LIKE A TAIL" },
      { id: "4b", text: "THREE BUTTONS ARE ENOUGH" },
    ],
  },
];

type Flat = { node: Node; depth: number; parents: string[] };

function flatten(
  nodes: Node[],
  depth = 1,
  parents: string[] = [],
  out: Flat[] = [],
) {
  for (const n of nodes) {
    out.push({ node: n, depth, parents });
    if (n.children) flatten(n.children, depth + 1, [...parents, n.id], out);
  }
  return out;
}

const ALL = flatten(DOC);
const CHORDS: Record<string, number[]> = {
  fold: [1, 3],
  level: [2, 4],
  jump: [1, 5],
};

function Screen() {
  const scale = useScale();
  const [level, setLevel] = useState(3);
  const [folded, setFolded] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const [echo, setEcho] = useState("READY");
  const [chord, setChord] = useState<number[]>([]);
  const [bug, setBug] = useState<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const rows = useMemo(
    () =>
      ALL.filter(
        (r) => r.depth <= level && !r.parents.some((p) => folded.has(p)),
      ),
    [level, folded],
  );

  useEffect(() => {
    if (!chord.length) return;
    const t = setTimeout(() => setChord([]), 650);
    return () => clearTimeout(t);
  }, [chord]);

  useEffect(() => {
    if (!flash) return;
    const el = list.current?.querySelector<HTMLElement>(`[data-id="${flash}"]`);
    el?.scrollIntoView({ block: "nearest" });
    const t = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(t);
  }, [flash]);

  const toggle = (id: string) => {
    setFolded((f) => {
      const n = new Set(f);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setChord(CHORDS.fold);
    setEcho(
      `${folded.has(id) ? "UNFOLD" : "FOLD"} STATEMENT ${id.toUpperCase()}`,
    );
  };

  const jump = (id: string) => {
    const target = ALL.find((r) => r.node.id === id);
    if (!target) return;
    setFolded((f) => {
      const n = new Set(f);
      target.parents.forEach((p) => n.delete(p));
      return n;
    });
    setLevel((l) => Math.max(l, target.depth));
    setFlash(id);
    setChord(CHORDS.jump);
    setEcho(`JUMP LINK ${id.toUpperCase()}`);
  };

  const view = (l: number) => {
    setLevel(l);
    setChord(CHORDS.level);
    setEcho(`VIEW LEVELS ${l === 3 ? "ALL" : l}`);
  };

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = box.current!.getBoundingClientRect();
    setBug({ x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale });
  };

  return (
    <div className={s.rig}>
      <div
        ref={box}
        className={s.crt}
        onPointerMove={onMove}
        onPointerLeave={() => setBug(null)}
      >
        <div className={s.head}>
          <span>NLS</span>
          <span>FILE &lt;ERRANDS&gt;</span>
          <span className={s.views}>
            VIEW
            {[1, 2, 3].map((l) => (
              <button
                key={l}
                type="button"
                className={s.cmd}
                aria-pressed={level === l}
                onClick={() => view(l)}
              >
                {l === 3 ? "ALL" : l}
              </button>
            ))}
          </span>
        </div>
        <div ref={list} className={s.doc}>
          {rows.map(({ node, depth }) => {
            const hasKids = !!node.children?.length;
            const isFolded =
              folded.has(node.id) || (hasKids && depth === level);
            return (
              <div
                key={node.id}
                data-id={node.id}
                className={s.row}
                data-flash={flash === node.id || undefined}
                style={{ paddingLeft: (depth - 1) * 26 }}
              >
                <span className={s.num}>{node.id.toUpperCase()}</span>
                {hasKids && depth < level ? (
                  <button
                    type="button"
                    className={s.stmt}
                    onClick={() => toggle(node.id)}
                  >
                    {node.text}
                    {isFolded ? " ..." : ""}
                  </button>
                ) : (
                  <span className={s.text}>
                    {node.text}
                    {hasKids && isFolded ? " ..." : ""}
                  </span>
                )}
                {node.link && (
                  <button
                    type="button"
                    className={s.link}
                    onClick={() => jump(node.link!)}
                  >
                    (SEE {node.link.toUpperCase()})
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className={s.echo} aria-live="polite">
          <span>{echo}</span>
          <span className={s.caret} aria-hidden>
            _
          </span>
        </div>
        {bug && (
          <span
            className={s.bug}
            style={{ left: bug.x, top: bug.y }}
            aria-hidden
          />
        )}
        <div className={s.scan} aria-hidden />
      </div>
      <div className={s.desk} aria-hidden>
        <div className={s.keyset}>
          {[1, 2, 3, 4, 5].map((k) => (
            <span
              key={k}
              className={s.chordKey}
              data-on={chord.includes(k) || undefined}
            />
          ))}
        </div>
        <div className={s.mouse}>
          <span className={s.mouseButtons}>
            <i data-on={chord.length > 0 || undefined} />
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Nls() {
  return (
    <Fit width={640} height={500}>
      <Screen />
    </Fit>
  );
}
