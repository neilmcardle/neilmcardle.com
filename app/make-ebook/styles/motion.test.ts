import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const SKIP = /\/(marketing|blog)\//;
const LAYOUT =
  /\b(all|width|height|min-width|max-width|min-height|max-height|top|left|right|bottom|inset|margin[a-z-]*|padding[a-z-]*|flex-basis|grid-template[a-z-]*)\b/;

const KNOWN: Record<string, string> = {
  "components/CollapsibleSection.tsx | transition-[height,opacity]":
    "phase 3, drawer sections",
  "components/CollapsibleSidebar.tsx | transition-all": "phase 3, side panel",
  "layout/EditorShell.tsx | transition-[padding]": "phase 3, Book Mind dock",
  "styles/studio.module.css | width 1400ms": "phase 6, landing demo",
  "styles/studio.module.css | top 320ms": "phase 4, tour spotlight",
};

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    if (!/\.(css|tsx?)$/.test(path) || /\.test\./.test(path)) return [];
    return SKIP.test(`${path}/`) ? [] : [path];
  });
}

function strip(value: string): string {
  return value.replace(/(var|cubic-bezier|linear)\([^)]*\)/g, "");
}

function layoutTransitions(): string[] {
  const found: string[] = [];
  for (const path of files(ROOT)) {
    const file = relative(ROOT, path);
    const source = readFileSync(path, "utf8");
    if (path.endsWith(".css")) {
      for (const m of source.matchAll(
        /transition(?:-property)?\s*:\s*([^;]+);/g,
      )) {
        if (!LAYOUT.test(strip(m[1]))) continue;
        const value = m[1].replace(/\s+/g, " ").trim();
        found.push(`${file} | ${value.split(" ").slice(0, 2).join(" ")}`);
      }
      continue;
    }
    for (const m of source.matchAll(/transition-(all|\[[^\]]+\])/g)) {
      if (m[1] === "all" || LAYOUT.test(m[1])) found.push(`${file} | ${m[0]}`);
    }
  }
  return found;
}

describe("editor motion", () => {
  it("only animates transform and opacity, apart from the known cases", () => {
    const found = layoutTransitions();
    const unknown = found.filter((entry) => !(entry in KNOWN));
    expect(unknown).toEqual([]);
  });

  it("keeps the list of known cases honest", () => {
    const found = new Set(layoutTransitions());
    const fixed = Object.keys(KNOWN).filter((entry) => !found.has(entry));
    expect(fixed).toEqual([]);
  });
});
