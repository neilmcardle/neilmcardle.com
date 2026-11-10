import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SOURCE = "https://companiesmarketcap.com/";
const CSV = "https://companiesmarketcap.com/?download=csv";
const TOP = 100;
const COUNTRY = {
  "United States": "USA",
  "United Kingdom": "UK",
  "United Arab Emirates": "UAE",
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const folder = join(root, "app/explorations/how-companies-started");

const res = await fetch(CSV, { headers: { "User-Agent": "neilmcardle.com" } });
if (!res.ok) throw new Error(`CompaniesMarketCap returned ${res.status}`);
const text = await res.text();

const rows = text
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.trim().slice(1, -1).split('","'))
  .map(([rank, name, symbol, cap, , country]) => ({
    rank: Number(rank),
    name,
    symbol,
    marketCapBn: Math.round(Number(cap) / 1e8) / 10,
    country: COUNTRY[country] ?? country,
  }))
  .filter((r) => r.rank && r.symbol && r.marketCapBn)
  .sort((a, b) => a.rank - b.rank)
  .slice(0, TOP);

if (rows.length < TOP) throw new Error(`Only ${rows.length} rows came back`);

const snapshot = {
  asOf: new Date().toISOString().slice(0, 10),
  source: SOURCE,
  companies: rows,
};
await writeFile(
  join(folder, "snapshot.json"),
  `${JSON.stringify(snapshot, null, 2)}\n`,
);

const stories = await readFile(join(folder, "stories.ts"), "utf8");
const known = new Set(
  [...stories.matchAll(/symbol: "([^"]+)"/g)].map((m) => m[1]),
);
const missing = rows.filter((r) => !known.has(r.symbol));

console.log(`Saved the top ${rows.length} as of ${snapshot.asOf}.`);
if (missing.length) {
  console.log("These have no founding story yet:");
  for (const r of missing) console.log(`  ${r.rank}. ${r.name} (${r.symbol})`);
} else {
  console.log("Every company has a founding story.");
}
