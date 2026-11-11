import {
  editor,
  expect,
  openEditor,
  setBookTitle,
  test,
  typeInEditor,
  waitForSave,
} from "./helpers";

test("the preview draws the chapter with the book's style and keeps the choice", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Harbour Lights");
  await typeInEditor(page, "The keeper counted every ship that passed.");
  await waitForSave(page);

  await page
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  const frame = page.frameLocator('iframe[title^="Preview of"]:visible');
  await expect(frame.locator(".chapter-content")).toContainText(
    "The keeper counted every ship that passed.",
  );
  await expect(frame.locator("h1.chapter-title")).toBeVisible();

  const style = page.getByRole("combobox", { name: "Book style" });
  await expect(style).toHaveValue("default");
  await style.selectOption("novel");
  await expect
    .poll(() =>
      frame
        .locator("p")
        .first()
        .evaluate((p) => getComputedStyle(p).textAlign),
    )
    .toBe("justify");

  await waitForSave(page);
  await page.reload();
  await expect(editor(page)).toBeVisible();
  await page
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  await expect(page.getByRole("combobox", { name: "Book style" })).toHaveValue(
    "novel",
  );
});
