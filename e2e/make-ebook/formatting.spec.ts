import {
  editor,
  expect,
  exportEpub,
  openEditor,
  setBookTitle,
  test,
  typeInEditor,
  waitForSave,
} from "./helpers";

function chapterWith(chapters: string[], text: string): string {
  const found = chapters.find((xhtml) => xhtml.includes(text));
  expect(found, `a chapter containing "${text}"`).toBeDefined();
  return found ?? "";
}

test("bold, italic and headings applied by shortcut and toolbar reach the export", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Marks on the Page");
  await typeInEditor(page, "Plain opening words ");

  await page.keyboard.press("ControlOrMeta+b");
  await page.keyboard.type("shortcut bold");
  await page.keyboard.press("ControlOrMeta+b");
  await page.keyboard.type(" then ");
  await page.keyboard.press("ControlOrMeta+i");
  await page.keyboard.type("shortcut italic");
  await page.keyboard.press("ControlOrMeta+i");
  await page.keyboard.type(" and ");

  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await page.keyboard.type("toolbar bold");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await page.keyboard.type(" with ");
  await page.getByRole("button", { name: "Italic", exact: true }).click();
  await page.keyboard.type("toolbar italic");
  await page.getByRole("button", { name: "Italic", exact: true }).click();
  await page.keyboard.type(" closing words.");

  await page.keyboard.press("Enter");
  await page.keyboard.type("A Quiet Heading");
  await page
    .getByRole("group", { name: "Paragraph style" })
    .getByRole("button", { name: "Heading 2" })
    .click();

  await expect(editor(page)).toContainText(
    "Plain opening words shortcut bold then shortcut italic and toolbar bold with toolbar italic closing words.",
  );
  await expect(editor(page)).toContainText("A Quiet Heading");
  await expect(
    editor(page).getByRole("heading", { name: "A Quiet Heading" }),
  ).toBeVisible();
  await waitForSave(page);

  const epub = await exportEpub(page);
  const xhtml = chapterWith(epub.chapters, "Plain opening words");
  expect(xhtml).toMatch(/<(strong|b)\b[^>]*>shortcut bold<\/(strong|b)>/);
  expect(xhtml).toMatch(/<(em|i)\b[^>]*>shortcut italic<\/(em|i)>/);
  expect(xhtml).toMatch(/<(strong|b)\b[^>]*>toolbar bold<\/(strong|b)>/);
  expect(xhtml).toMatch(/<(em|i)\b[^>]*>toolbar italic<\/(em|i)>/);
  expect(xhtml).toMatch(/<h2\b[^>]*>A Quiet Heading<\/h2>/);
  expect(xhtml).not.toMatch(/<(strong|b)\b[^>]*>Plain opening words/);
});

test("undo and redo remove and restore typing", async ({ page }) => {
  await openEditor(page);
  await setBookTitle(page, "Second Draft");
  await typeInEditor(page, "A sentence that stays.");
  await page.keyboard.press("Enter");
  await page.keyboard.type("A sentence to take back.");
  await expect(editor(page)).toContainText("A sentence to take back.");

  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });

  await undo.click();
  await expect(editor(page)).not.toContainText("A sentence to take back.");
  await expect(editor(page)).toContainText("A sentence that stays.");

  await redo.click();
  await expect(editor(page)).toContainText("A sentence to take back.");

  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(editor(page)).not.toContainText("A sentence to take back.");
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(editor(page)).toContainText("A sentence to take back.");
  await expect(editor(page)).toContainText("A sentence that stays.");
});
