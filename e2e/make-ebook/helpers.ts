import {
  test as base,
  expect,
  type BrowserContext,
  type Download,
  type Locator,
  type Page,
  type Route,
} from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

export { expect };

export const FIXTURES = path.join(__dirname, "..", "fixtures");
export const TXT_FIXTURE = path.join(FIXTURES, "manuscript.txt");
export const DOCX_FIXTURE = path.join(FIXTURES, "manuscript.docx");

export const WRITER = {
  id: "00000000-0000-4000-8000-0000000e2e01",
  email: "writer@example.test",
};

export type Tier = "free" | "pro";

const SUPABASE_HOST = /^https:\/\/[^/]+\.supabase\.co\//;

let storageKey: string | null = process.env.E2E_SUPABASE_STORAGE_KEY ?? null;

function base64url(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function fakeUser() {
  const now = new Date().toISOString();
  return {
    id: WRITER.id,
    aud: "authenticated",
    role: "authenticated",
    email: WRITER.email,
    email_confirmed_at: now,
    app_metadata: { provider: "email" },
    user_metadata: {},
    identities: [],
    created_at: now,
    updated_at: now,
  };
}

function fakeSession() {
  const expiresIn = 60 * 60 * 24 * 365;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  const accessToken = [
    base64url({ alg: "HS256", typ: "JWT" }),
    base64url({
      sub: WRITER.id,
      email: WRITER.email,
      role: "authenticated",
      aud: "authenticated",
      exp: expiresAt,
    }),
    "e2e",
  ].join(".");
  return {
    access_token: accessToken,
    refresh_token: "e2e-refresh",
    token_type: "bearer",
    expires_in: expiresIn,
    expires_at: expiresAt,
    user: fakeUser(),
  };
}

export function subscriptionBody(tier: Tier) {
  return tier === "pro"
    ? {
        tier: "pro",
        status: "active",
        isPro: true,
        isGrandfathered: false,
        currentPeriodEnd: null,
        stripeCustomerId: null,
      }
    : {
        tier: "free",
        status: null,
        isPro: false,
        isGrandfathered: false,
        currentPeriodEnd: null,
        stripeCustomerId: null,
      };
}

export type CloudRow = {
  id: string;
  user_id: string;
  data: Record<string, unknown>;
  revision: number;
  updated_at: string;
  deleted_at: string | null;
};

export class FakeCloud {
  rows = new Map<string, CloudRow>();
  requests: { method: string; url: string }[] = [];

  books(userId = WRITER.id) {
    return [...this.rows.values()].filter((row) => row.user_id === userId);
  }

  seed(row: Partial<CloudRow> & { id: string; data: Record<string, unknown> }) {
    this.rows.set(row.id, {
      user_id: WRITER.id,
      revision: 1,
      updated_at: new Date().toISOString(),
      deleted_at: null,
      ...row,
    });
  }

  private matches(row: CloudRow, params: URLSearchParams) {
    if (row.user_id !== WRITER.id) return false;
    for (const [column, condition] of params) {
      if (["select", "order", "limit", "offset", "columns"].includes(column)) {
        continue;
      }
      const value = String(row[column as keyof CloudRow] ?? "");
      if (condition.startsWith("eq.")) {
        if (value !== condition.slice(3)) return false;
      } else if (condition.startsWith("in.(")) {
        const list = condition
          .slice(4, -1)
          .split(",")
          .map((v) => v.replace(/"/g, ""));
        if (!list.includes(value)) return false;
      } else if (condition.startsWith("is.null")) {
        if (row[column as keyof CloudRow] !== null) return false;
      }
    }
    return true;
  }

  async handle(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    this.requests.push({ method, url: url.toString() });
    const params = url.searchParams;
    if (method === "GET" || method === "HEAD") {
      const found = [...this.rows.values()].filter((row) =>
        this.matches(row, params),
      );
      return route.fulfill({ json: found });
    }
    if (method === "PATCH") {
      const patch = request.postDataJSON() as Partial<CloudRow>;
      const updated: CloudRow[] = [];
      for (const row of this.rows.values()) {
        if (!this.matches(row, params)) continue;
        const next = { ...row, ...patch, id: row.id, user_id: row.user_id };
        this.rows.set(row.id, next);
        updated.push(next);
      }
      return route.fulfill({ json: updated });
    }
    if (method === "POST") {
      const body = request.postDataJSON() as
        Partial<CloudRow> | Partial<CloudRow>[];
      const incoming = Array.isArray(body) ? body : [body];
      if (incoming.some((row) => this.rows.has(String(row.id)))) {
        return route.fulfill({
          status: 409,
          json: {
            code: "23505",
            message: "duplicate key value violates unique constraint",
            details: null,
            hint: null,
          },
        });
      }
      if (incoming.some((row) => row.user_id !== WRITER.id)) {
        return route.fulfill({
          status: 403,
          json: {
            code: "42501",
            message: "row-level security",
            details: null,
            hint: null,
          },
        });
      }
      const inserted = incoming.map((row): CloudRow => ({
        id: String(row.id),
        user_id: String(row.user_id),
        data: row.data ?? {},
        revision: row.revision ?? 0,
        updated_at: row.updated_at ?? new Date().toISOString(),
        deleted_at: row.deleted_at ?? null,
      }));
      inserted.forEach((row) => this.rows.set(row.id, row));
      return route.fulfill({ status: 201, json: inserted });
    }
    if (method === "DELETE") {
      for (const row of [...this.rows.values()]) {
        if (this.matches(row, params)) this.rows.delete(row.id);
      }
      return route.fulfill({ status: 204, body: "" });
    }
    return route.fulfill({ json: [] });
  }
}

export async function prepareContext(
  context: BrowserContext,
  tier: Tier,
  cloud = new FakeCloud(),
) {
  await context.route(SUPABASE_HOST, (route) => {
    const url = route.request().url();
    if (url.includes("/rest/v1/makeebook_books")) return cloud.handle(route);
    if (url.includes("/auth/v1/user"))
      return route.fulfill({ json: fakeUser() });
    if (url.includes("/auth/v1/")) return route.fulfill({ json: {} });
    return route.fulfill({ json: [] });
  });
  await context.route("**/api/subscription", (route) =>
    route.fulfill({ json: subscriptionBody(tier) }),
  );
  await context.route("**/api/ai/**", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "AI is switched off in tests" },
    }),
  );
  await context.route("**/api/customer-portal", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "Billing is switched off in tests" },
    }),
  );
  await context.addInitScript(
    ({ userId }) => {
      try {
        window.localStorage.setItem("mb-ads-consent", "denied");
        window.localStorage.setItem("makeebook_onboarding_complete", "true");
        window.localStorage.setItem(
          `${userId}_makeebook_onboarding_complete`,
          "true",
        );
      } catch {}
    },
    { userId: WRITER.id },
  );
}

async function signInLocally(page: Page) {
  if (!storageKey) {
    await page.goto("/make-ebook/privacy");
    const handle = await page.waitForFunction(
      () =>
        (
          globalThis as unknown as {
            __supabase_browser_client?: { auth?: { storageKey?: string } };
          }
        ).__supabase_browser_client?.auth?.storageKey,
    );
    storageKey = (await handle.jsonValue()) as string;
  }
  await page.context().addCookies([
    {
      name: storageKey,
      value: `base64-${base64url(fakeSession())}`,
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
    },
  ]);
}

type Fixtures = {
  tier: Tier;
  cloud: FakeCloud;
  pageErrors: string[];
};

export const test = base.extend<Fixtures>({
  tier: ["free", { option: true }],
  cloud: async ({ tier: _tier }, provide) => {
    await provide(new FakeCloud());
  },
  context: async ({ context, tier, cloud }, provide) => {
    await prepareContext(context, tier, cloud);
    await provide(context);
  },
  pageErrors: [
    async ({ context }, provide) => {
      const errors: string[] = [];
      const watch = (p: Page) =>
        p.on("pageerror", (error) =>
          errors.push(`${p.url()}: ${error.message}`),
        );
      context.pages().forEach(watch);
      context.on("page", watch);
      await provide(errors);
      expect(errors, "uncaught page errors").toEqual([]);
    },
    { auto: true },
  ],
});

export function editor(page: Page): Locator {
  return page.getByTestId("chapter-editor").filter({ visible: true });
}

export function chapterRows(page: Page): Locator {
  return chapterList(page).getByTestId("chapter-row");
}

export function chapterList(page: Page): Locator {
  return page.getByTestId("chapter-list").filter({ visible: true });
}

export function addChapterButton(page: Page): Locator {
  return page.getByTestId("add-chapter").filter({ visible: true });
}

export function saveIndicator(page: Page): Locator {
  return page.getByText(/^Saved (on this device|and synced)$/);
}

export async function openEditor(page: Page) {
  await signInLocally(page);
  await page.goto("/make-ebook?fps=0");
  await expect(editor(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Export" })).toBeVisible();
}

export async function seedLocalStorage(
  page: Page,
  entries: Record<string, string>,
) {
  await signInLocally(page);
  await page.goto("/make-ebook/privacy");
  await page.evaluate((values) => {
    for (const [key, value] of Object.entries(values)) {
      window.localStorage.setItem(key, value);
    }
  }, entries);
}

export async function clearBrowserStorage(page: Page) {
  await page.goto("/make-ebook/privacy");
  await page.evaluate(async () => {
    window.localStorage.clear();
    const databases = await indexedDB.databases();
    await Promise.all(
      databases.map(
        (db) =>
          new Promise<void>((resolve) => {
            if (!db.name) return resolve();
            const request = indexedDB.deleteDatabase(db.name);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
          }),
      ),
    );
  });
}

export function libraryBook(page: Page, title: string): Locator {
  return page
    .getByTestId("library-list")
    .filter({ visible: true })
    .getByRole("button", { name: new RegExp(`^${title}`) });
}

export async function reloadEditor(page: Page) {
  await page.reload();
  await expect(editor(page)).toBeVisible();
}

export async function setBookTitle(page: Page, title: string) {
  await openPanel(page, "Book");
  const field = page.getByRole("textbox", { name: "Title", exact: true });
  await field.fill(title);
  await expect(field).toHaveValue(title);
}

export async function openPanel(
  page: Page,
  name: "Library" | "Book" | "Chapters",
) {
  const heading = {
    Library: page.getByRole("button", { name: "New book" }),
    Book: page.getByRole("textbox", { name: "Title", exact: true }),
    Chapters: chapterList(page),
  }[name];
  if (await heading.isVisible()) return;
  await page
    .getByRole("complementary")
    .getByRole("navigation")
    .getByRole("button", { name, exact: true })
    .click();
  await expect(heading).toBeVisible();
}

export async function typeInEditor(page: Page, text: string) {
  const box = editor(page);
  await box.click();
  await page.keyboard.type(text);
  await expect(box).toContainText(text);
}

export async function waitForSave(page: Page) {
  await expect(page.getByText("Saving…", { exact: true })).toHaveCount(0, {
    timeout: 15_000,
  });
  await expect(saveIndicator(page).first()).toBeVisible({ timeout: 15_000 });
}

export async function startExport(page: Page, format: "EPUB" | "PDF" | "Word") {
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page
    .getByRole("menuitem", { name: new RegExp(`^${format}\\b`) })
    .click();
  const dialog = page.getByRole("dialog", { name: new RegExp(`^Export `) });
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function confirmExport(dialog: Locator) {
  await dialog
    .getByRole("button", { name: /^Export (anyway|EPUB|PDF|Word|DOCX)/ })
    .last()
    .click();
}

export async function downloadBytes(download: Download): Promise<Buffer> {
  const file = await download.path();
  return readFile(file);
}

export type EpubContents = {
  zip: JSZip;
  mimetype: string;
  opf: string;
  chapters: string[];
};

export async function readEpub(bytes: Buffer): Promise<EpubContents> {
  const zip = await JSZip.loadAsync(bytes);
  const mimetype = (await zip.file("mimetype")?.async("string")) ?? "";
  const opf = (await zip.file("OEBPS/content.opf")?.async("string")) ?? "";
  const names = Object.keys(zip.files).filter(
    (name) => name.startsWith("OEBPS/") && name.endsWith(".xhtml"),
  );
  const chapters = await Promise.all(
    names.map(async (name) => (await zip.file(name)?.async("string")) ?? ""),
  );
  return { zip, mimetype, opf, chapters };
}

export async function readDocxText(bytes: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  return (await zip.file("word/document.xml")?.async("string")) ?? "";
}

export async function exportEpub(page: Page): Promise<EpubContents> {
  const dialog = await startExport(page, "EPUB");
  const downloadPromise = page.waitForEvent("download");
  await confirmExport(dialog);
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.epub$/);
  return readEpub(await downloadBytes(download));
}

export async function importManuscript(page: Page, file: string) {
  await openPanel(page, "Library");
  await page.getByRole("button", { name: "Import a file" }).click();
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Choose File" }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles(file);
  await expect(
    page.getByRole("heading", { name: "Import Document" }),
  ).toHaveCount(0);
}

export async function pasteInto(
  page: Page,
  target: Locator,
  data: { html?: string; text?: string },
) {
  await target.click();
  await target.evaluate((el, payload) => {
    const transfer = new DataTransfer();
    if (payload.html) transfer.setData("text/html", payload.html);
    if (payload.text) transfer.setData("text/plain", payload.text);
    el.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: transfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, data);
}
