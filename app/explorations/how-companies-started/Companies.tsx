"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Company } from "./rows";
import type { StartBand } from "./stories";
import styles from "./companies.module.css";

const BANDS: { band: StartBand; label: string }[] = [
  { band: 1, label: "Tiny start (under ~$10k)" },
  { band: 2, label: "Small start ($10k–$1m)" },
  { band: 3, label: "Big start ($1m+)" },
  { band: 4, label: "Not a startup (state, merger, spin-off)" },
];

const SHORT: Record<StartBand, string> = {
  1: "Tiny start",
  2: "Small start",
  3: "Big start",
  4: "Not a startup",
};

const ERAS = [
  { id: "", label: "Any year", test: () => true },
  { id: "pre1900", label: "Before 1900", test: (y: number) => y < 1900 },
  {
    id: "1900",
    label: "1900–1949",
    test: (y: number) => y >= 1900 && y < 1950,
  },
  {
    id: "1950",
    label: "1950–1979",
    test: (y: number) => y >= 1950 && y < 1980,
  },
  {
    id: "1980",
    label: "1980–1999",
    test: (y: number) => y >= 1980 && y < 2000,
  },
  { id: "2000", label: "2000 onwards", test: (y: number) => y >= 2000 },
];

const SORTS = [
  { id: "", label: "Market cap rank" },
  { id: "cheapest", label: "Cheapest start first" },
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "name", label: "Name A–Z" },
];

type Filters = {
  q: string;
  sector: string;
  country: string;
  era: string;
  sort: string;
  bands: StartBand[];
};

const EMPTY: Filters = {
  q: "",
  sector: "",
  country: "",
  era: "",
  sort: "",
  bands: [],
};

function fromUrl(search: string): Filters {
  const p = new URLSearchParams(search);
  const bands = (p.get("band") ?? "")
    .split(",")
    .map(Number)
    .filter((b): b is StartBand => b >= 1 && b <= 4);
  return {
    q: p.get("q") ?? "",
    sector: p.get("sector") ?? "",
    country: p.get("country") ?? "",
    era: ERAS.some((e) => e.id === p.get("era")) ? (p.get("era") ?? "") : "",
    sort: SORTS.some((s) => s.id === p.get("sort"))
      ? (p.get("sort") ?? "")
      : "",
    bands: [...new Set(bands)].sort(),
  };
}

function toUrl(f: Filters) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.sector) p.set("sector", f.sector);
  if (f.country) p.set("country", f.country);
  if (f.era) p.set("era", f.era);
  if (f.sort) p.set("sort", f.sort);
  if (f.bands.length) p.set("band", f.bands.join(","));
  const s = p.toString();
  return s ? `?${s}` : "";
}

function money(bn: number) {
  return bn >= 1000
    ? `$${(Math.round(bn / 10) / 100).toFixed(2)}tn`
    : `$${Math.round(bn)}bn`;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length / 2;
  return Math.round(
    s.length % 2 ? s[Math.floor(mid)] : (s[mid - 1] + s[mid]) / 2,
  );
}

function Dots({ band }: { band: StartBand }) {
  return (
    <svg
      className={styles.dots}
      viewBox="0 0 22 6"
      width="22"
      height="6"
      aria-hidden="true"
    >
      {band === 4 ? (
        <rect x="1" y="1" width="20" height="4" rx="2" />
      ) : (
        [0, 1, 2].map((i) => (
          <circle key={i} cx={3 + i * 8} cy="3" r="2.5" data-on={i < band} />
        ))
      )}
    </svg>
  );
}

export default function Companies({ companies }: { companies: Company[] }) {
  const [f, setF] = useState<Filters>(EMPTY);
  const ready = useRef(false);

  const sectors = useMemo(
    () =>
      [
        ...new Set(companies.flatMap((c) => (c.sector ? [c.sector] : []))),
      ].sort(),
    [companies],
  );
  const countries = useMemo(
    () => [...new Set(companies.map((c) => c.country))].sort(),
    [companies],
  );

  useEffect(() => {
    setF(fromUrl(window.location.search));
    const back = () => setF(fromUrl(window.location.search));
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);

  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      return;
    }
    const next = `${window.location.pathname}${toUrl(f)}`;
    if (next !== `${window.location.pathname}${window.location.search}`)
      window.history.replaceState(null, "", next);
  }, [f]);

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const era = ERAS.find((e) => e.id === f.era) ?? ERAS[0];
    const list = companies.filter(
      (c) =>
        (!q ||
          [c.name, c.symbol, c.story, c.sector, c.country, c.startCost]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (!f.sector || c.sector === f.sector) &&
        (!f.country || c.country === f.country) &&
        (!f.era || (c.founded !== undefined && era.test(c.founded))) &&
        (!f.bands.length ||
          (c.startBand !== undefined && f.bands.includes(c.startBand))),
    );
    const band = (c: Company) => c.startBand ?? 5;
    const by: Record<string, (a: Company, b: Company) => number> = {
      cheapest: (a, b) => band(a) - band(b) || a.rank - b.rank,
      newest: (a, b) =>
        (b.founded ?? -1e4) - (a.founded ?? -1e4) || a.rank - b.rank,
      oldest: (a, b) =>
        (a.founded ?? 1e4) - (b.founded ?? 1e4) || a.rank - b.rank,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[f.sort] ?? ((a, b) => a.rank - b.rank));
  }, [companies, f]);

  const total = rows.reduce((s, c) => s + c.marketCapBn, 0);
  const set = (patch: Partial<Filters>) =>
    setF((old) => ({ ...old, ...patch }));
  const toggle = (band: StartBand) =>
    setF((old) => ({
      ...old,
      bands: old.bands.includes(band)
        ? old.bands.filter((b) => b !== band)
        : [...old.bands, band].sort(),
    }));
  const dirty = toUrl(f) !== "";

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.controls}>
          <label className={`${styles.field} ${styles.search}`}>
            <span className={styles.hidden}>Search</span>
            <input
              type="search"
              value={f.q}
              placeholder="Search companies"
              onChange={(e) => set({ q: e.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.hidden}>Sector</span>
            <select
              value={f.sector}
              onChange={(e) => set({ sector: e.target.value })}
            >
              <option value="">All sectors</option>
              {sectors.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.hidden}>Country</span>
            <select
              value={f.country}
              onChange={(e) => set({ country: e.target.value })}
            >
              <option value="">All countries</option>
              {countries.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.hidden}>Founded</span>
            <select
              value={f.era}
              onChange={(e) => set({ era: e.target.value })}
            >
              {ERAS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.hidden}>Sort</span>
            <select
              value={f.sort}
              onChange={(e) => set({ sort: e.target.value })}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.row}>
          <div
            className={styles.chips}
            role="group"
            aria-label="How it started"
          >
            {BANDS.map(({ band, label }) => (
              <button
                key={band}
                type="button"
                className={styles.chip}
                aria-pressed={f.bands.includes(band)}
                aria-label={label}
                title={label}
                onClick={() => toggle(band)}
              >
                <Dots band={band} />
                {SHORT[band]}
              </button>
            ))}
          </div>
          {dirty ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.action}
                onClick={() => setF(EMPTY)}
              >
                Reset
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <p className={styles.count} aria-live="polite">
        Showing {rows.length} of {companies.length} companies
        {rows.length ? (
          <>
            {" "}
            · {money(total)} combined · median founding year{" "}
            {median(
              rows.flatMap((c) => (c.founded === undefined ? [] : [c.founded])),
            )}
          </>
        ) : null}
      </p>

      <table className={styles.table}>
        <caption className={styles.hidden}>
          The world&rsquo;s 100 most valuable companies and how each started
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.num}>
              #
            </th>
            <th scope="col">Company</th>
            <th scope="col" className={styles.num}>
              Value
            </th>
            <th scope="col">How it started</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((c) => (
              <tr key={c.symbol}>
                <td className={styles.num}>{c.rank}</td>
                <th scope="row">
                  <span className={styles.strong}>{c.name}</span>
                  <span className={styles.sub}>{c.country}</span>
                </th>
                <td className={`${styles.num} ${styles.value}`}>
                  {money(c.marketCapBn)}
                </td>
                <td>
                  {c.startBand && c.story ? (
                    <>
                      <span className={styles.badge}>
                        <span className={styles.year}>{c.founded}</span>
                        <Dots band={c.startBand} />
                        <span className={styles.hidden}>
                          {SHORT[c.startBand]}:{" "}
                        </span>
                        {c.startCost}
                      </span>
                      <span className={styles.story}>{c.story}</span>
                    </>
                  ) : (
                    <span className={styles.story}>Story coming.</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className={styles.empty}>
                No companies match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
