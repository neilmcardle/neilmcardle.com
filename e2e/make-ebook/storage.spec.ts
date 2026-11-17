import { readFile } from "node:fs/promises";
import {
  WRITER,
  clearBrowserStorage,
  editor,
  expect,
  libraryBook,
  openEditor,
  openPanel,
  reloadEditor,
  seedLocalStorage,
  setBookTitle,
  test,
  typeInEditor,
  waitForSave,
} from "./helpers";

const LEGACY_KEY = `makeebook_library_${WRITER.id}`;

function legacyBook() {
  return {
    id: "book-1699999999999",
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
        id: "chapter-1699999999999",
        title: "The Light",
        content: "<p>The keeper counted every ship that passed the rocks.</p>",
        type: "content",
      },
    ],
    savedAt: Date.now() - 60_000,
  };
}

function readLegacyBlob(page: import("@playwright/test").Page) {
  return page.evaluate((key) => window.localStorage.getItem(key), LEGACY_KEY);
}

test("a book saved before the upgrade still opens", async ({ page }) => {
  await seedLocalStorage(page, {
    [LEGACY_KEY]: JSON.stringify([legacyBook()]),
  });

  await page.goto("/make-ebook?fps=0");
  await expect(editor(page)).toBeVisible();
  await expect(editor(page)).toContainText(
    "The keeper counted every ship that passed the rocks.",
  );
  await expect(
    page.getByRole("button", { name: "The Lighthouse" }),
  ).toBeVisible();
  await expect.poll(() => readLegacyBlob(page)).toBeNull();

  await reloadEditor(page);
  await expect(editor(page)).toContainText(
    "The keeper counted every ship that passed the rocks.",
  );
  await openPanel(page, "Book");
  await expect(
    page.getByRole("textbox", { name: "Title", exact: true }),
  ).toHaveValue("The Lighthouse");
  expect(await readLegacyBlob(page)).toBeNull();
});

test("a backup downloads and restores", async ({ page }) => {
  await openEditor(page);
  await setBookTitle(page, "The Tide Tables");
  await typeInEditor(
    page,
    "Low water came at four and the boats sat in the mud.",
  );
  await waitForSave(page);

  await openPanel(page, "Library");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download a backup" })
    .filter({ visible: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^makeebook-backup-\d{4}-\d{2}-\d{2}\.json$/,
  );
  const file = await download.path();
  const backup = JSON.parse(await readFile(file, "utf8"));
  expect(backup.books).toHaveLength(1);
  expect(backup.books[0].title).toBe("The Tide Tables");

  await clearBrowserStorage(page);
  await openEditor(page);
  await openPanel(page, "Library");
  await expect(libraryBook(page, "The Tide Tables")).toHaveCount(0);

  const chooserPromise = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Restore a backup" })
    .filter({ visible: true })
    .click();
  const chooser = await chooserPromise;
  await chooser.setFiles(file);

  await expect(page.getByText("Restored 1 book.")).toBeVisible();
  await expect(editor(page)).toContainText(
    "Low water came at four and the boats sat in the mud.",
  );
  await openPanel(page, "Library");
  await expect(libraryBook(page, "The Tide Tables")).toBeVisible();

  await reloadEditor(page);
  await expect(editor(page)).toContainText(
    "Low water came at four and the boats sat in the mud.",
  );
});

test.describe("cloud sync", () => {
  test.use({ tier: "pro" });

  test("a saved book is pushed to the cloud", async ({ page, cloud }) => {
    await openEditor(page);
    await setBookTitle(page, "The Harbour Wall");
    await typeInEditor(page, "The wall had stood for three hundred winters.");
    await expect(page.getByText("Saved and synced").first()).toBeVisible({
      timeout: 45_000,
    });
    await expect
      .poll(() => cloud.books().map((row) => row.data.title), {
        timeout: 15_000,
      })
      .toContain("The Harbour Wall");
    const row = cloud.books().find((r) => r.data.title === "The Harbour Wall");
    expect(row?.revision).toBeGreaterThan(0);
    expect(JSON.stringify(row?.data.chapters)).toContain(
      "The wall had stood for three hundred winters.",
    );
  });

  test("a book saved on another device is pulled", async ({ page, cloud }) => {
    const id = "6a1f7e0c-3b2d-4c5e-8f90-1a2b3c4d5e6f";
    cloud.seed({
      id,
      revision: 3,
      data: {
        id,
        schemaVersion: 1,
        userId: WRITER.id,
        title: "The Far Shore",
        author: "Mara Quill",
        chapters: [
          {
            id: "8b2e1f4a-5c6d-4e7f-9a0b-1c2d3e4f5a6b",
            title: "Landfall",
            content: "<p>They reached the far shore at dusk.</p>",
            type: "content",
          },
        ],
        savedAt: Date.now(),
        revision: 3,
        syncedRevision: 3,
      },
    });

    await openEditor(page);
    await openPanel(page, "Library");
    await expect(libraryBook(page, "The Far Shore")).toBeVisible({
      timeout: 15_000,
    });
    await libraryBook(page, "The Far Shore").click();
    await expect(editor(page)).toContainText(
      "They reached the far shore at dusk.",
    );
  });

  test("edits to different chapters on two devices are both kept", async ({
    page,
    cloud,
  }) => {
    const id = "7c2e8f1d-4a3b-4d6e-9f01-2b3c4d5e6f70";
    const first = "9c3f2a5b-6d7e-4f80-8b1c-2d3e4f5a6b7c";
    const second = "0d4a3b6c-7e8f-4a91-9c2d-3e4f5a6b7c8d";
    const chapters = (a: string, b: string) => [
      { id: first, title: "Outward", content: `<p>${a}</p>`, type: "content" },
      { id: second, title: "Home", content: `<p>${b}</p>`, type: "content" },
    ];
    cloud.seed({
      id,
      revision: 3,
      data: {
        id,
        schemaVersion: 1,
        userId: WRITER.id,
        title: "Two Shores",
        chapters: chapters("They set out.", "They came home."),
        savedAt: Date.now(),
        revision: 3,
        syncedRevision: 3,
      },
    });

    await openEditor(page);
    await openPanel(page, "Library");
    await expect(libraryBook(page, "Two Shores")).toBeVisible({
      timeout: 15_000,
    });
    await libraryBook(page, "Two Shores").click();
    await expect(editor(page)).toContainText("They set out.");
    await typeInEditor(page, " The tide was with them.");
    await expect(page.getByText("Saved and synced").first()).toBeVisible({
      timeout: 45_000,
    });
    await expect
      .poll(() => cloud.rows.get(id)?.revision ?? 0, { timeout: 15_000 })
      .toBeGreaterThan(3);

    const row = cloud.rows.get(id)!;
    const data = row.data as { chapters: { id: string; content: string }[] };
    cloud.rows.set(id, {
      ...row,
      revision: row.revision + 1,
      data: {
        ...row.data,
        revision: row.revision + 1,
        chapters: data.chapters.map((c) =>
          c.id === second
            ? { ...c, content: "<p>They came home in the dark.</p>" }
            : c,
        ),
      },
    });

    await typeInEditor(page, " Gulls followed.");
    await expect
      .poll(
        () => {
          const latest = cloud.rows.get(id)?.data as
            { chapters: { content: string }[] } | undefined;
          return JSON.stringify(latest?.chapters ?? []);
        },
        { timeout: 45_000 },
      )
      .toMatch(/Gulls followed\.[\s\S]*They came home in the dark\./);
    await expect(
      page.getByRole("button", { name: "Keep cloud version" }),
    ).toHaveCount(0);
  });
});
