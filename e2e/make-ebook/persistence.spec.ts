import {
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

test("a new book keeps its title and first paragraph after a reload", async ({
  page,
}) => {
  await openEditor(page);

  await setBookTitle(page, "The Salt Road");
  await typeInEditor(
    page,
    "The caravan left the coast before the sun had risen.",
  );
  await waitForSave(page);

  await reloadEditor(page);

  await expect(editor(page)).toContainText(
    "The caravan left the coast before the sun had risen.",
  );
  await expect(
    page.getByRole("button", { name: "The Salt Road" }),
  ).toBeVisible();
  await openPanel(page, "Book");
  await expect(
    page.getByRole("textbox", { name: "Title", exact: true }),
  ).toHaveValue("The Salt Road");
});
