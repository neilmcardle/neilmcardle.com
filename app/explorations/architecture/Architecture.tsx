"use client";

import Link from "next/link";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import {
  BUILDINGS,
  ELSEWHERE,
  lanes,
  period,
  PERIODS,
  position,
  SCALE_YEARS,
  yearLabel,
  type Building,
} from "./buildings";
import { DRAWINGS } from "./drawings";
import { Defs, type Sheet as SheetData } from "./drawings/kit";
import { MEASURES, SOURCES } from "./sources";
import styles from "./architecture.module.css";

const DRAWN = BUILDINGS.filter((b) => DRAWINGS[b.id]);
const WAITING = BUILDINGS.filter((b) => !DRAWINGS[b.id]);
const WEST_BANDS = lanes(PERIODS);
const OTHER_BANDS = lanes(ELSEWHERE);
const MAJOR = new Set([-9500, 0, 1500, 2000]);

const fixed = (n: number) => n.toFixed(4);
const at = (p: number) => ({ "--p": fixed(p) }) as CSSProperties;
const span = (a: number, b: number) =>
  ({ "--a": fixed(position(a)), "--b": fixed(position(b)) }) as CSSProperties;

function Sheet({ sheet, figure }: { sheet: SheetData; figure: string }) {
  const [w, h] = sheet.viewBox;
  return (
    <figure className={styles.sheet} data-sheet>
      <div className={styles.paper}>
        <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={sheet.title}>
          <g data-art>{sheet.art}</g>
          <g className="labels">
            {sheet.labels.map((label, i) => {
              const anchor = label.anchor ?? "start";
              const [x, y] = label.to ?? label.at;
              const dx = label.to
                ? anchor === "start"
                  ? 5
                  : anchor === "end"
                    ? -5
                    : 0
                : 0;
              const below =
                label.to && anchor === "middle"
                  ? label.to[1] > label.at[1]
                    ? 12
                    : -6
                  : 4;
              return (
                <g key={label.text + i}>
                  {label.to && (
                    <>
                      <path
                        className="leader"
                        d={`M${label.at[0]},${label.at[1]}L${x},${y}`}
                      />
                      <circle
                        className="pin"
                        cx={label.at[0]}
                        cy={label.at[1]}
                        r={1.8}
                      />
                    </>
                  )}
                  <text
                    className="note"
                    x={x + dx}
                    y={y + below}
                    textAnchor={anchor}
                  >
                    {label.text}
                  </text>
                  <g
                    className="marker"
                    transform={`translate(${label.at[0]} ${label.at[1]})`}
                  >
                    <circle />
                    <text>{i + 1}</text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.fig}>Fig. {figure}</span> {sheet.caption}
      </figcaption>
      <ol className={styles.key}>
        {sheet.labels.map((label, i) => (
          <li key={label.text + i}>{label.text}</li>
        ))}
      </ol>
    </figure>
  );
}

function Sources({ id }: { id: string }) {
  const list = Object.values(MEASURES[id] ?? {});
  if (!list.length) return null;
  const used = [
    ...new Set(list.flatMap((m) => (m.source ? [m.source] : []))),
  ].map((key) => ({ key, ...SOURCES[key] }));
  const guessed = list.filter((m) => m.grade === "estimate").map((m) => m.what);
  return (
    <p className={styles.sources}>
      Sources:{" "}
      {used.map((s, i) => (
        <span key={s.key}>
          {i > 0 && "; "}
          {s.url ? <a href={s.url}>{s.cite}</a> : s.cite}
        </span>
      ))}
      .
      {guessed.length > 0 &&
        ` Estimated from drawings and photographs: ${guessed.join(", ")}.`}
    </p>
  );
}

function Entry({ building, index }: { building: Building; index: number }) {
  const drawings = DRAWINGS[building.id];
  return (
    <article id={building.id} className={styles.entry} data-entry>
      <header className={styles.entryHead}>
        <div className={styles.meta}>
          <span className={styles.number}>{building.date}</span>
          <p className={styles.facts}>
            <span className={styles.era}>{building.tradition}</span>
            <span>{building.place}</span>
          </p>
        </div>
        <div className={styles.headline}>
          <h3 className={styles.name}>{building.name}</h3>
          <p className={styles.idea}>{building.idea}</p>
        </div>
      </header>
      <Sheet sheet={drawings.main} figure={`${index + 1}a`} />
      <div className={styles.lower}>
        <div>
          <p className={styles.body}>{building.body}</p>
          <Sources id={building.id} />
        </div>
        <Sheet sheet={drawings.detail} figure={`${index + 1}b`} />
      </div>
    </article>
  );
}

export default function Architecture() {
  const root = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(DRAWN[0].id);
  const active = DRAWN.find((b) => b.id === activeId) ?? DRAWN[0];

  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sheets = [...page.querySelectorAll<HTMLElement>("[data-sheet]")];

    if (!still) {
      sheets.forEach((sheet) => {
        sheet
          .querySelectorAll<SVGElement>(
            "[data-art] :is(path, line, polyline, polygon, rect, circle, ellipse):not(.dash)",
          )
          .forEach((el, i) => {
            el.setAttribute("pathLength", "1");
            el.setAttribute("data-ink", "");
            el.style.setProperty("--i", String(i));
          });
      });
      page.dataset.motion = "on";
    }

    const draw = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.drawn = "";
          draw.unobserve(entry.target);
        }),
      { threshold: 0.3 },
    );
    sheets.forEach((sheet) => draw.observe(sheet));

    const resize = new ResizeObserver((entries) =>
      entries.forEach((entry) => {
        const svg = entry.target as SVGSVGElement;
        const sheet = svg.closest<HTMLElement>("[data-sheet]");
        const width = entry.contentRect.width;
        if (!sheet || !width) return;
        const k = svg.viewBox.baseVal.width / width;
        sheet.style.setProperty("--k", k.toFixed(3));
        sheet.style.setProperty("--w", Math.min(k, 1.6).toFixed(3));
        sheet.toggleAttribute("data-compact", k > 1.6);
      }),
    );
    sheets.forEach((sheet) => {
      const svg = sheet.querySelector("svg");
      if (svg) resize.observe(svg);
    });

    const watch = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    page
      .querySelectorAll("[data-entry]")
      .forEach((entry) => watch.observe(entry));

    return () => {
      draw.disconnect();
      resize.disconnect();
      watch.disconnect();
    };
  }, []);

  const goTo = (id: string) => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: still ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    goTo(id);
  };

  const step = DRAWN.indexOf(active);

  const inBand = (from: number, to: number) =>
    active.year >= from && active.year < to;

  return (
    <div ref={root} className={styles.root}>
      <Defs />
      <nav className={styles.ruler} aria-label="Timeline">
        <div className={styles.readout}>
          <span className={styles.readDate}>{active.date}</span>
          <span className={styles.readName}>{active.name}</span>
          <span className={styles.readTradition}>{active.tradition}</span>
        </div>
        <div className={styles.track}>
          {WEST_BANDS.map((band, i) => (
            <span
              key={band.name}
              className={styles.band}
              data-west
              data-odd={i % 2 === 1 || undefined}
              data-on={inBand(band.from, band.to) || undefined}
              style={span(band.from, band.to)}
              title={band.name}
            />
          ))}
          {OTHER_BANDS.map((band) => (
            <span
              key={band.name}
              className={styles.band}
              data-lane={band.lane}
              data-on={inBand(band.from, band.to) || undefined}
              style={
                {
                  ...span(band.from, band.to),
                  "--lane": band.lane,
                } as CSSProperties
              }
              title={band.name}
            />
          ))}
          {PERIODS.map((band) => (
            <span
              key={`name-${band.name}`}
              className={styles.eraName}
              data-on={inBand(band.from, band.to) || undefined}
              style={at((position(band.from) + position(band.to)) / 2)}
              aria-hidden
            >
              {band.short}
            </span>
          ))}
          <span className={styles.axis} />
          {SCALE_YEARS.map((year) => (
            <span
              key={year}
              className={styles.year}
              data-minor={!MAJOR.has(year) || undefined}
              style={at(position(year))}
            >
              {yearLabel(year)}
            </span>
          ))}
          {BUILDINGS.map((b) =>
            DRAWINGS[b.id] ? (
              <a
                key={b.id}
                href={`#${b.id}`}
                className={styles.tick}
                data-active={b.id === activeId || undefined}
                style={at(position(b.year))}
                aria-label={`${b.name}, ${b.date}`}
                onClick={(event) => jump(event, b.id)}
              />
            ) : (
              <span
                key={b.id}
                className={styles.tick}
                data-empty
                style={at(position(b.year))}
                title={`${b.name}, not drawn yet`}
              />
            ),
          )}
          <span className={styles.marker} style={at(position(active.year))} />
        </div>
        <p className={styles.squeeze}>Time is squeezed towards the present.</p>
        <div className={styles.phone}>
          <button
            type="button"
            className={styles.stepper}
            aria-label="Previous building"
            disabled={step <= 0}
            onClick={() => goTo(DRAWN[step - 1].id)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3 5 8l5 5" />
            </svg>
          </button>
          <div className={styles.current}>
            <span className={styles.currentMeta}>
              {String(step + 1).padStart(2, "0")} / {DRAWN.length} ·{" "}
              {active.date}
            </span>
            <span className={styles.currentName}>
              {active.name}
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 4.5 6 7.5 9 4.5" />
              </svg>
            </span>
            <select
              className={styles.picker}
              aria-label="Choose a building"
              value={active.id}
              onChange={(event) => goTo(event.target.value)}
            >
              {DRAWN.map((b, i) => (
                <option key={b.id} value={b.id}>
                  {String(i + 1).padStart(2, "0")}. {b.name}, {b.date}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.stepper}
            aria-label="Next building"
            disabled={step >= DRAWN.length - 1}
            onClick={() => goTo(DRAWN[step + 1].id)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
          <span className={styles.progress} aria-hidden="true">
            <span style={at(position(active.year))} />
          </span>
        </div>
      </nav>

      <main className={styles.content}>
        <header className={styles.intro}>
          <Link href="/" className={styles.home}>
            <svg viewBox="18 18 27 27" aria-hidden="true">
              <path d="M45 45L32 31.2985V18H45V45Z" />
              <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
            </svg>
            Neil McArdle
          </Link>
          <h1 className={styles.title}>
            A history of architecture in thirty drawings
          </h1>
          <p className={styles.lede}>
            Each building here changed one thing about how we build. Like a new
            way to put a roof on a wide space, hold up weight or let in light.
            It spans over 11,500 years, from the carved stone pillars of Göbekli
            Tepe, to the titanium curves of the Guggenheim in Bilbao. It&rsquo;s
            all from Claude&rsquo;s AI slop cannon, but it&rsquo;s only an
            exploration, see what you think.
          </p>
        </header>

        {DRAWN.map((building, i) => {
          const chapter = period(building);
          const opens = i === 0 || period(DRAWN[i - 1]) !== chapter;
          return (
            <Fragment key={building.id}>
              {opens && (
                <header id={chapter.id} className={styles.period}>
                  <p className={styles.periodDates}>
                    {yearLabel(chapter.from)} to{" "}
                    {chapter === PERIODS[PERIODS.length - 1]
                      ? "now"
                      : yearLabel(chapter.to)}
                  </p>
                  <h2 className={styles.periodName}>{chapter.name}</h2>
                  <p className={styles.periodAbout}>{chapter.about}</p>
                </header>
              )}
              <Entry building={building} index={i} />
            </Fragment>
          );
        })}

        {WAITING.length > 0 && (
          <section className={styles.waiting} aria-labelledby="waiting">
            <h2 id="waiting" className={styles.waitingTitle}>
              Still to draw
            </h2>
            <ol className={styles.waitingList}>
              {WAITING.map((b) => (
                <li key={b.id}>
                  <span className={styles.waitingDate}>{b.date}</span>
                  <span className={styles.waitingName}>{b.name}</span>
                  <span className={styles.waitingIdea}>{b.idea}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}
