import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = "public/cv/neil-mcardle-cv.pdf";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.goto(`${BASE}/cv`, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await mkdir("public/cv", { recursive: true });
await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log(`Saved ${OUT}`);
