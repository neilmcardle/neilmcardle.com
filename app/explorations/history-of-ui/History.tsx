"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import { ERAS, type Era, type EraId } from "./eras";
import { ActiveContext } from "./lib";
import styles from "./history.module.css";

const Waiting = () => <div className={styles.waiting} />;

const COMPONENTS: Record<EraId, ComponentType> = {
  sketchpad: dynamic(() => import("./eras/Sketchpad"), {
    ssr: false,
    loading: Waiting,
  }),
  nls: dynamic(() => import("./eras/Nls"), { ssr: false, loading: Waiting }),
  unix: dynamic(() => import("./eras/Teletype"), {
    ssr: false,
    loading: Waiting,
  }),
  plato: dynamic(() => import("./eras/Plato"), {
    ssr: false,
    loading: Waiting,
  }),
  desktop: dynamic(() => import("./eras/Desktop"), {
    ssr: false,
    loading: Waiting,
  }),
  web: dynamic(() => import("./eras/Web"), { ssr: false, loading: Waiting }),
  pen: dynamic(() => import("./eras/Pen"), { ssr: false, loading: Waiting }),
  bevels: dynamic(() => import("./eras/Bevels"), {
    ssr: false,
    loading: Waiting,
  }),
  aqua: dynamic(() => import("./eras/Aqua"), { ssr: false, loading: Waiting }),
  ajax: dynamic(() => import("./eras/Ajax"), { ssr: false, loading: Waiting }),
  feed: dynamic(() => import("./eras/Feed"), { ssr: false, loading: Waiting }),
  touch: dynamic(() => import("./eras/Touch"), {
    ssr: false,
    loading: Waiting,
  }),
  flat: dynamic(() => import("./eras/Flat"), { ssr: false, loading: Waiting }),
  voice: dynamic(() => import("./eras/Voice"), {
    ssr: false,
    loading: Waiting,
  }),
  prompt: dynamic(() => import("./eras/Prompt"), {
    ssr: false,
    loading: Waiting,
  }),
  agents: dynamic(() => import("./eras/Agents"), {
    ssr: false,
    loading: Waiting,
  }),
};

function themeVars(era: Era) {
  return {
    "--bg": era.theme.bg,
    "--ink": era.theme.ink,
    "--muted": era.theme.muted,
    "--rule": era.theme.rule,
  } as CSSProperties;
}

function EraSection({ era }: { era: Era }) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const Comp = COMPONENTS[era.id];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: "120% 0px" },
    );
    const seen = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting),
      {
        threshold: 0.2,
      },
    );
    near.observe(el);
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, []);

  return (
    <section
      ref={ref}
      id={era.id}
      className={styles.era}
      style={themeVars(era)}
      aria-labelledby={`${era.id}-title`}
    >
      <div className={styles.caption}>
        <p className={styles.year}>{era.year}</p>
        <h2 id={`${era.id}-title`} className={styles.title}>
          {era.title}
        </h2>
        <p className={styles.credit}>{era.credit}</p>
        <p className={styles.body}>{era.body}</p>
        <p className={styles.hint}>{era.hint}</p>
      </div>
      <div className={styles.stage} data-era={era.id}>
        <ActiveContext.Provider value={active}>
          {mounted ? <Comp /> : <Waiting />}
        </ActiveContext.Provider>
      </div>
    </section>
  );
}

function Rail({ current }: { current: number }) {
  const go = (id: string) => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <nav
      className={styles.rail}
      data-hidden={current < 0 || undefined}
      style={{ color: ERAS[Math.max(0, current)].theme.ink }}
      aria-label="Eras"
    >
      <ol>
        {ERAS.map((era, i) => (
          <li key={era.id}>
            <button
              type="button"
              onClick={() => go(era.id)}
              aria-current={i === current ? "true" : undefined}
              className={styles.railItem}
            >
              <span className={styles.railYear}>{era.year.slice(0, 4)}</span>
              <span className={styles.railName}>{era.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function History() {
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = ERAS.findIndex((era) => era.id === e.target.id);
          setCurrent(i);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll("[data-observe]").forEach((el) => io.observe(el));
    ERAS.forEach((era) => {
      const el = document.getElementById(era.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const start = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document
      .getElementById(ERAS[0].id)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <main className={styles.page}>
      <header className={styles.intro} id="top" data-observe>
        <Link href="/" className={styles.home}>
          Neil McArdle
        </Link>
        <div className={styles.introText}>
          <h1 className={styles.introTitle}>A history of UI</h1>
          <p className={styles.introLede}>
            Sixty years of interfaces, from the light pen to the prompt box.
          </p>
          <button type="button" className={styles.start} onClick={start}>
            Start in 1963
          </button>
        </div>
        <ol className={styles.introIndex}>
          {ERAS.map((era) => (
            <li key={era.id}>
              <a href={`#${era.id}`}>
                <span>{era.year}</span>
                {era.title}
              </a>
            </li>
          ))}
        </ol>
      </header>

      <Rail current={current} />

      {ERAS.map((era) => (
        <EraSection key={era.id} era={era} />
      ))}

      <footer className={styles.footer}>
        <a href="#top">Back to 1963</a>
        <Link href="/">Neil McArdle</Link>
      </footer>
    </main>
  );
}
