"use client";

import type React from "react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "./logomark";
import type { LandingCover } from "./landing-data";
import styles from "./landing.module.css";

const SUB_GENRES = ["psychological", "domestic", "procedural", "spy"];

const FAMILIES = [
  { id: "red", swatch: "#d13a2c" },
  { id: "orange", swatch: "#e8812d" },
  { id: "yellow", swatch: "#e8c33a" },
  { id: "teal", swatch: "#2f8f8a" },
  { id: "blue", swatch: "#2e5fa8" },
  { id: "pink", swatch: "#e27aa5" },
];

const LABELS: Record<string, string> = {
  psychological: "Psychological",
  domestic: "Domestic",
  procedural: "Procedural",
  spy: "Spy",
  legal: "Legal",
  photographic: "Photographic",
  illustrated: "Illustrated",
  mixed: "Mixed",
  "type-only": "Type only",
  sans: "Sans serif",
  serif: "Serif",
  "hand-lettered": "Hand lettered",
  script: "Script",
  "full-bleed-art": "Full-bleed art",
  "photographic-object": "Photographic object",
  typographic: "Typographic",
  "framed-panel": "Framed panel",
};

const label = (value: string) => LABELS[value] ?? value;

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={LOGOMARK_VIEWBOX}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={LOGOMARK_PATH} />
    </svg>
  );
}

export function CropMarks() {
  return (
    <span className={styles.cropMarks} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function coverStyle(cover: LandingCover): React.CSSProperties {
  return {
    backgroundImage: `url(${cover.src})`,
    backgroundColor: cover.colors[0] ?? "#999",
  };
}

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold]);
  return [ref, inView] as const;
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 13.5S2 10 2 5.8A3 3 0 0 1 8 4.4a3 3 0 0 1 6 1.4C14 10 8 13.5 8 13.5z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Plus({ done }: { done: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={done ? "M3.5 8.5l3 3 6-7" : "M8 3v10M3 8h10"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Window({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.window} ${className}`}>
      <div className={styles.titlebar}>
        <div className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className={styles.titleText}>{title}</span>
        <span />
      </div>
      {children}
    </div>
  );
}

const FAN = [
  { rotate: -20, x: -124, y: 12 },
  { rotate: -10, x: -63, y: -1 },
  { rotate: 0, x: 0, y: -10 },
  { rotate: 10, x: 63, y: -1 },
  { rotate: 20, x: 124, y: 12 },
];

function pickFan(covers: LandingCover[]) {
  const picked: LandingCover[] = [];
  const seen = new Set<string>();
  for (const c of covers) {
    const key = c.families[0] ?? c.id;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(c);
    if (picked.length === 5) break;
  }
  return picked.length === 5 ? picked : covers.slice(0, 5);
}

function shuffle(covers: LandingCover[]) {
  const pool = covers.slice(0, 200);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

const subscribeToNothing = () => () => {};

export function HeroFan({ covers }: { covers: LandingCover[] }) {
  const dealt = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const fan = useMemo(
    () => (dealt ? pickFan(shuffle(covers)) : pickFan(covers)),
    [dealt, covers],
  );

  return (
    <div className={`${styles.booth} ${styles.fan}`}>
      <CropMarks />
      {fan.map((c, i) => (
        <span
          key={c.id}
          className={`${styles.fanCover} ${dealt ? styles.fanDeal : ""}`}
          role="img"
          aria-label={`${c.title} by ${c.author}`}
          style={{
            backgroundImage: `url(${c.src})`,
            backgroundColor: c.colors[0],
            transform: `translate(calc(-50% + ${FAN[i].x}%), calc(-50% + ${FAN[i].y}%)) rotate(${FAN[i].rotate}deg)`,
            zIndex: i === 2 ? 3 : i === 1 || i === 3 ? 2 : 1,
            animationDelay: dealt ? `${Math.abs(i - 2) * 70}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function BrowseDemo({
  covers,
  count,
}: {
  covers: LandingCover[];
  count: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [sub, setSub] = useState<string | null>(null);
  const [family, setFamily] = useState<string | null>(null);
  const [tone, setTone] = useState<"all" | "light" | "dark">("all");
  const [liked, setLiked] = useState<string[]>([]);
  const [board, setBoard] = useState<string[]>([]);
  const [deckOpen, setDeckOpen] = useState(false);
  const touched = useRef(false);
  const seeded = useRef(false);

  const filtered = useMemo(
    () =>
      covers.filter(
        (c) =>
          (!sub || c.subGenre === sub) &&
          (!family || c.families.includes(family)) &&
          (tone === "all" || (tone === "dark") === c.dark),
      ),
    [covers, sub, family, tone],
  );

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const steps: [number, () => void][] = [
      [900, () => setSub("psychological")],
      [1800, () => setFamily("red")],
    ];
    const timers = steps.map(([delay, run]) =>
      window.setTimeout(() => {
        if (!touched.current) run();
      }, delay),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView]);

  useEffect(() => {
    if (!inView || sub !== "psychological" || family !== "red") return;
    if (touched.current || seeded.current) return;
    seeded.current = true;
    const picks = filtered.slice(0, 3).map((c) => c.id);
    const timers = picks.map((id, i) =>
      window.setTimeout(
        () => {
          if (!touched.current)
            setBoard((prev) => (prev.includes(id) ? prev : [...prev, id]));
        },
        700 + i * 450,
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView, sub, family, filtered]);

  const act =
    <T,>(fn: (value: T) => void) =>
    (value: T) => {
      touched.current = true;
      fn(value);
    };

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const boardCovers = board
    .map((id) => covers.find((c) => c.id === id))
    .filter((c): c is LandingCover => Boolean(c));
  const deckCovers = [
    ...boardCovers,
    ...filtered.filter((c) => !board.includes(c.id)),
  ].slice(0, 5);

  return (
    <div
      ref={ref}
      style={{ width: "100%", display: "grid", placeItems: "center" }}
    >
      <Window title="coverly  ·  Browse" className={styles.browse}>
        <div className={styles.toolbar}>
          <div className={styles.group} role="group" aria-label="Sub-genre">
            <span className={styles.groupLabel}>Sub-genre</span>
            {SUB_GENRES.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={sub === g}
                className={`${styles.chip} ${sub === g ? styles.chipOn : ""}`}
                onClick={() => act(setSub)(sub === g ? null : g)}
              >
                {label(g)}
              </button>
            ))}
          </div>
          <div className={styles.group} role="group" aria-label="Colour">
            <span className={styles.groupLabel}>Colour</span>
            {FAMILIES.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={family === f.id}
                aria-label={f.id}
                className={`${styles.dotChip} ${family === f.id ? styles.dotOn : ""}`}
                style={{ background: f.swatch }}
                onClick={() => act(setFamily)(family === f.id ? null : f.id)}
              />
            ))}
          </div>
          <div className={styles.seg} role="group" aria-label="Tone">
            {(["all", "light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tone === t}
                className={`${styles.segItem} ${tone === t ? styles.segOn : ""}`}
                onClick={() => act(setTone)(t)}
              >
                {t === "all" ? "Any tone" : t === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.countLine}>
          <span>
            {filtered.length} of {count.toLocaleString("en-GB")} covers
          </span>
          <span>{liked.length} liked</span>
        </div>
        <div className={styles.gridArea}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>No covers match. Loosen a filter.</p>
          ) : (
            <div className={styles.grid}>
              {filtered.slice(0, 18).map((c) => {
                const isLiked = liked.includes(c.id);
                const saved = board.includes(c.id);
                return (
                  <div key={c.id} className={styles.tileWrap}>
                    <div
                      className={styles.coverTile}
                      style={coverStyle(c)}
                      role="img"
                      aria-label={`${c.title} by ${c.author}`}
                    />
                    <div
                      className={`${styles.tileActions} ${saved ? styles.actionsOn : ""}`}
                    >
                      <button
                        type="button"
                        className={`${styles.iconButton} ${isLiked ? styles.iconOn : ""}`}
                        aria-label={isLiked ? "Unlike" : "Like"}
                        aria-pressed={isLiked}
                        onClick={() => act(setLiked)(toggle(liked, c.id))}
                      >
                        <Heart filled={isLiked} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconButton} ${saved ? styles.iconOn : ""}`}
                        aria-label={
                          saved ? "Remove from board" : "Save to board"
                        }
                        aria-pressed={saved}
                        onClick={() => act(setBoard)(toggle(board, c.id))}
                      >
                        <Plus done={saved} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={styles.tray}>
          <div className={styles.trayLabel}>
            <b>Psychological comps</b>
            <span>
              {board.length} {board.length === 1 ? "cover" : "covers"} on the
              board
            </span>
          </div>
          <div className={styles.trayCovers} aria-live="polite">
            {boardCovers.length === 0 ? (
              <span className={styles.trayEmpty}>
                Save covers to build a board.
              </span>
            ) : (
              boardCovers.map((c) => (
                <span
                  key={c.id}
                  className={styles.trayCover}
                  style={coverStyle(c)}
                  role="img"
                  aria-label={c.title}
                />
              ))
            )}
          </div>
          <button
            type="button"
            className={`${styles.redButton} ${styles.small}`}
            onClick={() => act(setDeckOpen)(true)}
          >
            Export deck
          </button>
        </div>
        {deckOpen && (
          <div
            className={styles.deckOverlay}
            role="dialog"
            aria-label="Comparison deck preview"
          >
            <div
              style={{ display: "grid", justifyItems: "center", width: "100%" }}
            >
              <div className={styles.deckSheet}>
                <div className={styles.deckHead}>
                  <span className={styles.deckTitle}>Psychological comps</span>
                  <span className={styles.deckMeta}>Comparison deck · A4</span>
                </div>
                <div className={styles.deckRow}>
                  {deckCovers.map((c) => (
                    <div key={c.id} className={styles.deckItem}>
                      <div className={styles.deckCover} style={coverStyle(c)} />
                      <div className={styles.deckCaption}>
                        {c.title}
                        <span>
                          {c.author} · {c.imprint}
                          {c.year ? ` · ${c.year}` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.deckFoot}>
                  <span>coverly</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
              <div className={styles.deckActions}>
                <button
                  type="button"
                  className={`${styles.ghostButton} ${styles.small}`}
                  style={{ background: "#fbfbf9" }}
                  onClick={() => setDeckOpen(false)}
                >
                  Close preview
                </button>
              </div>
            </div>
          </div>
        )}
      </Window>
    </div>
  );
}

function hexToHsl(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  return { h: hue * 60, s, l };
}

export function ColourMapDemo({ covers }: { covers: LandingCover[] }) {
  const [band, setBand] = useState<string | null>("red");
  const [hover, setHover] = useState<string | null>(null);

  const points = useMemo(
    () =>
      covers.slice(0, 320).map((c) => {
        const { h, l } = hexToHsl(c.colors[0]);
        return { cover: c, x: 3 + (h / 360) * 94, y: 94 - l * 88 };
      }),
    [covers],
  );
  const inBand = band
    ? points.filter((p) => p.cover.families.includes(band))
    : [];
  const hovered = points.find((p) => p.cover.id === hover);

  return (
    <div className={styles.mapWrap}>
      <div className={styles.map} onMouseLeave={() => setHover(null)}>
        <span className={styles.mapAxis} style={{ left: 10, top: 8 }}>
          light
        </span>
        <span className={styles.mapAxis} style={{ left: 10, bottom: 8 }}>
          dark
        </span>
        <span className={styles.mapAxis} style={{ right: 10, bottom: 8 }}>
          hue
        </span>
        {points.map((p) => (
          <button
            key={p.cover.id}
            type="button"
            className={`${styles.mapDot} ${band && !p.cover.families.includes(band) ? styles.mapDim : ""}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: p.cover.colors[0],
            }}
            aria-label={p.cover.title}
            onMouseEnter={() => setHover(p.cover.id)}
            onFocus={() => setHover(p.cover.id)}
          />
        ))}
        {hovered && (
          <span
            className={styles.mapPreview}
            style={{
              left: `${hovered.x}%`,
              top: `${hovered.y}%`,
              ...coverStyle(hovered.cover),
            }}
          />
        )}
      </div>
      <div className={styles.bands} role="group" aria-label="Colour band">
        {FAMILIES.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={band === f.id}
            className={`${styles.chip} ${band === f.id ? styles.chipOn : ""}`}
            style={{ background: band === f.id ? undefined : "#fbfbf9" }}
            onClick={() => setBand(band === f.id ? null : f.id)}
          >
            {f.id[0].toUpperCase() + f.id.slice(1)}
          </button>
        ))}
      </div>
      <div className={styles.bandPick} aria-live="polite">
        {inBand.slice(0, 9).map((p) => (
          <span
            key={p.cover.id}
            className={styles.trayCover}
            style={coverStyle(p.cover)}
            role="img"
            aria-label={p.cover.title}
          />
        ))}
      </div>
    </div>
  );
}

function colourDistance(a: string[], b: string[]) {
  const rgb = (hex: string) => {
    const h = hex.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  };
  const top = (list: string[]) => list.slice(0, 3).map(rgb);
  const A = top(a);
  const B = top(b);
  return A.reduce(
    (sum, ca) =>
      sum +
      Math.min(
        ...B.map((cb) =>
          Math.hypot(ca[0] - cb[0], ca[1] - cb[1], ca[2] - cb[2]),
        ),
      ),
    0,
  );
}

export function SimilarDemo({ covers }: { covers: LandingCover[] }) {
  const pool = useMemo(() => covers.slice(0, 260), [covers]);
  const [mainId, setMainId] = useState(() => covers[7]?.id ?? covers[0]?.id);
  const main = pool.find((c) => c.id === mainId) ?? pool[0];

  const similar = useMemo(() => {
    if (!main) return [];
    return pool
      .filter((c) => c.id !== main.id)
      .map((c) => ({
        cover: c,
        score:
          colourDistance(main.colors, c.colors) -
          (c.subGenre === main.subGenre ? 60 : 0) -
          (c.typography === main.typography ? 40 : 0) -
          (c.layout === main.layout ? 30 : 0),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 4)
      .map((s) => s.cover);
  }, [main, pool]);

  if (!main) return null;

  return (
    <div className={styles.similarWrap}>
      <div
        className={`${styles.coverTile} ${styles.similarMain}`}
        style={coverStyle(main)}
        role="img"
        aria-label={`${main.title} by ${main.author}`}
      />
      <div>
        <p className={styles.similarLabel}>Sits beside</p>
        <div className={styles.similarGrid}>
          {similar.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.similarButton}
              onClick={() => setMainId(c.id)}
              aria-label={`Open ${c.title}`}
            >
              <span className={styles.coverTile} style={coverStyle(c)} />
              <span className={styles.similarMeta}>
                {c.title}
                <span>{c.author}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SpecsDemo({ covers }: { covers: LandingCover[] }) {
  const cover =
    covers.find(
      (c) => c.colors.length >= 5 && c.isbn && c.artStyle === "illustrated",
    ) ?? covers[0];
  const [copied, setCopied] = useState("");

  if (!cover) return null;

  const copy = async (value: string, what: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(`Copied ${what}`);
    } catch {
      setCopied("Copy is blocked in this browser");
    }
    window.setTimeout(() => setCopied(""), 1600);
  };

  return (
    <div className={styles.specs}>
      <div
        className={styles.coverTile}
        style={{ ...coverStyle(cover), cursor: "default" }}
        role="img"
        aria-label={`${cover.title} by ${cover.author}`}
      />
      <div>
        <p className={styles.specTitle}>{cover.title}</p>
        <p className={styles.specBy}>{cover.author}</p>
        <div className={styles.swatches}>
          {cover.colors.slice(0, 5).map((hex) => (
            <button
              key={hex}
              type="button"
              className={styles.swatchButton}
              onClick={() => copy(hex, hex)}
              aria-label={`Copy ${hex}`}
            >
              <span className={styles.swatchChip} style={{ background: hex }} />
              <span className={styles.swatchHex}>{hex}</span>
            </button>
          ))}
        </div>
        <dl className={styles.specList}>
          <dt>Imprint</dt>
          <dd>{cover.imprint}</dd>
          <dt>Year</dt>
          <dd>{cover.year ?? "Unknown"}</dd>
          <dt>Art</dt>
          <dd>
            {label(cover.artStyle)} · {label(cover.layout)}
          </dd>
          <dt>Type</dt>
          <dd>{label(cover.typography)}</dd>
          <dt>ISBN</dt>
          <dd>
            <button
              type="button"
              className={`${styles.swatchButton} ${styles.mono}`}
              onClick={() => copy(cover.isbn, "ISBN")}
            >
              {cover.isbn}
            </button>
          </dd>
        </dl>
        <p className={styles.copied} aria-live="polite">
          {copied}
        </p>
      </div>
    </div>
  );
}

export function ViewsCard({ covers }: { covers: LandingCover[] }) {
  const [view, setView] = useState<"grid" | "shelf">("grid");
  const set = covers.slice(20, 30);
  return (
    <div className={styles.viewsDemo}>
      <div
        className={styles.seg}
        role="group"
        aria-label="View"
        style={{ justifySelf: "center" }}
      >
        {(["grid", "shelf"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            className={`${styles.segItem} ${view === v ? styles.segOn : ""}`}
            onClick={() => setView(v)}
          >
            {v === "grid" ? "Grid" : "Bookshelf"}
          </button>
        ))}
      </div>
      <div className={styles.viewsBody}>
        {view === "grid" ? (
          <div className={styles.viewsGrid}>
            {set.map((c) => (
              <span
                key={c.id}
                className={styles.trayCover}
                style={{ ...coverStyle(c), width: "100%" }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.viewsShelf}>
            {set.slice(0, 5).map((c, i) => (
              <span
                key={c.id}
                className={styles.trayCover}
                style={{ ...coverStyle(c), width: 48 + ((i * 7) % 12) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SoundCard({ covers }: { covers: LandingCover[] }) {
  const [on, setOn] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const tick = () => {
    if (!on) return;
    if (!audio.current) {
      audio.current = new Audio("/coverly/tick-pop.mp3");
      audio.current.volume = 0.35;
    }
    audio.current.currentTime = 0;
    audio.current.play().catch(() => undefined);
  };

  return (
    <div className={styles.soundDemo}>
      <div className={styles.soundRow}>
        {covers.slice(40, 45).map((c) => (
          <span
            key={c.id}
            className={styles.coverTile}
            style={{ ...coverStyle(c), cursor: "default" }}
            onMouseEnter={tick}
          />
        ))}
      </div>
      <button
        type="button"
        className={`${styles.ghostButton} ${styles.small}`}
        aria-pressed={on}
        onClick={() => setOn((v) => !v)}
        style={{ background: "#fbfbf9" }}
      >
        {on ? "Sound on, hover a cover" : "Turn hover sound on"}
      </button>
    </div>
  );
}

export function HueRibbon({
  covers,
  count,
}: {
  covers: LandingCover[];
  count: number;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const stripes = useMemo(
    () =>
      covers
        .map((c) => ({ cover: c, hue: hexToHsl(c.colors[0]).h }))
        .sort((a, b) => a.hue - b.hue),
    [covers],
  );
  const active = hover === null ? null : stripes[hover];
  const left = hover === null ? 0 : ((hover + 0.5) / stripes.length) * 100;

  return (
    <div className={styles.ribbonWrap} onPointerLeave={() => setHover(null)}>
      <h2
        className={`${styles.sectionTitle} ${styles.ribbonHead} ${styles.display}`}
      >
        Search by hue
      </h2>
      <div className={styles.ribbonShelf}>
        {active && (
          <span
            key={active.cover.id}
            className={styles.pulled}
            style={{ left: `${left}%`, ...coverStyle(active.cover) }}
            role="img"
            aria-label={`${active.cover.title} by ${active.cover.author}`}
          />
        )}
      </div>
      <div
        className={styles.ribbon}
        role="img"
        aria-label={`Covers from the catalogue, ordered by hue, ${count} covers in total`}
      >
        {stripes.map((s, i) => (
          <span
            key={s.cover.id}
            className={`${styles.stripe} ${hover === i ? styles.stripeUp : ""}`}
            style={{ background: s.cover.colors[0] }}
            onPointerEnter={() => setHover(i)}
          />
        ))}
      </div>
      <div className={styles.ribbonFoot}>
        <p className={styles.ribbonMeta} aria-live="polite">
          {active ? (
            <>
              <span className={styles.ribbonTitle}>{active.cover.title}</span>
              <span>
                {active.cover.author}
                {active.cover.year ? ` · ${active.cover.year}` : ""}
              </span>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
