const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const DIRECTIVE =
  /^[/*\s]*(@ts-|eslint|prettier-ignore|istanbul|c8 |v8 ignore|webpack|@jsx|#__PURE__|@license|@preserve|<reference)/;

function getStagedFiles() {
  try {
    return execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    })
      .split("\n")
      .filter((file) => file && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file))
      .map((file) => path.resolve(process.cwd(), file))
      .filter((file) => fs.existsSync(file));
  } catch {
    return [];
  }
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".ts")) return ts.ScriptKind.TS;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  return ts.ScriptKind.JS;
}

function collectRanges(source, text) {
  const ranges = [];
  const seen = new Set();

  const add = (pos, end) => {
    const key = `${pos}:${end}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (DIRECTIVE.test(text.slice(pos, end))) return;
    ranges.push({ pos, end });
  };

  const visit = (node) => {
    if (ts.isJsxExpression(node) && !node.expression) {
      const inner = text.slice(node.getStart(source), node.getEnd());
      if (!DIRECTIVE.test(inner.replace(/^\{/, ""))) {
        add(node.getStart(source), node.getEnd());
      }
      return;
    }
    for (const range of ts.getLeadingCommentRanges(text, node.getFullStart()) ||
      []) {
      add(range.pos, range.end);
    }
    for (const range of ts.getTrailingCommentRanges(text, node.getEnd()) ||
      []) {
      add(range.pos, range.end);
    }
    node.forEachChild(visit);
  };

  visit(source);
  return ranges.sort((a, b) => b.pos - a.pos);
}

function stripComments(text, file) {
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(file),
  );
  let out = text;
  for (const { pos, end } of collectRanges(source, text)) {
    out = out.slice(0, pos) + out.slice(end);
  }
  return out
    .split("\n")
    .filter((line, i, lines) => {
      if (line.trim() !== "") return true;
      return i > 0 && lines[i - 1].trim() !== "";
    })
    .join("\n");
}

let changed = 0;
for (const file of getStagedFiles()) {
  const original = fs.readFileSync(file, "utf-8");
  let stripped;
  try {
    stripped = stripComments(original, file);
  } catch {
    continue;
  }
  if (stripped === original) continue;

  const check = ts.createSourceFile(
    file,
    stripped,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(file),
  );
  if (check.parseDiagnostics && check.parseDiagnostics.length > 0) {
    console.log(`    skipped ${path.basename(file)} (would not parse)`);
    continue;
  }
  fs.writeFileSync(file, stripped, "utf-8");
  execSync(`git add "${file}"`);
  changed += 1;
}
console.log(`    ✓ comments stripped from ${changed} file(s)`);
