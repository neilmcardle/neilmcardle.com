#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf-8",
    });
    return output
      .split("\n")
      .filter((file) => file && /\.(ts|tsx|js|jsx)$/.test(file))
      .map((file) => path.resolve(process.cwd(), file))
      .filter((file) => fs.existsSync(file));
  } catch (err) {
    return [];
  }
}

function stripComments(content) {
  let result = "";
  let i = 0;
  let inString = false;
  let stringChar = "";

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (
      (char === '"' || char === "'" || char === "`") &&
      (i === 0 || content[i - 1] !== "\\")
    ) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    // Skip comments when not in string
    if (!inString) {
      // Single-line comment
      if (char === "/" && nextChar === "/") {
        const lineEnd = content.indexOf("\n", i);
        if (lineEnd === -1) {
          break;
        }
        i = lineEnd;
        result += "\n";
        continue;
      }

      // Multi-line comment
      if (char === "/" && nextChar === "*") {
        const commentEnd = content.indexOf("*/", i + 2);
        if (commentEnd === -1) {
          break;
        }
        i = commentEnd + 2;
        const commentContent = content.substring(
          i - (commentEnd + 2 - i),
          commentEnd + 2,
        );
        const lineBreaks = (commentContent.match(/\n/g) || []).length;
        result += "\n".repeat(lineBreaks);
        continue;
      }
    }

    result += char;
    i++;
  }

  return result;
}

const stagedFiles = getStagedFiles();
let modified = 0;

stagedFiles.forEach((file) => {
  const original = fs.readFileSync(file, "utf-8");
  const stripped = stripComments(original);

  if (original !== stripped) {
    fs.writeFileSync(file, stripped, "utf-8");
    execSync(`git add "${file}"`);
    modified++;
  }
});

if (modified > 0) {
  console.log(`Comment stripper: removed comments from ${modified} file(s)`);
}
