import { WRITER, editor, expect, seedLocalStorage, test } from "./helpers";

const LEGACY_KEY = `makeebook_library_${WRITER.id}`;
const WORDS =
  "the keeper counted every ship that passed the rocks and wrote each one down with the time the weather and the colour of its lamp".split(
    " ",
  );

function paragraph(seed: number, words: number) {
  const out: string[] = [];
  for (let i = 0; i < words; i++)
    out.push(WORDS[(seed * 7 + i) % WORDS.length]);
  out[0] = out[0][0].toUpperCase() + out[0].slice(1);
  return `<p>${out.join(" ")}.</p>`;
}

function chapter(index: number, words: number) {
  const paragraphs: string[] = [];
  for (let i = 0; i < words / 100; i++)
    paragraphs.push(paragraph(index * 31 + i, 100));
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    title: `Chapter ${index + 1}`,
    content: paragraphs.join(""),
    type: "content",
  };
}

function longBook() {
  const chapters = [chapter(0, 6400)];
  for (let i = 1; i < 40; i++) chapters.push(chapter(i, 2400));
  return {
    id: "5a1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b",
    title: "The Long Book",
    author: "Mara Quill",
    blurb: "",
    publisher: "",
    pubDate: "2025-03-01",
    isbn: "",
    language: "English",
    genre: "",
    tags: [],
    coverFile: null,
    endnotes: [],
    endnoteReferences: [],
    chapters,
    savedAt: Date.now() - 60_000,
  };
}

test.skip(
  !process.env.E2E_PERF,
  "Set E2E_PERF=1 to run the typing performance check.",
);

test("typing in a long chapter of a 100,000-word book has no long tasks", async ({
  page,
}, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await seedLocalStorage(page, { [LEGACY_KEY]: JSON.stringify([longBook()]) });
  await page.goto("/make-ebook?fps=0");
  const surface = editor(page);
  await expect(surface).toContainText("Keeper", { timeout: 60_000 });
  await expect(surface.locator("p")).toHaveCount(64, { timeout: 60_000 });

  await surface.click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    const w = window as unknown as { __longTasks: number[]; __keys: number[] };
    w.__longTasks = [];
    w.__keys = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) w.__longTasks.push(entry.duration);
    }).observe({ type: "longtask" });
    document.addEventListener(
      "keydown",
      () => {
        const start = performance.now();
        requestAnimationFrame(() =>
          setTimeout(() => w.__keys.push(performance.now() - start), 0),
        );
      },
      true,
    );
  });

  const typed =
    " And then the light went out over the water, one lamp at a time, until only the keeper was left.";
  await page.keyboard.type(typed, { delay: 35 });
  await page.waitForTimeout(400);
  await expect(surface).toContainText("until only the keeper was left.");

  const { longTasks, keys } = await page.evaluate(() => {
    const w = window as unknown as { __longTasks: number[]; __keys: number[] };
    return { longTasks: w.__longTasks, keys: w.__keys };
  });
  const sorted = [...keys].sort((a, b) => a - b);
  const result = {
    keystrokes: keys.length,
    medianKeyToPaintMs: Math.round(sorted[Math.floor(sorted.length / 2)] ?? 0),
    worstKeyToPaintMs: Math.round(sorted[sorted.length - 1] ?? 0),
    longTasks: longTasks.length,
    longestTaskMs: Math.round(Math.max(0, ...longTasks)),
  };
  info.annotations.push({
    type: "typing",
    description: JSON.stringify(result),
  });
  console.log(`typing in a long chapter: ${JSON.stringify(result)}`);
  expect(result.longestTaskMs, "longest task while typing").toBeLessThan(50);
});
