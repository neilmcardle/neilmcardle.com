import { build } from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "app/make-ebook/editor/bridge");
const out = process.argv[2] ?? join(root, "dist/editor-bundle");

mkdirSync(out, { recursive: true });

await build({
  entryPoints: [join(source, "bridge.ts")],
  outfile: join(out, "bridge.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["safari16"],
  minify: true,
  sourcemap: false,
  legalComments: "none",
  logLevel: "warning",
});

copyFileSync(join(source, "index.html"), join(out, "index.html"));
copyFileSync(join(source, "bridge.css"), join(out, "bridge.css"));

console.log(`Editor bundle written to ${out}`);
