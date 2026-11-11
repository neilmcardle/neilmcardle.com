import {
  addChapterButton,
  chapterRows,
  editor,
  expect,
  openEditor,
  openPanel,
  reloadEditor,
  setBookTitle,
  test,
  typeInEditor,
  waitForSave,
} from "./helpers";
import type { Page } from "@playwright/test";

async function renameOpenChapter(page: Page, title: string) {
  const field = page.getByRole("textbox", { name: "Chapter title" });
  await field.fill(title);
  await expect(field).toHaveValue(title);
}

async function dragChapterAbove(page: Page, moving: string, target: string) {
  await expect(async () => {
    const titles = await chapterRows(page).allTextContents();
    const from = titles.findIndex((t) => t.includes(moving));
    const to = titles.findIndex((t) => t.includes(target));
    if (from > to) {
      await chapterRows(page)
        .filter({ hasText: moving })
        .dragTo(chapterRows(page).filter({ hasText: target }), { steps: 8 });
    }
    const after = await chapterRows(page).allTextContents();
    expect(after.findIndex((t) => t.includes(moving))).toBeLessThan(
      after.findIndex((t) => t.includes(target)),
    );
  }).toPass({ timeout: 15_000 });
}

async function reloadAndShowChapters(page: Page) {
  await waitForSave(page);
  await reloadEditor(page);
  await openPanel(page, "Chapters");
}

test("chapters can be added, renamed, reordered and deleted, and the list survives each reload", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Two Rivers");
  await renameOpenChapter(page, "Where the Water Starts");
  await typeInEditor(page, "Snowmelt gathered in the high meadow.");

  await openPanel(page, "Chapters");
  await expect(chapterRows(page)).toHaveCount(1);

  await addChapterButton(page).click();
  await page
    .getByRole("button", { name: "Custom Chapter", exact: true })
    .click();
  await expect(chapterRows(page)).toHaveCount(2);
  await renameOpenChapter(page, "The Long Valley");
  await typeInEditor(page, "Below the falls the river slowed and widened.");

  await expect(chapterRows(page)).toHaveText([
    /Where the Water Starts/,
    /The Long Valley/,
  ]);

  await reloadAndShowChapters(page);
  await expect(chapterRows(page)).toHaveText([
    /Where the Water Starts/,
    /The Long Valley/,
  ]);

  await dragChapterAbove(page, "The Long Valley", "Where the Water Starts");
  await expect(chapterRows(page)).toHaveText([
    /The Long Valley/,
    /Where the Water Starts/,
  ]);

  await reloadAndShowChapters(page);
  await expect(chapterRows(page)).toHaveText([
    /The Long Valley/,
    /Where the Water Starts/,
  ]);

  const doomed = chapterRows(page).filter({
    hasText: "Where the Water Starts",
  });
  await doomed.hover();
  await doomed.getByRole("button", { name: "Delete chapter" }).click();
  await doomed
    .getByRole("group", { name: "Confirm chapter deletion" })
    .getByRole("button", { name: "Confirm delete" })
    .click();
  await expect(chapterRows(page)).toHaveText([/The Long Valley/]);

  await reloadAndShowChapters(page);
  await expect(chapterRows(page)).toHaveText([/The Long Valley/]);
  await chapterRows(page).first().getByRole("button").first().click();
  await expect(editor(page)).toContainText(
    "Below the falls the river slowed and widened.",
  );
  await expect(editor(page)).not.toContainText(
    "Snowmelt gathered in the high meadow.",
  );
});

test("cancelling a chapter delete keeps the chapter", async ({ page }) => {
  await openEditor(page);
  await setBookTitle(page, "Keep Both");
  await typeInEditor(page, "First chapter words.");
  await openPanel(page, "Chapters");
  await addChapterButton(page).click();
  await page
    .getByRole("button", { name: "Custom Chapter", exact: true })
    .click();
  await renameOpenChapter(page, "Second Thoughts");
  await expect(chapterRows(page)).toHaveCount(2);

  const row = chapterRows(page).filter({ hasText: "Second Thoughts" });
  await row.hover();
  await row.getByRole("button", { name: "Delete chapter" }).click();
  await row.getByRole("button", { name: "Cancel" }).click();
  await expect(chapterRows(page)).toHaveCount(2);

  await reloadAndShowChapters(page);
  await expect(chapterRows(page)).toHaveCount(2);
});
