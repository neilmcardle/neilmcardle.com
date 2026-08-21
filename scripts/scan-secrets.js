const { execSync } = require("child_process");
const path = require("path");

const CREDENTIALS = [
  [/\b(?:sk|rk)_live_[A-Za-z0-9]{16,}/, "Stripe live key"],
  [/\bsk_test_[A-Za-z0-9]{16,}/, "Stripe test key"],
  [/\bwhsec_[A-Za-z0-9]{16,}/, "Stripe webhook signing secret"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key id"],
  [/\bASIA[0-9A-Z]{16}\b/, "AWS temporary access key id"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, "GitHub token"],
  [/\bgithub_pat_[A-Za-z0-9_]{40,}/, "GitHub fine-grained token"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, "Slack token"],
  [/\bsk-ant-[A-Za-z0-9_-]{20,}/, "Anthropic API key"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "Google API key"],
  [/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/, "private key block"],
  [
    /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    "JSON web token",
  ],
  [
    /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^\s:@/]+:[^\s:@/]{3,}@/,
    "connection string with inline password",
  ],
];

const SECRET_NAME =
  /(pass(?:word|wd)?|secret|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key|client[_-]?secret|credential)/i;

const ASSIGNED_LITERAL = /([A-Za-z_$][\w$]*)\s*[:=]\s*(['"`])([^'"`\n]{8,})\2/;

const PLACEHOLDER =
  /^(?:x{3,}|y{3,}|\.{3,}|<.*>|\$\{.*\}|your[_-]|changeme|placeholder|example|test|dummy|redacted|todo|null|undefined|true|false)/i;

const ALLOW = /(?:pragma:\s*allowlist secret|secret-scan:\s*ignore)/i;

const BINARY =
  /\.(png|jpe?g|gif|webp|avif|ico|svg|pdf|zip|gz|tgz|mp[34]|mov|woff2?|ttf|otf|eot|icns|node|wasm|keystore|jks)$/i;

function stagedFiles() {
  try {
    return execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    })
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function stagedContent(file) {
  try {
    return execSync(`git show :"${file}"`, {
      encoding: "utf-8",
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

const findings = [];

for (const file of stagedFiles()) {
  const base = path.basename(file);

  if (/^\.env(\.|$)/.test(base) && !/example|sample|template/i.test(base)) {
    findings.push({ file, line: 0, what: "environment file staged" });
    continue;
  }
  if (BINARY.test(file)) continue;

  const content = stagedContent(file);
  if (content === null || content.includes("\u0000")) continue;

  content.split("\n").forEach((line, i) => {
    if (ALLOW.test(line)) return;

    for (const [pattern, what] of CREDENTIALS) {
      if (pattern.test(line)) {
        findings.push({ file, line: i + 1, what });
        return;
      }
    }

    const assigned = line.match(ASSIGNED_LITERAL);
    if (!assigned) return;
    const [, name, , value] = assigned;
    if (!SECRET_NAME.test(name)) return;
    if (PLACEHOLDER.test(value)) return;
    if (/^(?:process\.env|import\.meta|window\.|globalThis)/.test(value))
      return;
    findings.push({ file, line: i + 1, what: `literal assigned to ${name}` });
  });
}

if (findings.length === 0) {
  console.log("    ✓ no secrets detected");
  process.exit(0);
}

for (const { file, line, what } of findings) {
  console.log(`    ❌ ${file}${line ? `:${line}` : ""} — ${what}`);
}
console.log(
  "\n    Commit blocked. Move the value to an environment variable, or add",
);
console.log(
  "    `pragma: allowlist secret` to the line if it is a false alarm.",
);
process.exit(1);
