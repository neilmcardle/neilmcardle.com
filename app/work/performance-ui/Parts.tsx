import Image from "next/image";
import styles from "./pui.module.css";

export function Pair() {
  return (
    <div className={styles.pair}>
      <figure>
        <Image
          src="/work/performance-ui/without.jpg"
          alt="The demo booking page built without Performance UI: a navy header, an orange search button, a date strip of from prices and train fares shown before the booking fee"
          width={520}
          height={1125}
          sizes="(max-width: 720px) 45vw, 340px"
        />
        <figcaption>
          Without.{" "}
          <a
            href="/work/performance-ui/before.html"
            target="_blank"
            rel="noreferrer"
          >
            Open the demo
          </a>
        </figcaption>
      </figure>
      <figure>
        <Image
          src="/work/performance-ui/with.jpg"
          alt="The same page built with Performance UI: a plain header, a large heading saying every price includes the booking fee, a white search form, and trains listed with their total price"
          width={520}
          height={1125}
          sizes="(max-width: 720px) 45vw, 340px"
        />
        <figcaption>
          With.{" "}
          <a
            href="/work/performance-ui/after.html"
            target="_blank"
            rel="noreferrer"
          >
            Open the demo
          </a>
        </figcaption>
      </figure>
    </div>
  );
}

const CHECKS: [string, string, string][] = [
  [
    "Price people see first",
    "The fare, with the £2 fee added at checkout",
    "£41 total, with fare and fee underneath",
  ],
  ["Type sizes", "Nine, five of them off any scale", "Five, all on the scale"],
  [
    "Fonts",
    "Loaded from Google, two outside hosts",
    "One file, served with the page",
  ],
  ["Buttons and links under 44px", "6 of 15", "3 of 5"],
];

export function Checks() {
  return (
    <div className={styles.checks}>
      <table>
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Without</th>
            <th scope="col">With</th>
          </tr>
        </thead>
        <tbody>
          {CHECKS.map(([rule, before, after]) => (
            <tr key={rule}>
              <th scope="row">{rule}</th>
              <td>{before}</td>
              <td>{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const FILES: [string, string][] = [
  ["SKILL.md", "33 hard rules on one page"],
  ["references/", "13 files: the value, the reason, the source"],
  ["tokens/tokens.json", "Every value, in one place"],
  ["tokens/budgets.json", "Weight and speed targets"],
  ["specimen.html", "The system on one page"],
];

export function Files() {
  return (
    <ul className={styles.files}>
      {FILES.map(([name, what]) => (
        <li key={name}>
          <span>{name}</span>
          {what}
        </li>
      ))}
    </ul>
  );
}

const TYPE = [56, 44, 24, 20, 16, 13];
const SPACE = [4, 8, 12, 16, 24, 32, 48, 64];
const DURATIONS: [string, number][] = [
  ["exit", 96],
  ["press", 120],
  ["tooltip", 160],
  ["enter", 240],
  ["modal", 320],
];

export function Kit() {
  return (
    <div className={styles.kit}>
      <Files />
      <div className={styles.kitSpecs}>
        <figure className={styles.flowCell}>
          <figcaption>Type sizes</figcaption>
          <div className={styles.typeSpec}>
            {TYPE.map((size) => (
              <span key={size} style={{ fontSize: Math.min(size, 40) }}>
                {size}
              </span>
            ))}
          </div>
        </figure>
        <figure className={styles.flowCell}>
          <figcaption>Spacing</figcaption>
          <div className={styles.spaceSpec}>
            {SPACE.map((n) => (
              <span key={n}>
                <i style={{ width: n * 2 }} />
                {n}
              </span>
            ))}
          </div>
        </figure>
        <figure className={styles.flowCell}>
          <figcaption>Motion</figcaption>
          <div className={styles.motionSpec}>
            {DURATIONS.map(([name, ms]) => (
              <span key={name}>
                <i style={{ width: Math.round((ms / 320) * 120) }} />
                {name} {ms}ms
              </span>
            ))}
          </div>
        </figure>
      </div>
      <figure className={styles.flowCell}>
        <figcaption>Never allowed</figcaption>
        <Banned />
      </figure>
    </div>
  );
}

export function BrandPair() {
  return (
    <div className={styles.pair}>
      <figure>
        <Image
          src="/work/performance-ui/brand-full.jpg"
          alt="The Quillmore page with every Performance UI rule applied: monochrome, Inter only, the red brand gone"
          width={520}
          height={1125}
          sizes="(max-width: 720px) 45vw, 340px"
        />
        <figcaption>
          Every rule.{" "}
          <a
            href="/work/performance-ui/brand-full.html"
            target="_blank"
            rel="noreferrer"
          >
            Open the demo
          </a>
        </figcaption>
      </figure>
      <figure>
        <Image
          src="/work/performance-ui/brand-kept.jpg"
          alt="The same page with Foundation rules only: the cream page, serif heading and red brand kept, with spacing, tap sizes and type scale fixed"
          width={520}
          height={1125}
          sizes="(max-width: 720px) 45vw, 340px"
        />
        <figcaption>
          Foundation only.{" "}
          <a
            href="/work/performance-ui/brand-kept.html"
            target="_blank"
            rel="noreferrer"
          >
            Open the demo
          </a>
        </figcaption>
      </figure>
    </div>
  );
}

const BANNED = [
  "Gradient text",
  "Glass and blur as decoration",
  "Tracked capital labels",
  "Emoji standing in for icons",
  "Arrows on every button",
  "Fade-up on every section",
  "Em dashes in copy",
];

export function Banned() {
  return (
    <ul className={styles.banned}>
      {BANNED.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function Picker() {
  return (
    <figure className={styles.shot}>
      <Image
        src="/work/performance-ui/picker-v2.jpg"
        alt="The UI Taste picker: a list of areas on the left, and a decision about the page background with a live demo, options and what other sources use"
        width={1280}
        height={800}
        sizes="(max-width: 720px) 100vw, 1072px"
      />
      <figcaption>
        <a href="/ui-taste">Try the picker</a>
      </figcaption>
    </figure>
  );
}

const CREDITS: [string, string][] = [
  ["Impeccable", "Paul Bakaus's design skill"],
  ["Apple", "WWDC talks and the Human Interface Guidelines"],
  ["Emil Kowalski", "His writing on motion and interaction, and Sonner"],
  [
    "Derek Briggs",
    "Motion that settles, ordering by importance and frame-rate checks",
  ],
  ["frontend-design", "Anthropic's design skill"],
  [
    "Wireframe and Inflight",
    "Their sites, for type sizes, columns and controls",
  ],
  ["Vercel", "Web interface guidelines and React rules"],
  ["web.dev, WCAG and Core Web Vitals", "Speed and access"],
  [
    "break-ui, mobile-native, animation-performance and pick-ui-library",
    "Agent skills built on Emil Kowalski's design engineering, author unknown",
  ],
  ["Baymard Institute", "Forms and checkout research"],
  ["Studio sites and torph", "Showpiece effects"],
  [
    "Robert Bringhurst, Brilliant and the CMA",
    "Type scale, first run and price rules",
  ],
];

function CreditTable({ rows }: { rows: [string, string][] }) {
  return (
    <table>
      <colgroup>
        <col className={styles.colWho} />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Source</th>
          <th scope="col">What I learned from</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([who, what]) => (
          <tr key={who}>
            <th scope="row">{who}</th>
            <td>{what}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Credits() {
  const rest = CREDITS.slice(5);
  return (
    <div className={`${styles.checks} ${styles.credits}`}>
      <CreditTable rows={CREDITS.slice(0, 5)} />
      <details className={styles.more}>
        <summary>{rest.length} more sources</summary>
        <CreditTable rows={rest} />
      </details>
    </div>
  );
}

const TRIO: [string, string, string][] = [
  [
    "launch-none",
    "No skills",
    "A cream page with a red accent, three typefaces and a fade-up on every section.",
  ],
  ["launch-perf", "Performance UI", "Light, calm and fast, but plain."],
  [
    "launch-looks",
    "Performance UI + Looks UI",
    "Dark, one brand colour on the main action, edges instead of borders, one showpiece.",
  ],
];

export function Trio() {
  return (
    <div className={styles.trio}>
      {TRIO.map(([file, name, line]) => (
        <figure key={file}>
          <Image
            src={`/work/performance-ui/q-${file.replace("launch-", "")}${file === "launch-looks" ? "-2" : ""}.jpg`}
            alt={`The Quillmore launch page built with ${name.toLowerCase()}: ${line}`}
            width={520}
            height={1125}
            sizes="(max-width: 720px) 30vw, 300px"
          />
          <figcaption>
            <span>{name}</span>
            <a
              href={`/work/performance-ui/${file}.html`}
              target="_blank"
              rel="noreferrer"
            >
              Open the demo
            </a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

const LOOKS_CHECKS: [string, string, string, string][] = [
  [
    "Page",
    "Cream with a red accent",
    "Light, ink only",
    "Dark, one brand colour",
  ],
  ["Typefaces", "Three", "One", "One"],
  ["Type sizes", "18", "5, all on the scale", "5, all on the scale"],
  ["Borders", "9", "3", "None, shadows instead"],
  ["Scroll motion", "Every section fades up", "None", "None"],
  ["Showpiece", "None", "None", "One, paused off screen"],
  ["Buttons under 44px", "2 of 4", "4 of 5", "1 of 2"],
];

export function LooksChecks() {
  return (
    <div className={styles.checks}>
      <table>
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">No skills</th>
            <th scope="col">Performance UI</th>
            <th scope="col">With Looks UI</th>
          </tr>
        </thead>
        <tbody>
          {LOOKS_CHECKS.map(([rule, a, b, c]) => (
            <tr key={rule}>
              <th scope="row">{rule}</th>
              <td>{a}</td>
              <td>{b}</td>
              <td>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
