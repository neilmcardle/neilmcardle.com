import type { Page } from "@playwright/test";
import {
  addChapterButton,
  chapterRows,
  editor,
  expect,
  exportEpub,
  openEditor,
  openPanel,
  setBookTitle,
  test,
  typeInEditor,
  waitForSave,
} from "./helpers";

function streamed(text: string) {
  return {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
    body: [
      `data: ${JSON.stringify({ content: text })}`,
      "",
      "data: [DONE]",
      "",
      "",
    ].join("\n"),
  };
}

async function selectText(page: Page, text: string) {
  await editor(page).evaluate((root, wanted) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const at = node.textContent?.indexOf(wanted) ?? -1;
      if (at < 0) continue;
      const range = document.createRange();
      range.setStart(node, at);
      range.setEnd(node, at + wanted.length);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    throw new Error(`text not found: ${wanted}`);
  }, text);
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe(text);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 50)),
      ),
  );
}

test.describe("Book Mind rewrite", () => {
  test.use({ tier: "pro" });

  test("an accepted inline rewrite undoes and redoes in one step", async ({
    page,
  }) => {
    const requests: unknown[] = [];
    await page.route("**/api/ai/book-mind", async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill(streamed("The lamp burned white and fierce."));
    });

    await openEditor(page);
    await setBookTitle(page, "Lamp Light");
    const original = "The lamp was lit. It was very bright indeed.";
    await typeInEditor(page, original);
    await waitForSave(page);

    await editor(page).click();
    await selectText(page, "It was very bright indeed.");
    await page.keyboard.press("ControlOrMeta+k");

    const popover = page.getByRole("dialog", {
      name: "Edit selection with Book Mind",
    });
    await expect(popover).toBeVisible();
    await expect(popover).toContainText("It was very bright indeed.");
    const instruction = popover.getByPlaceholder(/Make this tighter/);
    await instruction.fill("Make it vivid.");
    await instruction.press("Enter");
    await expect(
      popover.getByText("The lamp burned white and fierce.").first(),
    ).toBeVisible();
    await instruction.press("Enter");
    await expect(popover).toHaveCount(0);

    const rewritten = "The lamp was lit. The lamp burned white and fierce.";
    await expect(editor(page)).toHaveText(rewritten);
    expect(requests.length).toBeGreaterThan(0);
    expect(JSON.stringify(requests[0])).toContain("Make it vivid.");

    await page.keyboard.press("ControlOrMeta+z");
    await expect(editor(page)).toHaveText(original);

    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect(editor(page)).toHaveText(rewritten);

    await page.keyboard.press("ControlOrMeta+z");
    await expect(editor(page)).toHaveText(original);
    await page.keyboard.press("ControlOrMeta+z");
    await expect(editor(page)).not.toHaveText(original);
  });
});

test("find and replace highlights matches and replaces them in every chapter", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Grey Harbour");
  await typeInEditor(page, "The grey gull circled the Grey harbour.");

  await openPanel(page, "Chapters");
  await addChapterButton(page).click();
  await page
    .getByRole("button", { name: "Custom Chapter", exact: true })
    .click();
  await typeInEditor(page, "A grey morning came in off the sea.");
  await waitForSave(page);

  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+h");
  const find = page.getByPlaceholder("Find...");
  await expect(find).toBeFocused();
  await find.fill("grey");
  await expect(page.getByText("3 matches", { exact: true })).toBeVisible();
  await expect(editor(page).locator(".find-match")).toHaveCount(1);

  await page.getByRole("checkbox", { name: "Case sensitive" }).check();
  await expect(page.getByText("2 matches", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Case sensitive" }).uncheck();

  await page.getByPlaceholder("Replace with...").fill("silver");
  await page.getByRole("button", { name: "Replace All (3)" }).click();
  await expect(
    page.getByText("Replaced 3 matches across 2 chapters"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(find).toHaveCount(0);

  await expect(editor(page)).toHaveText(
    "A silver morning came in off the sea.",
  );
  await expect(editor(page).locator(".find-match")).toHaveCount(0);

  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(editor(page)).toHaveText("A grey morning came in off the sea.");
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(editor(page)).toHaveText(
    "A silver morning came in off the sea.",
  );

  await openPanel(page, "Chapters");
  await chapterRows(page).first().click();
  await expect(editor(page)).toHaveText(
    "The silver gull circled the silver harbour.",
  );
});

test("an endnote added in a chapter links both ways in the EPUB export", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Tide Tables");
  await typeInEditor(page, "The tide turned at noon.");

  await page
    .getByRole("button", { name: "Insert endnote", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Add endnote" });
  await expect(dialog).toBeVisible();
  await dialog
    .getByLabel("Endnote content")
    .fill("Tide tables for the estuary, 1890.");
  await dialog.getByRole("button", { name: "Add endnote" }).click();
  await expect(dialog).toHaveCount(0);

  const ref = editor(page).locator('a[data-endnote-ref="1"]');
  await expect(ref).toHaveText("[1]");
  await expect(ref).toHaveAttribute("href", "#end1");
  await page.keyboard.type(" Then it ebbed.");
  await expect(editor(page)).toHaveText(
    "The tide turned at noon.[1] Then it ebbed.",
  );
  await waitForSave(page);

  const epub = await exportEpub(page);
  const chapter =
    epub.chapters.find((xhtml) => xhtml.includes("The tide turned at noon.")) ??
    "";
  const notes =
    epub.chapters.find((xhtml) =>
      xhtml.includes("Tide tables for the estuary, 1890."),
    ) ?? "";
  expect(chapter).toMatch(/<a[^>]*id="ref1"[^>]*>\s*<sup>\[1\]<\/sup>\s*<\/a>/);
  expect(chapter).toMatch(/href="[^"]+\.xhtml#end1"/);
  expect(chapter).toContain("Then it ebbed.");
  expect(notes).not.toBe("");
  expect(notes).toMatch(/id="end1"/);
  expect(notes).toMatch(/href="[^"]+\.xhtml#ref1"/);
});
