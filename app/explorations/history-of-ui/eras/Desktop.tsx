"use client";

import { useEffect, useRef, useState } from "react";
import { Fit, useScale } from "../lib";
import s from "./desktop.module.css";

const DW = 640;
const DH = 420;

type IconKind = "disk" | "doc" | "folder" | "trash";
type WinKind = "disk" | "readme" | "notes" | "about" | "folder";
type Item = {
  id: string;
  label: string;
  kind: IconKind;
  x: number;
  y: number;
  opens?: WinKind;
  trashable?: boolean;
};
type Win = {
  id: WinKind;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
};
type Rect = { x: number; y: number; w: number; h: number };

const WINDOWS: Record<WinKind, Omit<Win, "id">> = {
  disk: { title: "System Disk", x: 34, y: 46, w: 320, h: 190 },
  readme: { title: "Read Me", x: 120, y: 84, w: 340, h: 230 },
  notes: { title: "Notes", x: 196, y: 120, w: 300, h: 210 },
  about: { title: "About This Desktop", x: 160, y: 120, w: 300, h: 140 },
  folder: { title: "Empty Folder", x: 250, y: 170, w: 230, h: 140 },
};

const HOME: Item[] = [
  {
    id: "disk",
    label: "System Disk",
    kind: "disk",
    x: 556,
    y: 40,
    opens: "disk",
  },
  {
    id: "readme",
    label: "Read Me",
    kind: "doc",
    x: 556,
    y: 116,
    opens: "readme",
    trashable: true,
  },
  { id: "trash", label: "Trash", kind: "trash", x: 556, y: 340 },
];

const DISK: Item[] = [
  { id: "d-notes", label: "Notes", kind: "doc", x: 20, y: 14, opens: "notes" },
  {
    id: "d-readme",
    label: "Read Me",
    kind: "doc",
    x: 110,
    y: 14,
    opens: "readme",
  },
  {
    id: "d-folder",
    label: "Empty Folder",
    kind: "folder",
    x: 200,
    y: 14,
    opens: "folder",
  },
];

function Glyph({ kind, full }: { kind: IconKind; full?: boolean }) {
  const c = "currentColor";
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {kind === "doc" && (
        <g fill="none" stroke={c}>
          <path d="M6.5 2.5h14l6 6v21h-20z" fill="var(--fill)" />
          <path d="M20.5 2.5v6h6" />
          <path d="M10 13.5h12M10 17.5h12M10 21.5h12M10 25.5h8" />
        </g>
      )}
      {kind === "disk" && (
        <g stroke={c}>
          <path d="M3.5 3.5h22l3 3v22h-25z" fill="var(--fill)" />
          <path d="M8.5 3.5h14v8h-14z" fill="none" />
          <path d="M17 5h3v5h-3z" fill={c} stroke="none" />
          <path d="M7.5 17.5h17v11h-17z" fill="none" />
        </g>
      )}
      {kind === "folder" && (
        <g stroke={c}>
          <path d="M2.5 8.5h10l2 -3h6v3h9v18h-27z" fill="var(--fill)" />
          <path d="M2.5 11.5h27" fill="none" />
        </g>
      )}
      {kind === "trash" && (
        <g stroke={c} fill="var(--fill)">
          {full ? (
            <>
              <path d="M5.5 10.5c0 -3 21 -3 21 0l-2 18h-17z" />
              <path d="M8 7.5c3 -4 13 -4 16 0" fill="none" />
              <path d="M11 13v13M16 13v13M21 13v13" fill="none" />
            </>
          ) : (
            <>
              <path d="M6.5 9.5h19l-2 19h-15z" />
              <path d="M4.5 6.5h23v3h-23zM13.5 3.5h5v3h-5z" />
              <path d="M11 12v14M16 12v14M21 12v14" fill="none" />
            </>
          )}
        </g>
      )}
    </svg>
  );
}

type MenuItem = {
  label: string;
  run?: () => void;
  disabled?: boolean;
  check?: boolean;
  rule?: boolean;
};

function Screen() {
  const scale = useScale();
  const root = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>(HOME);
  const [wins, setWins] = useState<Win[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [trash, setTrash] = useState<string[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [byName, setByName] = useState(false);
  const [ghost, setGhost] = useState<Rect | null>(null);
  const [zooms, setZooms] = useState<{ key: number; from: Rect; to: Rect }[]>(
    [],
  );
  const [notes, setNotes] = useState(
    "Type here.\n\nWhat you see on the screen is what comes out of the printer.",
  );
  const action = useRef<
    | {
        kind: "icon";
        id: string;
        sx: number;
        sy: number;
        ox: number;
        oy: number;
        moved: boolean;
      }
    | {
        kind: "win";
        id: WinKind;
        sx: number;
        sy: number;
        ox: number;
        oy: number;
      }
    | null
  >(null);
  const lastTap = useRef<{ id: string; t: number }>({ id: "", t: 0 });
  const openedAt = useRef(0);
  const folders = useRef(0);

  const pt = (e: { clientX: number; clientY: number }) => {
    const r = root.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };

  const rectOf = (el: Element): Rect => {
    const r = root.current!.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return {
      x: (b.left - r.left) / scale,
      y: (b.top - r.top) / scale,
      w: b.width / scale,
      h: b.height / scale,
    };
  };

  const front = (id: WinKind) =>
    setWins((ws) => {
      const w = ws.find((x) => x.id === id);
      return w ? [...ws.filter((x) => x.id !== id), w] : ws;
    });

  const open = (kind: WinKind, from?: Rect) => {
    if (wins.some((w) => w.id === kind)) {
      front(kind);
      return;
    }
    const spec = WINDOWS[kind];
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (from && !reduce) {
      const key = Date.now();
      setZooms((z) => [
        ...z,
        { key, from, to: { x: spec.x, y: spec.y, w: spec.w, h: spec.h } },
      ]);
      window.setTimeout(() => {
        setZooms((z) => z.filter((x) => x.key !== key));
        setWins((ws) => [
          ...ws.filter((w) => w.id !== kind),
          { id: kind, ...spec },
        ]);
      }, 260);
    } else {
      setWins((ws) => [...ws, { id: kind, ...spec }]);
    }
  };

  const close = (id: WinKind) => setWins((ws) => ws.filter((w) => w.id !== id));

  const tapIcon = (e: React.PointerEvent, item: Item, draggable: boolean) => {
    e.stopPropagation();
    setMenu(null);
    setSelected(item.id);
    const now = performance.now();
    const isDouble =
      lastTap.current.id === item.id && now - lastTap.current.t < 450;
    lastTap.current = { id: item.id, t: now };
    if (isDouble) {
      lastTap.current = { id: "", t: 0 };
      if (item.opens) open(item.opens, rectOf(e.currentTarget));
      return;
    }
    if (draggable) {
      const p = pt(e);
      action.current = {
        kind: "icon",
        id: item.id,
        sx: p.x,
        sy: p.y,
        ox: item.x,
        oy: item.y,
        moved: false,
      };
      root.current!.setPointerCapture(e.pointerId);
    }
  };

  const grabWin = (e: React.PointerEvent, w: Win) => {
    e.stopPropagation();
    setMenu(null);
    front(w.id);
    const p = pt(e);
    action.current = {
      kind: "win",
      id: w.id,
      sx: p.x,
      sy: p.y,
      ox: w.x,
      oy: w.y,
    };
    root.current!.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const a = action.current;
    if (!a) return;
    const p = pt(e);
    const dx = p.x - a.sx;
    const dy = p.y - a.sy;
    if (a.kind === "icon") {
      if (!a.moved && Math.hypot(dx, dy) < 4) return;
      a.moved = true;
      setGhost({ x: a.ox + dx, y: a.oy + dy, w: 72, h: 54 });
    } else {
      const w = wins.find((x) => x.id === a.id);
      if (!w) return;
      setGhost({
        x: Math.max(-w.w + 60, Math.min(DW - 40, a.ox + dx)),
        y: Math.max(22, Math.min(DH - 22, a.oy + dy)),
        w: w.w,
        h: w.h,
      });
    }
  };

  const onUp = () => {
    const a = action.current;
    action.current = null;
    const g = ghost;
    setGhost(null);
    if (!a || !g) return;
    if (a.kind === "win") {
      setWins((ws) =>
        ws.map((w) => (w.id === a.id ? { ...w, x: g.x, y: g.y } : w)),
      );
      return;
    }
    const t = items.find((i) => i.id === "trash")!;
    const item = items.find((i) => i.id === a.id)!;
    const cx = g.x + 36;
    const cy = g.y + 20;
    if (
      item.trashable &&
      Math.abs(cx - (t.x + 36)) < 40 &&
      Math.abs(cy - (t.y + 20)) < 34
    ) {
      setItems((is) => is.filter((i) => i.id !== a.id));
      setTrash((tr) => [...tr, a.id]);
      setSelected("trash");
      return;
    }
    setItems((is) =>
      is.map((i) =>
        i.id === a.id
          ? {
              ...i,
              x: Math.max(0, Math.min(DW - 72, g.x)),
              y: Math.max(24, Math.min(DH - 54, g.y)),
            }
          : i,
      ),
    );
  };

  useEffect(() => {
    if (!menu) return;
    const up = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-menu-item]")) return;
      const onTitle = t.closest("[data-menu-title]");
      if (performance.now() - openedAt.current < 320 && onTitle) return;
      setMenu(null);
    };
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-menu-title]") && !t.closest("[data-menu-item]"))
        setMenu(null);
    };
    document.addEventListener("pointerup", up);
    document.addEventListener("pointerdown", down);
    return () => {
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointerdown", down);
    };
  }, [menu]);

  const selectedItem = [...items, ...DISK].find((i) => i.id === selected);
  const top = wins[wins.length - 1];

  const MENUS: { id: string; label: string; items: MenuItem[] }[] = [
    {
      id: "sys",
      label: "sys",
      items: [{ label: "About This Desktop…", run: () => open("about") }],
    },
    {
      id: "file",
      label: "File",
      items: [
        {
          label: "New Folder",
          run: () => {
            folders.current++;
            const n = folders.current;
            setItems((is) => [
              ...is,
              {
                id: `folder-${n}`,
                label: n === 1 ? "Empty Folder" : `Empty Folder ${n}`,
                kind: "folder",
                x: 470 - ((n - 1) % 4) * 80,
                y: 300 - Math.floor((n - 1) / 4) * 70,
                opens: "folder",
                trashable: true,
              },
            ]);
          },
        },
        {
          label: "Open",
          disabled: !selectedItem?.opens,
          run: () => selectedItem?.opens && open(selectedItem.opens),
        },
        { label: "Close", disabled: !top, run: () => top && close(top.id) },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { label: "Undo", disabled: true },
        { label: "", rule: true },
        { label: "Cut", disabled: true },
        { label: "Copy", disabled: true },
        { label: "Paste", disabled: true },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { label: "by Icon", check: !byName, run: () => setByName(false) },
        { label: "by Name", check: byName, run: () => setByName(true) },
      ],
    },
    {
      id: "special",
      label: "Special",
      items: [
        {
          label: "Clean Up",
          run: () =>
            setItems((is) => {
              let row = 0;
              return is.map((i) => {
                if (i.id === "trash") return { ...i, x: 556, y: 340 };
                const next = {
                  ...i,
                  x: 556 - Math.floor(row / 4) * 84,
                  y: 40 + (row % 4) * 76,
                };
                row++;
                return next;
              });
            }),
        },
        {
          label: "Empty Trash",
          disabled: !trash.length,
          run: () => setTrash([]),
        },
      ],
    },
  ];

  const renderIcon = (item: Item, draggable: boolean) => (
    <button
      key={item.id}
      type="button"
      className={s.icon}
      data-selected={selected === item.id || undefined}
      style={{ left: item.x, top: item.y }}
      onPointerDown={(e) => tapIcon(e, item, draggable)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && item.opens)
          open(item.opens, rectOf(e.currentTarget));
      }}
      onFocus={() => setSelected(item.id)}
      aria-label={`${item.label}${item.opens ? ", press Enter to open" : ""}`}
    >
      <span className={s.glyph}>
        <Glyph
          kind={item.kind}
          full={item.kind === "trash" && trash.length > 0}
        />
      </span>
      <span className={s.label}>{item.label}</span>
    </button>
  );

  return (
    <div
      ref={root}
      className={s.screen}
      data-fine={scale >= 0.98 || undefined}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerDown={() => {
        setSelected(null);
        setMenu(null);
      }}
    >
      <div className={s.menubar} role="menubar">
        {MENUS.map((m) => (
          <div key={m.id} className={s.menuWrap}>
            <button
              type="button"
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={menu === m.id}
              className={s.menuTitle}
              data-menu-title
              data-open={menu === m.id || undefined}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (menu === m.id) {
                  setMenu(null);
                  return;
                }
                openedAt.current = performance.now();
                setHover(null);
                setMenu(m.id);
              }}
              onPointerEnter={() => {
                if (menu && menu !== m.id) {
                  openedAt.current = 0;
                  setMenu(m.id);
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === " " ||
                  e.key === "ArrowDown"
                ) {
                  e.preventDefault();
                  openedAt.current = performance.now();
                  setMenu(m.id);
                }
                if (e.key === "Escape") setMenu(null);
              }}
            >
              {m.id === "sys" ? (
                <svg
                  viewBox="0 0 11 11"
                  width="11"
                  height="11"
                  shapeRendering="crispEdges"
                  aria-label="System"
                >
                  <path
                    d="M4 0h3v1h1v1h1v1h1v1h1v3h-1v1h-1v1h-1v1h-1v1h-3v-1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1h1v-1h1v-1h1z"
                    fill="currentColor"
                  />
                  <path d="M5 3h1v5h-1zM3 5h5v1h-5z" fill="var(--hole, #fff)" />
                </svg>
              ) : (
                m.label
              )}
            </button>
            {menu === m.id && (
              <div className={s.menu} role="menu">
                {m.items.map((it, i) =>
                  it.rule ? (
                    <div key={i} className={s.rule} />
                  ) : (
                    <button
                      key={it.label}
                      type="button"
                      role="menuitem"
                      data-menu-item
                      className={s.menuItem}
                      disabled={it.disabled}
                      data-hover={hover === it.label || undefined}
                      onPointerEnter={() => setHover(it.label)}
                      onPointerLeave={() => setHover(null)}
                      onPointerUp={() => {
                        if (it.disabled) return;
                        it.run?.();
                        setMenu(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !it.disabled) {
                          it.run?.();
                          setMenu(null);
                        }
                        if (e.key === "Escape") setMenu(null);
                      }}
                    >
                      <span className={s.check}>{it.check ? "✓" : ""}</span>
                      {it.label}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {items.map((i) => renderIcon(i, i.id !== "trash"))}

      {wins.map((w, idx) => {
        const active = idx === wins.length - 1;
        return (
          <section
            key={w.id}
            className={s.win}
            data-active={active || undefined}
            style={{
              left: w.x,
              top: w.y,
              width: w.w,
              height: w.h,
              zIndex: 10 + idx,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenu(null);
              front(w.id);
            }}
            aria-label={w.title}
          >
            <header className={s.titlebar} onPointerDown={(e) => grabWin(e, w)}>
              <button
                type="button"
                className={s.closeBox}
                aria-label={`Close ${w.title}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => close(w.id)}
              />
              <span className={s.winTitle}>{w.title}</span>
            </header>
            <div className={s.winBody}>
              {w.id === "disk" &&
                (byName ? (
                  <table className={s.list}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Kind</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DISK.map((d) => (
                        <tr
                          key={d.id}
                          data-selected={selected === d.id || undefined}
                          onPointerDown={(e) => tapIcon(e, d, false)}
                        >
                          <td>{d.label}</td>
                          <td>
                            {d.kind === "folder"
                              ? "–"
                              : d.id === "d-notes"
                                ? "1K"
                                : "2K"}
                          </td>
                          <td>{d.kind === "folder" ? "folder" : "document"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={s.iconField}>
                    {DISK.map((d) => renderIcon(d, false))}
                  </div>
                ))}
              {w.id === "readme" && (
                <div className={s.text}>
                  <p>
                    Everything here is a picture of something you already own: a
                    desk, a sheet of paper, a folder and a bin.
                  </p>
                  <p>
                    Point at a thing, then pick what to do with it from the menu
                    at the top. The menu is always in the same place, in every
                    program.
                  </p>
                  <p>Try dragging this document to the Trash.</p>
                </div>
              )}
              {w.id === "notes" && (
                <textarea
                  className={s.notes}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label="Notes"
                />
              )}
              {w.id === "about" && (
                <div className={s.text}>
                  <p>
                    512 × 342 pixels, and every one of them is either black or
                    white.
                  </p>
                  <p>128K of memory. One floppy disk. No hard drive.</p>
                </div>
              )}
              {w.id === "folder" && <div className={s.empty}>0 items</div>}
              {w.id !== "about" && <span className={s.grow} aria-hidden />}
            </div>
          </section>
        );
      })}

      {zooms.map((z) => (
        <Zoom key={z.key} from={z.from} to={z.to} />
      ))}

      {ghost && (
        <div
          className={s.ghost}
          style={{
            left: ghost.x,
            top: ghost.y,
            width: ghost.w,
            height: ghost.h,
          }}
        />
      )}
    </div>
  );
}

function Zoom({ from, to }: { from: Rect; to: Rect }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    refs.current.forEach((el, i) => {
      el?.animate(
        [
          {
            left: `${from.x}px`,
            top: `${from.y}px`,
            width: `${from.w}px`,
            height: `${from.h}px`,
            opacity: 1,
          },
          {
            left: `${to.x}px`,
            top: `${to.y}px`,
            width: `${to.w}px`,
            height: `${to.h}px`,
            opacity: 1,
          },
        ],
        { duration: 200, delay: i * 30, easing: "linear", fill: "both" },
      );
    });
  }, [from, to]);
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={s.zoom}
        />
      ))}
    </>
  );
}

export default function Desktop() {
  return (
    <div className={s.outer}>
      <div className={s.bezel}>
        <Fit width={DW} height={DH}>
          <Screen />
        </Fit>
      </div>
    </div>
  );
}
