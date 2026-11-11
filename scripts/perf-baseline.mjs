import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:3005";
const RUNS = Number(process.argv[3] ?? 3);

async function measure() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  const bytes = { landing: { js: 0, all: 0 }, editor: { js: 0, all: 0 } };
  let phase = "landing";
  const types = new Map();
  cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type));
  cdp.on("Network.loadingFinished", (e) => {
    const b = bytes[phase];
    b.all += e.encodedDataLength;
    if (types.get(e.requestId) === "Script") b.js += e.encodedDataLength;
  });

  await page.addInitScript(() => {
    window.__perf = { lcp: 0, longTasks: [], events: [] };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__perf.lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        window.__perf.longTasks.push({
          start: e.startTime,
          duration: e.duration,
        });
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        window.__perf.events.push({ name: e.name, duration: e.duration });
    }).observe({ type: "event", durationThreshold: 16, buffered: true });
  });

  const t0 = Date.now();
  await page.goto(`${BASE}/make-ebook`, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const landing = await page.evaluate(() => {
    const p = window.__perf;
    const blocking = p.longTasks.reduce(
      (s, t) => s + Math.max(0, t.duration - 50),
      0,
    );
    return {
      lcp: Math.round(p.lcp),
      blocking: Math.round(blocking),
      longTasks: p.longTasks.length,
    };
  });
  const landingLoadMs = Date.now() - t0;

  const editorStats = {};
  const openMs = 0;
  await browser.close();
  return {
    landing: {
      ...landing,
      loadMs: landingLoadMs,
      jsKB: Math.round(bytes.landing.js / 1024),
      totalKB: Math.round(bytes.landing.all / 1024),
    },
    editor: {
      openMs,
      ...editorStats,
      extraJsKB: Math.round(bytes.editor.js / 1024),
      extraTotalKB: Math.round(bytes.editor.all / 1024),
    },
  };
}

const results = [];
for (let i = 0; i < RUNS; i++) results.push(await measure());
const median = (xs) =>
  xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const summary = {};
for (const section of ["landing"]) {
  summary[section] = {};
  for (const key of Object.keys(results[0][section]))
    summary[section][key] = median(results.map((r) => r[section][key]));
}
console.log(
  JSON.stringify({ runs: RUNS, median: summary, all: results }, null, 1),
);
