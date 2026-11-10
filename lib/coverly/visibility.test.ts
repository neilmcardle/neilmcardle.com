import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["app", "lib"];
const SKIP = new Set(["node_modules", ".next", "v2"]);

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts"))
      out.push(path);
  }
  return out;
}

describe("taken-down covers stay hidden", () => {
  const files = ROOTS.flatMap(sourceFiles);

  it("filters every query on the covers table by delisted", () => {
    const missing: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (!line.includes('.from("covers")')) return;
        const chain = lines.slice(i, i + 12).join("\n");
        if (!chain.includes('.eq("delisted", false)'))
          missing.push(`${file}:${i + 1}`);
      });
    }
    expect(missing).toEqual([]);
  });

  it("filters every REST request for covers by delisted", () => {
    const missing: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const requests = text.match(/rest\/v1\/covers\?[^`"']*/g) ?? [];
      for (const url of requests) {
        if (!/delisted=is\.false|\$\{filters\}/.test(url))
          missing.push(`${file}: ${url}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
