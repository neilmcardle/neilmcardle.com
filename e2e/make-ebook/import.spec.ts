import type { Page } from "@playwright/test";
import {
  DOCX_FIXTURE,
  TXT_FIXTURE,
  chapterRows,
  editor,
  expect,
  importManuscript,
  openEditor,
  openPanel,
  setBookTitle,
  test,
  typeInEditor,
  waitForSave,
} from "./helpers";

function libraryBook(page: Page, title: string) {
  return page
    .getByTestId("library-list")
    .filter({ visible: true })
    .getByRole("button", { name: new RegExp(`^${title}`) });
}

async function openChapter(page: Page, title: string) {
  await openPanel(page, "Chapters");
  await chapterRows(page)
    .filter({ hasText: title })
    .getByRole("button")
    .first()
    .click();
  await expect(
    page.getByRole("textbox", { name: "Chapter title" }),
  ).toHaveValue(title);
}

test("importing a text file and a Word file creates new books without overwriting the open one", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Original Manuscript");
  await typeInEditor(page, "This paragraph belongs to the original book.");
  await waitForSave(page);

  await importManuscript(page, TXT_FIXTURE);
  await openPanel(page, "Chapters");
  await expect(
    chapterRows(page).filter({ hasText: "Chapter 1: The Storm" }),
  ).toHaveCount(1);
  await expect(
    chapterRows(page).filter({ hasText: "Chapter 2: The Calm" }),
  ).toHaveCount(1);
  await openChapter(page, "Chapter 1: The Storm");
  await expect(editor(page)).toContainText(
    "The wind came off the sea in long grey ropes.",
  );
  await expect(editor(page)).toContainText(
    "Agnes lit the lamp before the light had quite gone.",
  );
  await openChapter(page, "Chapter 2: The Calm");
  await expect(editor(page)).toContainText(
    "By morning the water lay flat as slate.",
  );
  await expect(editor(page)).not.toContainText(
    "This paragraph belongs to the original book.",
  );
  await waitForSave(page);

  await importManuscript(page, DOCX_FIXTURE);
  await openPanel(page, "Chapters");
  await expect(
    chapterRows(page).filter({ hasText: "Chapter One: Harbour" }),
  ).toHaveCount(1);
  await expect(
    chapterRows(page).filter({ hasText: "Chapter Two: Tide" }),
  ).toHaveCount(1);
  await openChapter(page, "Chapter One: Harbour");
  await expect(editor(page)).toContainText(
    "Gulls argued over the fishing boats at dawn.",
  );
  await openChapter(page, "Chapter Two: Tide");
  await expect(editor(page)).toContainText(
    "The tide turned just after the bells rang noon.",
  );
  await waitForSave(page);

  await openPanel(page, "Library");
  await expect(libraryBook(page, "Original Manuscript")).toHaveCount(1);
  await expect(libraryBook(page, "The Lighthouse Keeper")).toHaveCount(1);
  await expect(libraryBook(page, "Chapter One: Harbour")).toHaveCount(1);

  await libraryBook(page, "Original Manuscript").click();
  await expect(editor(page)).toContainText(
    "This paragraph belongs to the original book.",
  );
  await openPanel(page, "Chapters");
  await expect(chapterRows(page)).toHaveCount(1);

  await openPanel(page, "Library");
  await libraryBook(page, "The Lighthouse Keeper").click();
  await openChapter(page, "Chapter 2: The Calm");
  await expect(editor(page)).toContainText(
    "By morning the water lay flat as slate.",
  );
});
