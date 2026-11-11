"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Pose } from "./scene";
import s from "./wellie.module.css";

const COLOURS = ["As found", "Wet", "Dipped in concrete"] as const;

const PARTS: Record<string, string> = {
  Collar: "Ribbed around the top. Stops nothing.",
  Strap: "Adjusts the calf apparently. Never been adjusted.",
  Shaft: "Knee high, in theory. Shin height is more likely.",
  Foot: "Room for two pairs of socks, or one sock and a lot of water.",
  Sole: "Grip best on dry carpet. Slippery when wet.",
  Heel: "Split at the back seam. Lets the puddle in to say hello.",
};

const DESK: Pose[] = [
  {
    x: 1.15,
    y: 0.05,
    scale: 1.06,
    rotY: 0.55,
    rotX: 0.12,
    lines: 1,
    solid: 0,
    explode: 0,
    dims: 0,
    spin: 1,
  },
  {
    x: 1.3,
    y: 0.05,
    scale: 1.12,
    rotY: 0,
    rotX: 0,
    lines: 1,
    solid: 0,
    explode: 0,
    dims: 1,
    spin: 0,
  },
  {
    x: 1.1,
    y: -0.15,
    scale: 0.9,
    rotY: 0.6,
    rotX: 0.16,
    lines: 1,
    solid: 0,
    explode: 1,
    dims: 0,
    spin: 0,
  },
  {
    x: 0.45,
    y: -0.25,
    scale: 1.22,
    rotY: 0.42,
    rotX: 0.06,
    lines: 0,
    solid: 1,
    explode: 0,
    dims: 0,
    spin: 0,
  },
  {
    x: 1.35,
    y: -0.05,
    scale: 1.08,
    rotY: -0.7,
    rotX: 0.1,
    lines: 0,
    solid: 1,
    explode: 0,
    dims: 0,
    spin: 0,
  },
  {
    x: -0.95,
    y: 0.02,
    scale: 1.12,
    rotY: Math.PI - 0.04,
    rotX: 0.06,
    lines: 0,
    solid: 1,
    explode: 0,
    dims: 0,
    spin: 0,
  },
];

const PHONE: Pose[] = DESK.map((p, i) =>
  i === 4
    ? { ...p, x: 0.45, y: -1.2, scale: 0.5 }
    : i === 5
      ? { ...p, x: 0.08, y: 0.62, scale: 0.6 }
      : { ...p, x: 0, y: p.y - 0.95, scale: p.scale * 0.6 },
);

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function poseAt(poses: Pose[], at: number): Pose {
  const i = Math.max(0, Math.min(poses.length - 1, Math.floor(at)));
  const j = Math.min(poses.length - 1, i + 1);
  const t = ease(Math.max(0, Math.min(1, at - i)));
  const a = poses[i];
  const b = poses[j];
  const out = {} as Pose;
  for (const k of Object.keys(a) as (keyof Pose)[])
    out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

export default function Wellie() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLDivElement>(null);
  const drag = useRef({ value: 0, active: false, x: 0 });
  const dirty = useRef(true);
  const slider = useRef<HTMLDivElement>(null);
  const api = useRef<Awaited<
    ReturnType<(typeof import("./scene"))["createScene"]>
  > | null>(null);
  const [colour, setColour] = useState<(typeof COLOURS)[number]>("As found");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    let last = performance.now();
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanup: (() => void)[] = [];

    let centres: number[] = [];
    const measure = () => {
      centres = [...document.querySelectorAll<HTMLElement>("[data-stage]")].map(
        (el) => el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2,
      );
    };
    measure();

    const stage = () => {
      const c = centres;
      const y = window.scrollY;
      if (y <= c[0]) return 0;
      for (let i = 1; i < c.length; i++)
        if (y <= c[i]) return i - 1 + (y - c[i - 1]) / (c[i] - c[i - 1]);
      return c.length - 1;
    };

    (async () => {
      const { createScene } = await import("./scene");
      if (cancelled || !canvas.current) return;
      const scene = await createScene(canvas.current);
      if (cancelled) {
        scene.dispose();
        return;
      }
      api.current = scene;
      setReady(true);

      let lastKey = "";
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const at = stage();
        const phone = window.innerWidth < 760;
        const pose = poseAt(phone ? PHONE : DESK, at);
        if (calm) pose.spin = 0;
        const key = `${at.toFixed(4)}|${drag.current.value.toFixed(4)}|${phone}|${window.innerWidth}x${window.innerHeight}`;
        if (pose.spin < 0.001 && key === lastKey && !dirty.current) {
          frame = requestAnimationFrame(tick);
          return;
        }
        lastKey = key;
        dirty.current = false;
        const placed = scene.render(pose, dt, drag.current.value);

        const cream = Math.max(0, 1 - Math.abs(at - 3) / 0.55);
        root.current?.style.setProperty("--cream", cream.toFixed(3));
        if (name.current)
          name.current.style.opacity = String(
            Math.max(0, 1 - Math.abs(at - 3) / 0.5),
          );

        const box = labels.current;
        if (box) {
          for (const el of box.querySelectorAll<HTMLElement>("[data-label]")) {
            const p = placed[el.dataset.label!];
            if (!p) continue;
            const show =
              el.dataset.kind === "dim"
                ? pose.dims
                : Math.max(0, pose.explode * 2 - 1);
            el.style.translate = `${Math.round(p.x)}px ${Math.round(p.y)}px`;
            el.style.opacity = String(
              phone && el.dataset.kind !== "dim" ? 0 : show,
            );
          }
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);

      const onResize = () => {
        scene.resize();
        measure();
        dirty.current = true;
      };
      window.addEventListener("resize", onResize);
      cleanup.push(() => window.removeEventListener("resize", onResize));
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanup.forEach((f) => f());
      api.current?.dispose();
    };
  }, []);

  useEffect(() => {
    import("./scene").then(({ COLOURWAYS }) => {
      api.current?.setColourway(COLOURWAYS[colour]);
      dirty.current = true;
    });
  }, [colour, ready]);

  const calmScroll = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  const top = () => window.scrollTo({ top: 0, behavior: calmScroll() });
  const turned = () => {
    const deg = Math.round(
      ((((drag.current.value * 180) / Math.PI) % 360) + 360) % 360,
    );
    slider.current?.setAttribute("aria-valuenow", String(deg));
    slider.current?.setAttribute("aria-valuetext", `${deg} degrees`);
  };

  return (
    <div className={s.root} ref={root}>
      <div className={s.grid} aria-hidden="true" />
      <div className={s.name} ref={name} aria-hidden="true">
        Puddle High II
      </div>
      <canvas
        className={`${s.canvas} ${ready ? s.on : ""}`}
        ref={canvas}
        aria-hidden="true"
      />
      <div className={s.labels} ref={labels} aria-hidden="true">
        <span data-label="height" data-kind="dim" className={s.dim}>
          43.9 cm
        </span>
        <span data-label="length" data-kind="dim" className={s.dim}>
          30.7 cm
        </span>
        {Object.entries(PARTS).map(([part, line]) => (
          <span key={part} data-label={part} className={s.part}>
            <b>{part}</b>
            {line}
          </span>
        ))}
      </div>

      <header className={s.top}>
        <Link className={s.back} href="/">
          &larr; neilmcardle.com
        </Link>
        <span className={s.brand}>Puddle Works</span>
        <nav className={s.nav} aria-label="Sections">
          <a href="#blueprint">Blueprint</a>
          <a href="#anatomy">Anatomy</a>
          <a href="#rubber">Rubber</a>
          <a href="#metrics">Metrics</a>
        </nav>
      </header>

      <main className={s.main}>
        <section className={`${s.section} ${s.hero}`} data-stage id="blueprint">
          <div className={s.copy}>
            <h1 className={s.title}>
              Puddle
              <br />
              High II
            </h1>
            <p className={s.lede}>
              A knee-high rubber boot, made around 1987 and worn every year
              since. It&rsquo;s the blueprint for every tired, old boot.
            </p>
            <a className={s.button} href="#drawing">
              Unfold the blueprint
            </a>
          </div>
          <dl className={s.sheet}>
            <div>
              <dt>Model</dt>
              <dd>Puddle High II</dd>
            </div>
            <div>
              <dt>Edition</dt>
              <dd>1 of 1</dd>
            </div>
            <div>
              <dt>Pair</dt>
              <dd>Technically speaking. The other one is missing</dd>
            </div>
            <div>
              <dt>Origin</dt>
              <dd>Back of the shed</dd>
            </div>
            <div>
              <dt>Designer</dt>
              <dd>We think someone designed it</dd>
            </div>
            <div>
              <dt>Condition</dt>
              <dd>Honest</dd>
            </div>
          </dl>
        </section>

        <section className={s.section} data-stage id="drawing">
          <div className={s.copy}>
            <h2 className={s.heading}>
              It starts as
              <br />a concept.
            </h2>
            <p className={s.body}>
              Most boots start under a kitchen table. This one started under a
              pile of coats. Measured by eye, drawn with my bad hand while still
              damp.
            </p>
            <dl className={s.specs}>
              <div>
                <dt>Overall height</dt>
                <dd>43.9 cm</dd>
              </div>
              <div>
                <dt>Overall length</dt>
                <dd>30.7 cm</dd>
              </div>
              <div>
                <dt>Shaft opening</dt>
                <dd>Wider than it should be</dd>
              </div>
              <div>
                <dt>Tread depth</dt>
                <dd>Theoretical</dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          className={`${s.section} ${s.anatomy}`}
          data-stage
          id="anatomy"
        >
          <div className={s.copy}>
            <h2 className={s.heading}>
              Six parts.
              <br />
              Two intentional holes.
            </h2>
            <p className={s.body}>
              Taken apart for the first time since they got stuck in the factory
              door. All original parts remain, with a fair amount of mud from
              the field it was last worn in.
            </p>
            <ul className={s.partList}>
              {Object.entries(PARTS).map(([part, line]) => (
                <li key={part}>
                  <b>{part}</b> {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${s.section} ${s.rubber}`} data-stage id="rubber">
          <div className={s.copy}>
            <h2 className={s.heading}>
              Line becomes
              <br />
              <span className={s.soft}>rubber.</span>
            </h2>
          </div>
          <p className={s.aside}>
            Before the festivals and the dog walks, it stood by the back door
            for a very long time.
          </p>
          <div className={s.swatches} role="radiogroup" aria-label="Colourway">
            {COLOURS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={colour === c}
                className={s.swatch}
                onClick={() => setColour(c)}
              >
                <span className={s.dot} data-c={c} aria-hidden="true" />
                {c}
              </button>
            ))}
          </div>
        </section>

        <section
          className={`${s.section} ${s.metrics}`}
          data-stage
          id="metrics"
        >
          <dl className={s.numbers}>
            <div>
              <dt>
                43.9<small>cm</small>
              </dt>
              <dd>Height, standing up straight</dd>
            </div>
            <div>
              <dt>2</dt>
              <dd>Holes, for your legs.</dd>
            </div>
            <div>
              <dt>0</dt>
              <dd>Puddles avoided</dd>
            </div>
            <div>
              <dt>37</dt>
              <dd>Years in service</dd>
            </div>
            <div>
              <dt>
                9<small>ish</small>
              </dt>
              <dd>Size, whichever was by the door</dd>
            </div>
            <div>
              <dt>4</dt>
              <dd>Previous family owners</dd>
            </div>
          </dl>
        </section>

        <section className={`${s.section} ${s.turn}`} data-stage id="turn">
          <div
            className={s.dragZone}
            onPointerDown={(e) => {
              drag.current.active = true;
              drag.current.x = e.clientX;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current.active) return;
              drag.current.value += (e.clientX - drag.current.x) * 0.01;
              drag.current.x = e.clientX;
              turned();
            }}
            onPointerUp={() => (drag.current.active = false)}
            onPointerCancel={() => (drag.current.active = false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") drag.current.value -= 0.2;
              if (e.key === "ArrowRight") drag.current.value += 0.2;
              turned();
            }}
            tabIndex={0}
            role="slider"
            aria-label="Turn the boot. Use the left and right arrow keys."
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuetext="0 degrees"
            ref={slider}
          />
          <div className={s.closing}>
            <h2 className={s.heading}>Have a look round.</h2>
            <p className={s.body}>
              Drag to turn it if you could be bothered. It looks much the same
              from every side.
            </p>
            <button type="button" className={s.button} onClick={top}>
              Boot up
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
