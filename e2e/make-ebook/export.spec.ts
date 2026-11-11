import {
  confirmExport,
  downloadBytes,
  expect,
  exportEpub,
  openEditor,
  readDocxText,
  setBookTitle,
  startExport,
  test,
  typeInEditor,
  waitForSave,
} from "./helpers";

const TITLE = "Lanterns Over Harrow";
const PARAGRAPH = "The ferry horn sounded twice across the estuary.";

test.beforeEach(async ({ page }) => {
  await openEditor(page);
  await setBookTitle(page, TITLE);
  await typeInEditor(page, PARAGRAPH);
  await waitForSave(page);
});

test("EPUB export downloads a valid book with the title and typed text", async ({
  page,
}) => {
  const epub = await exportEpub(page);

  expect(epub.mimetype).toBe("application/epub+zip");
  expect(Object.keys(epub.zip.files)[0]).toBe("mimetype");
  expect(epub.opf).toContain(TITLE);
  expect(epub.chapters.some((xhtml) => xhtml.includes(PARAGRAPH))).toBe(true);
});

test("Word export downloads a non-empty document with the typed text", async ({
  page,
}) => {
  const dialog = await startExport(page, "Word");
  const downloadPromise = page.waitForEvent("download");
  await confirmExport(dialog);
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.docx$/);
  const bytes = await downloadBytes(download);
  expect(bytes.byteLength).toBeGreaterThan(0);
  const documentXml = await readDocxText(bytes);
  expect(documentXml).toContain(PARAGRAPH);
  expect(documentXml).toContain(TITLE);
});

test("PDF export opens a print window showing the book title", async ({
  page,
}) => {
  await page.context().addInitScript(() => {
    window.print = () => {};
  });
  const dialog = await startExport(page, "PDF");
  const popupPromise = page.waitForEvent("popup");
  await confirmExport(dialog);
  const popup = await popupPromise;

  await expect(popup.getByText(TITLE).first()).toBeVisible();
  await expect(popup.getByText(PARAGRAPH)).toBeVisible();
  await popup.close();
});
