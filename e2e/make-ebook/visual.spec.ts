import { WRITER, editor, expect, seedLocalStorage, test } from "./helpers";

const LEGACY_KEY = `makeebook_library_${WRITER.id}`;

const CONTENT = [
  "<h1>Chapter heading</h1>",
  "<p>The keeper counted every ship that passed the rocks. Some nights there were <strong>none at all</strong>, and on others the sea was <em>crowded with lights</em> from end to end.</p>",
  "<p>He wrote each one down with the time, the weather and the colour of its lamp.</p>",
  "<h2>A smaller heading</h2>",
  "<blockquote><p>The light does not choose who it saves.</p></blockquote>",
  "<ul><li>First item in a list</li><li>Second item, a little longer than the first</li></ul>",
  "<ol><li>Numbered one</li><li>Numbered two</li></ol>",
  '<p>A line with <u>underline</u>, <s>strike</s>, H<sub>2</sub>O and E = mc<sup>2</sup>, and a <a href="https://example.com">link</a>.</p>',
  "<hr>",
  "<p>After the break, the morning came slowly.</p>",
].join("");

function book() {
  return {
    id: "6f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b",
    title: "The Lighthouse",
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
    chapters: [
      {
        id: "1b2c3d4e-5f60-4a7b-8c9d-0e1f2a3b4c5d",
        title: "The Light",
        content: CONTENT,
        type: "content",
      },
    ],
    savedAt: Date.now() - 60_000,
  };
}

for (const size of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "phone", width: 390, height: 844 },
]) {
  test(`the chapter surface looks the same on ${size.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await seedLocalStorage(page, { [LEGACY_KEY]: JSON.stringify([book()]) });
    await page.goto("/make-ebook?fps=0");
    const surface = editor(page);
    await expect(surface).toContainText(
      "After the break, the morning came slowly.",
    );
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
    await expect(surface).toHaveScreenshot(`surface-${size.name}.png`, {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    });
  });
}
