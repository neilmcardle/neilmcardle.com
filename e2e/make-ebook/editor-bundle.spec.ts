import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { countWords, htmlToText } from "../../app/make-ebook/model/text";

type Message = {
  type: string;
  html?: string;
  words?: number;
  [k: string]: unknown;
};

let bundle = "";

test.beforeAll(() => {
  bundle = mkdtempSync(join(tmpdir(), "editor-bundle-"));
  execFileSync("node", ["scripts/build-editor-bundle.mjs", bundle], {
    stdio: "ignore",
  });
});

async function open(page: Page) {
  await page.addInitScript(() => {
    const store = window as unknown as { messages: unknown[] };
    store.messages = [];
    (window as unknown as { webkit: unknown }).webkit = {
      messageHandlers: {
        makeEbook: { postMessage: (m: unknown) => store.messages.push(m) },
      },
    };
  });
  await page.goto(pathToFileURL(join(bundle, "index.html")).href);
  await expect
    .poll(() => messages(page).then((all) => all.map((m) => m.type)))
    .toContain("ready");
}

function messages(page: Page): Promise<Message[]> {
  return page.evaluate(
    () => (window as unknown as { messages: Message[] }).messages,
  );
}

async function lastChange(page: Page): Promise<Message | undefined> {
  const all = await messages(page);
  return all.filter((m) => m.type === "change").at(-1);
}

const bridge = (page: Page, script: string) =>
  page.evaluate(script) as Promise<unknown>;

const CHAPTER = [
  "<p>The keeper counted every ship.</p>",
  '<p>He wrote their names<a class="note-1" href="#end1" id="ref1" title="note 1" data-endnote-ref="1" data-endnote-id="note-a" style="color: #0066cc;"><sup>[1]</sup></a> in a ledger.</p>',
  "<ul><li>Wind</li><li>Tide</li></ul>",
  '<p>See <a href="https://example.com/tides">the tables</a>.</p>',
].join("");

test.describe("the editor bundle for the iPhone app", () => {
  test("loads a chapter and gives back exactly the same HTML", async ({
    page,
  }) => {
    await open(page);
    await bridge(
      page,
      `window.makeEbook.load({ html: ${JSON.stringify(CHAPTER)} })`,
    );
    const first = (await bridge(page, "window.makeEbook.html()")) as string;
    expect(first).toContain('data-endnote-ref="1"');
    expect(first).toContain('style="color: #0066cc;"');
    expect(first).toContain("<ul>");
    await bridge(
      page,
      `window.makeEbook.load({ html: ${JSON.stringify(first)} })`,
    );
    expect(await bridge(page, "window.makeEbook.html()")).toBe(first);
    const loaded = (await messages(page)).filter((m) => m.type === "loaded");
    expect(loaded.at(-1)?.words).toBe(countWords(htmlToText(CHAPTER)));
  });

  test("reports typing after a pause with the word count", async ({ page }) => {
    await open(page);
    await bridge(page, `window.makeEbook.load({ html: "<p>The lamp</p>" })`);
    await page.locator(".bridge-prose").click();
    await page.keyboard.press("End");
    await page.keyboard.type(" was lit.");
    await expect
      .poll(() => lastChange(page).then((m) => m?.html))
      .toBe("<p>The lamp was lit.</p>");
    expect((await lastChange(page))?.words).toBe(4);
  });

  test("runs formatting commands and reports the format state", async ({
    page,
  }) => {
    await open(page);
    await bridge(page, `window.makeEbook.load({ html: "<p>Low tide</p>" })`);
    await page.locator(".bridge-prose").click();
    await page.keyboard.press("ControlOrMeta+a");
    await bridge(page, `window.makeEbook.command("bold")`);
    await bridge(page, `window.makeEbook.command("bulletList")`);
    const html = (await bridge(page, "window.makeEbook.flush()")) as string;
    expect(html).toBe("<ul><li><strong>Low tide</strong></li></ul>");
    const formats = (await messages(page)).filter((m) => m.type === "format");
    expect(formats.at(-1)?.format).toMatchObject({
      bold: true,
      bulletList: true,
    });
    await bridge(page, `window.makeEbook.command("undo")`);
    expect(await bridge(page, "window.makeEbook.html()")).toBe(
      "<p><strong>Low tide</strong></p>",
    );
  });

  test("shows a placeholder only while the chapter is empty", async ({
    page,
  }) => {
    await open(page);
    await bridge(
      page,
      `window.makeEbook.load({ html: "", placeholder: "Keep writing" })`,
    );
    const mount = page.locator("#editor");
    await expect(mount).toHaveAttribute("data-empty", "");
    await expect(mount).toHaveAttribute("data-placeholder", "Keep writing");
    await page.locator(".bridge-prose").click();
    await page.keyboard.type("A");
    await expect(mount).not.toHaveAttribute("data-empty", /.*/);
  });

  test("takes its colours and size from the app", async ({ page }) => {
    await open(page);
    await bridge(
      page,
      `window.makeEbook.setView({ page: "#f2efe7", ink: "#2a2a28", muted: "#77746b", accent: "#dcdcdc", fontPx: 20 })`,
    );
    const style = await page.evaluate(() => {
      const s = getComputedStyle(document.body);
      const editor = getComputedStyle(document.getElementById("editor")!);
      return { bg: s.backgroundColor, size: editor.fontSize };
    });
    expect(style).toEqual({ bg: "rgb(242, 239, 231)", size: "20px" });
  });

  test("saves straight away when the editor loses focus", async ({ page }) => {
    await open(page);
    await bridge(page, `window.makeEbook.load({ html: "<p>Gulls</p>" })`);
    await page.locator(".bridge-prose").click();
    await page.keyboard.press("End");
    await page.keyboard.type(" followed");
    await bridge(page, "window.makeEbook.blur()");
    const change = await lastChange(page);
    expect(change?.html).toBe("<p>Gulls followed</p>");
    const focus = (await messages(page)).filter((m) => m.type === "focus");
    expect(focus.at(-1)).toEqual({ type: "focus", focused: false });
  });
});
