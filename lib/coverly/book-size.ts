import { readFileSync } from "node:fs";
import { join } from "node:path";

type SizeRec = {
  height_cm: number | null;
  pages: number | null;
  binding: string | null;
};

let sizes: Record<string, SizeRec> | null = null;
function load(): Record<string, SizeRec> {
  if (!sizes) {
    try {
      sizes = JSON.parse(
        readFileSync(
          join(process.cwd(), "data", "coverly-dimensions.json"),
          "utf8",
        ),
      );
    } catch {
      sizes = {};
    }
  }
  return sizes!;
}

function heuristic(rec: SizeRec | undefined): number {
  const binding = (rec?.binding ?? "").toLowerCase();
  const pages = rec?.pages ?? 0;
  if (/mass market/.test(binding)) return 17.5;
  if (/hardcover|hardback/.test(binding)) return pages > 520 ? 24.3 : 23.5;
  if (/paperback|softcover|perfect/.test(binding))
    return pages > 430 ? 21.1 : 19.8;
  if (pages > 500) return 23.3;
  return 20.6;
}

function jitter(isbn13: string): number {
  let h = 0;
  for (let i = 0; i < isbn13.length; i++)
    h = (h * 31 + isbn13.charCodeAt(i)) >>> 0;
  return ((h % 7) - 3) * 0.12;
}

export function resolveHeightCm(isbn13: string | null | undefined): number {
  if (!isbn13) return 21.0;
  const rec = load()[isbn13];
  const base = rec?.height_cm ?? heuristic(rec);
  return Math.min(25.5, Math.max(16, +(base + jitter(isbn13)).toFixed(1)));
}

export function withHeights<T extends { isbn13?: string | null }>(
  covers: T[],
): (T & { height_cm: number })[] {
  return covers.map((c) => ({ ...c, height_cm: resolveHeightCm(c.isbn13) }));
}
