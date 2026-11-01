"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Fit, hash, useActive } from "../lib";
import s from "./web.module.css";

type PageId = "home" | "new" | "coffee" | "links";

const URLS: Record<PageId, string> = {
  home: "http://www.cs.uni.ac.uk/~neil/",
  new: "http://www.cs.uni.ac.uk/~neil/new.html",
  coffee: "http://www.cs.uni.ac.uk/~neil/coffee.html",
  links: "http://www.cs.uni.ac.uk/~neil/links.html",
};

const TITLES: Record<PageId, string> = {
  home: "Neil's Home Page",
  new: "What's New",
  coffee: "The Coffee Pot",
  links: "Cool Links",
};

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function paintLandscape(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, "#2a4fa8");
  sky.addColorStop(1, "#f0b070");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#ffe08a";
  g.beginPath();
  g.arc(w * 0.7, h * 0.48, h * 0.11, 0, Math.PI * 2);
  g.fill();
  const hill = (base: number, amp: number, f: number, col: string) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w; x += 2)
      g.lineTo(
        x,
        base + Math.sin(x * f) * amp + Math.sin(x * f * 2.7) * amp * 0.4,
      );
    g.lineTo(w, h);
    g.fill();
  };
  hill(h * 0.56, h * 0.06, 0.03, "#4b5f8c");
  hill(h * 0.68, h * 0.07, 0.022, "#2f6b3a");
  hill(h * 0.82, h * 0.05, 0.04, "#1f4a26");
  g.fillStyle = "#6fa6d8";
  g.fillRect(0, h * 0.9, w, h * 0.1);
  return quantize(c, [
    [0, 0, 0],
    [255, 255, 255],
    [42, 79, 168],
    [111, 166, 216],
    [240, 176, 112],
    [255, 224, 138],
    [75, 95, 140],
    [47, 107, 58],
    [31, 74, 38],
    [170, 110, 90],
  ]);
}

function paintPot(w: number, h: number, seed: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5a5a5a";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#7a7a7a";
  g.fillRect(0, h * 0.72, w, h * 0.28);
  g.fillStyle = "#2a2a2a";
  g.fillRect(w * 0.3, h * 0.2, w * 0.4, h * 0.08);
  g.fillStyle = "#cfcfcf";
  g.beginPath();
  g.moveTo(w * 0.34, h * 0.28);
  g.lineTo(w * 0.66, h * 0.28);
  g.lineTo(w * 0.72, h * 0.74);
  g.lineTo(w * 0.28, h * 0.74);
  g.closePath();
  g.fill();
  const level = 0.38 + (seed % 5) * 0.07;
  g.fillStyle = "#3a2a1c";
  g.fillRect(
    w * 0.3,
    h * (0.28 + level * 0.46),
    w * 0.4,
    h * (0.74 - (0.28 + level * 0.46)),
  );
  g.strokeStyle = "#cfcfcf";
  g.lineWidth = w * 0.03;
  g.beginPath();
  g.arc(w * 0.73, h * 0.48, h * 0.12, -1.2, 1.2);
  g.stroke();
  const img = g.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (hash(i, seed) - 0.5) * 40;
    const v = (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3 + n;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
  }
  g.putImageData(img, 0, 0);
  return quantize(
    c,
    [0, 40, 80, 120, 160, 200, 240].map((v) => [v, v, v]),
  );
}

function quantize(c: HTMLCanvasElement, pal: number[][]) {
  const g = c.getContext("2d")!;
  const img = g.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const t = (BAYER[y % 4][x % 4] / 16 - 0.5) * 48;
      let best = 0;
      let bd = Infinity;
      for (let p = 0; p < pal.length; p++) {
        const dr = d[i] + t - pal[p][0];
        const dg = d[i + 1] + t - pal[p][1];
        const db = d[i + 2] + t - pal[p][2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bd) {
          bd = dist;
          best = p;
        }
      }
      d[i] = pal[best][0];
      d[i + 1] = pal[best][1];
      d[i + 2] = pal[best][2];
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

const PASSES = [
  { start: 0, step: 8, fill: 8 },
  { start: 4, step: 8, fill: 4 },
  { start: 2, step: 4, fill: 2 },
  { start: 1, step: 2, fill: 1 },
];

function Gif({
  w,
  h,
  paint,
  bytes,
  onProgress,
  alt,
}: {
  w: number;
  h: number;
  paint: () => HTMLCanvasElement;
  bytes: number;
  onProgress: (done: number, total: number) => void;
  alt: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const progress = useRef(onProgress);
  progress.current = onProgress;
  const painter = useRef(paint);
  const active = useActive();

  useEffect(() => {
    if (!active) return;
    const out = ref.current!.getContext("2d")!;
    const src = painter.current();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      out.drawImage(src, 0, 0);
      progress.current(bytes, bytes);
      return;
    }
    const rows: { y: number; fill: number }[] = [];
    for (const p of PASSES)
      for (let y = p.start; y < h; y += p.step) rows.push({ y, fill: p.fill });
    let i = 0;
    const perTick = Math.max(1, Math.round(rows.length / 90));
    const id = window.setInterval(() => {
      for (let k = 0; k < perTick && i < rows.length; k++, i++) {
        const r = rows[i];
        out.drawImage(src, 0, r.y, w, 1, 0, r.y, w, Math.min(r.fill, h - r.y));
      }
      progress.current(Math.round((i / rows.length) * bytes), bytes);
      if (i >= rows.length) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [active, w, h, bytes]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className={s.img}
      role="img"
      aria-label={alt}
    />
  );
}

function PageLink({
  to,
  children,
  visited,
  go,
}: {
  to: PageId;
  children: ReactNode;
  visited: Set<PageId>;
  go: (id: PageId) => void;
}) {
  return (
    <a
      href={URLS[to]}
      className={s.a}
      data-visited={visited.has(to) || undefined}
      onClick={(e) => {
        e.preventDefault();
        go(to);
      }}
    >
      {children}
    </a>
  );
}

export default function Web() {
  return (
    <div className={s.outer}>
      <Fit width={680} height={470}>
        <Browser />
      </Fit>
    </div>
  );
}

function Browser() {
  const [stack, setStack] = useState<PageId[]>(["home"]);
  const [pos, setPos] = useState(0);
  const [visited, setVisited] = useState<Set<PageId>>(new Set(["home"]));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Document Done.");
  const [potSeed, setPotSeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const page = stack[pos];

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clear, []);

  const load = (then: () => void, host = "www.cs.uni.ac.uk") => {
    clear();
    setLoading(true);
    setError(null);
    const steps: [number, string][] = [
      [0, `Looking up host ${host}...`],
      [450, `Connecting to ${host}...`],
      [900, "Sending request..."],
      [1250, "Reading response... 1.2K"],
    ];
    steps.forEach(([t, msg]) =>
      timers.current.push(window.setTimeout(() => setStatus(msg), t)),
    );
    timers.current.push(
      window.setTimeout(() => {
        then();
        setLoading(false);
        setStatus("Document Done.");
      }, 1550),
    );
  };

  const go = (id: PageId) => {
    load(() => {
      setStack((st) => [...st.slice(0, pos + 1), id]);
      setPos((p) => p + 1);
      setVisited((v) => new Set(v).add(id));
    });
  };

  const dead = (host: string) => {
    clear();
    setLoading(true);
    setStatus(`Looking up host ${host}...`);
    timers.current.push(
      window.setTimeout(() => {
        setLoading(false);
        setStatus("Document Done.");
        setError(
          `Could not reach ${host}. The server may be down, or it may only be switched on during office hours.`,
        );
      }, 1800),
    );
  };

  const imgProgress = (done: number, total: number) => {
    if (done < total)
      setStatus(
        `Transferring image: ${(done / 1024).toFixed(1)} of ${(total / 1024).toFixed(1)} KB at 1.7 KB/sec`,
      );
    else setStatus("Document Done.");
  };

  return (
    <div className={s.window}>
      <div className={s.titlebar}>
        <span className={s.sysbox} aria-hidden />
        <span>Browser: {TITLES[page]}</span>
      </div>
      <div className={s.menus} aria-hidden>
        <span>File</span>
        <span>Options</span>
        <span>Navigate</span>
        <span>Annotate</span>
        <span className={s.help}>Help</span>
      </div>
      <div className={s.toolbar}>
        <button
          type="button"
          className={s.btn}
          disabled={pos === 0 || loading}
          onClick={() => load(() => setPos((p) => p - 1))}
        >
          Back
        </button>
        <button
          type="button"
          className={s.btn}
          disabled={pos >= stack.length - 1 || loading}
          onClick={() => load(() => setPos((p) => p + 1))}
        >
          Forward
        </button>
        <button
          type="button"
          className={s.btn}
          disabled={loading}
          onClick={() => go("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={s.btn}
          disabled={loading}
          onClick={() =>
            load(() => {
              if (page === "coffee") setPotSeed((x) => x + 1);
            })
          }
        >
          Reload
        </button>
        <span
          className={s.globe}
          data-spin={loading || undefined}
          aria-label={loading ? "Loading" : "Idle"}
          role="img"
        />
      </div>
      <div className={s.fields}>
        <label>
          <span>Title:</span>
          <output className={s.field}>{TITLES[page]}</output>
        </label>
        <label>
          <span>URL:</span>
          <output className={s.field}>{URLS[page]}</output>
        </label>
      </div>
      <div className={s.doc} aria-busy={loading}>
        {error && (
          <div className={s.error} role="alert">
            <p>
              <b>Unable to access document.</b>
            </p>
            <p>{error}</p>
            <button
              type="button"
              className={s.btn}
              onClick={() => setError(null)}
            >
              OK
            </button>
          </div>
        )}
        {page === "home" && (
          <>
            <h1>Neil&apos;s Home Page</h1>
            <Gif
              w={240}
              h={150}
              paint={() => paintLandscape(240, 150)}
              bytes={14600}
              onProgress={imgProgress}
              alt="A dithered picture of hills at sunset"
            />
            <p>
              Welcome to my corner of the <b>World Wide Web</b>! This page is{" "}
              <i>under construction</i>.
            </p>
            <ul>
              <li>
                <PageLink visited={visited} go={go} to="new">
                  What&apos;s New
                </PageLink>
              </li>
              <li>
                <PageLink visited={visited} go={go} to="coffee">
                  The coffee pot
                </PageLink>{" "}
                you can watch from anywhere
              </li>
              <li>
                <PageLink visited={visited} go={go} to="links">
                  Cool Links
                </PageLink>
              </li>
            </ul>
            <hr />
            <address>Last modified: 12 November 1993</address>
          </>
        )}
        {page === "new" && (
          <>
            <h1>What&apos;s New</h1>
            <dl>
              <dt>November 1993</dt>
              <dd>
                Added a picture to my home page. Mosaic shows pictures right
                inside the page now.
              </dd>
              <dt>October 1993</dt>
              <dd>
                There are more than 500 web servers in the world. I have visited
                14 of them.
              </dd>
            </dl>
            <p>
              <PageLink visited={visited} go={go} to="home">
                Back to my home page
              </PageLink>
            </p>
          </>
        )}
        {page === "coffee" && (
          <>
            <h1>The Trojan Room coffee pot</h1>
            <p>
              A camera in a Cambridge computer lab points at the coffee pot so
              nobody walks down the stairs to an empty one. Press <b>Reload</b>{" "}
              to see if there is any left.
            </p>
            <Gif
              key={potSeed}
              w={160}
              h={120}
              paint={() => paintPot(160, 120, potSeed)}
              bytes={9200}
              onProgress={imgProgress}
              alt="A grainy grey webcam picture of a coffee pot"
            />
            <p>
              <PageLink visited={visited} go={go} to="home">
                Back to my home page
              </PageLink>
            </p>
          </>
        )}
        {page === "links" && (
          <>
            <h1>Cool Links</h1>
            <ul>
              <li>
                <a
                  href="http://info.cern.ch/"
                  className={s.a}
                  onClick={(e) => {
                    e.preventDefault();
                    dead("info.cern.ch");
                  }}
                >
                  CERN
                </a>
                , where the web started
              </li>
              <li>
                <a
                  href="http://www.ncsa.uiuc.edu/"
                  className={s.a}
                  onClick={(e) => {
                    e.preventDefault();
                    dead("www.ncsa.uiuc.edu");
                  }}
                >
                  NCSA
                </a>
                , who make Mosaic
              </li>
              <li>
                <PageLink visited={visited} go={go} to="coffee">
                  The coffee pot
                </PageLink>
              </li>
            </ul>
            <p>
              <PageLink visited={visited} go={go} to="home">
                Back to my home page
              </PageLink>
            </p>
          </>
        )}
      </div>
      <div className={s.status} aria-live="polite">
        {status}
      </div>
    </div>
  );
}
