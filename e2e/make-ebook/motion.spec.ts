import { expect, test, type Locator } from "@playwright/test";
import {
  addChapterButton,
  chapterRows,
  editor,
  openEditor,
  openPanel,
  prepareContext,
  startExport,
  typeInEditor,
} from "./helpers";

async function animationOf(locator: Locator): Promise<string> {
  return locator.evaluate((el) => getComputedStyle(el).animationName);
}

test.describe("editor motion", () => {
  test.beforeEach(async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepareContext(context, "free");
  });

  test("menus grow from their button and leave before they unmount", async ({
    page,
  }) => {
    await openEditor(page);
    await page.getByRole("button", { name: "Export", exact: true }).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    expect(await animationOf(menu)).toBe("me-pop-in");
    const origin = await menu.evaluate(
      (el) => getComputedStyle(el).transformOrigin,
    );
    expect(origin).not.toBe("");
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("data-state", "closed");
    await expect(menu).toHaveCount(0);
  });

  test("dialogs rise in and fade out before they unmount", async ({ page }) => {
    await openEditor(page);
    const dialog = await startExport(page, "EPUB");
    const panel = dialog.locator("> div");
    expect(await animationOf(dialog)).toBe("me-fade-in");
    expect(await animationOf(panel)).toBe("me-modal-in");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveAttribute("data-state", "closed");
    expect(await animationOf(panel)).toBe("me-modal-out");
    await expect(dialog).toHaveCount(0);
  });

  test("reduced motion swaps movement for a fade", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openEditor(page);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "fade");
    const dialog = await startExport(page, "EPUB");
    const panel = dialog.locator("> div");
    expect(await animationOf(panel)).toBe("me-fade-in");
    const duration = await panel.evaluate(
      (el) => getComputedStyle(el).animationDuration,
    );
    expect(parseFloat(duration)).toBeGreaterThan(0.1);
    await page.keyboard.press("Escape");
    expect(await animationOf(panel)).toBe("me-fade-out");
    await expect(dialog).toHaveCount(0);
  });

  test("the page morphs into the preview and comes back unchanged", async ({
    page,
  }) => {
    await openEditor(page);
    await typeInEditor(page, "The keeper counted every ship.");
    await editor(page).evaluate((el) => {
      (el as HTMLElement & { marker?: string }).marker = "kept";
    });
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    const frame = page.frameLocator('iframe[title^="Preview of"]:visible');
    await expect(
      frame.getByText("The keeper counted every ship."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(editor(page)).toBeVisible();
    const marker = await editor(page).evaluate(
      (el) => (el as HTMLElement & { marker?: string }).marker,
    );
    expect(marker).toBe("kept");
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-surface-to",
      /.*/,
    );
  });

  test("preview settings change the page without reloading it", async ({
    page,
  }) => {
    await openEditor(page);
    await typeInEditor(page, "The keeper counted every ship.");
    await page.keyboard.press("ControlOrMeta+p");
    const iframe = page.locator('iframe[title^="Preview of"]:visible');
    await expect(iframe).toBeVisible();
    await expect(
      page
        .frameLocator('iframe[title^="Preview of"]:visible')
        .getByText("The keeper counted every ship."),
    ).toBeVisible();
    await iframe.evaluate((el) => {
      const win = (el as HTMLIFrameElement).contentWindow as Window & {
        marker?: string;
      };
      win.marker = "same page";
    });
    await page.getByRole("button", { name: "Sepia page" }).click();
    await page.getByRole("button", { name: "iPad" }).click();
    await page.getByRole("button", { name: "Scroll", exact: true }).click();
    await expect
      .poll(() =>
        iframe.evaluate(
          (el) =>
            getComputedStyle((el as HTMLIFrameElement).contentDocument!.body)
              .backgroundColor,
        ),
      )
      .toBe("rgb(234, 217, 189)");
    const marker = await iframe.evaluate(
      (el) =>
        (
          (el as HTMLIFrameElement).contentWindow as Window & {
            marker?: string;
          }
        ).marker,
    );
    expect(marker).toBe("same page");
  });

  test("the side panel slides in while the page glides across", async ({
    page,
  }) => {
    await openEditor(page);
    await page.waitForTimeout(500);
    const running = page.evaluate(
      () =>
        new Promise<string[]>((resolve) => {
          const seen = new Set<string>();
          const started = performance.now();
          const look = () => {
            for (const a of document.getAnimations()) {
              const effect = a.effect as KeyframeEffect | null;
              if (effect?.pseudoElement) seen.add(effect.pseudoElement);
            }
            if (performance.now() - started > 600) resolve([...seen]);
            else setTimeout(look, 10);
          };
          look();
        }),
    );
    await page
      .getByRole("complementary")
      .getByRole("navigation")
      .getByRole("button", { name: "Chapters", exact: true })
      .click();
    const seen = await running;
    expect(seen).toContain("::view-transition-new(me-panel)");
    expect(seen).toContain("::view-transition-group(me-page)");
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-surface-to",
      /.*/,
    );
  });

  test("drawer sections fold without touching the page behind", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openEditor(page);
    await page.locator('[data-tour="mobile-menu"]').click();
    const book = page.getByRole("button", { name: "Book details" });
    await expect(book).toBeVisible();
    await page.waitForTimeout(500);
    const running = page.evaluate(
      () =>
        new Promise<string[]>((resolve) => {
          const seen = new Set<string>();
          const started = performance.now();
          const look = () => {
            for (const a of document.getAnimations()) {
              const effect = a.effect as KeyframeEffect | null;
              if (effect?.pseudoElement) seen.add(effect.pseudoElement);
            }
            if (performance.now() - started > 600) resolve([...seen]);
            else setTimeout(look, 10);
          };
          look();
        }),
    );
    await book.click();
    const seen = await running;
    expect(seen.some((p) => p.includes("me-sec-"))).toBe(true);
    expect(seen.filter((p) => /me-(page|dock|controls)\)/.test(p))).toEqual([]);
    await expect(book).toHaveAttribute("aria-expanded", "true");
  });

  test("find and replace drops in and leaves before it unmounts", async ({
    page,
  }) => {
    await openEditor(page);
    await typeInEditor(page, "The keeper counted every ship.");
    await page.keyboard.press("ControlOrMeta+h");
    const find = page.getByPlaceholder("Find...");
    await expect(find).toBeVisible();
    const panel = page.locator(".me-drop");
    expect(await animationOf(panel)).toBe("me-drop-in");
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(panel).toHaveAttribute("data-state", "closed");
    expect(await animationOf(panel)).toBe("me-drop-out");
    await expect(find).toHaveCount(0);
  });

  test("Book Mind closes with an exit instead of vanishing", async ({
    page,
    context,
  }) => {
    await prepareContext(context, "pro");
    await openEditor(page);
    await page.getByRole("button", { name: "Book Mind", exact: true }).click();
    const bookMind = page.getByRole("dialog", { name: "Book Mind" });
    await expect(bookMind).toBeVisible();
    await bookMind.getByRole("button", { name: "Close", exact: true }).click();
    await expect(bookMind).toHaveAttribute("data-state", "closed");
    expect(await animationOf(bookMind)).toMatch(/bmOut/);
    await expect(bookMind).toHaveCount(0);
  });

  test("new chapters glide in and the index marker travels", async ({
    page,
  }) => {
    await openEditor(page);
    await openPanel(page, "Chapters");
    const watch = () =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let moved = 0;
            const started = performance.now();
            const look = () => {
              for (const a of document.getAnimations()) {
                const target = (a.effect as KeyframeEffect | null)?.target;
                if (target instanceof HTMLElement && target.dataset.flipId)
                  moved++;
              }
              if (performance.now() - started > 400) resolve(moved);
              else setTimeout(look, 10);
            };
            look();
          }),
      );
    for (let i = 0; i < 2; i++) {
      const glide = watch();
      await addChapterButton(page).click();
      await page
        .getByRole("button", { name: "Custom Chapter", exact: true })
        .click();
      if (i === 1) expect(await glide).toBeGreaterThan(0);
      else await glide;
    }
    await expect(chapterRows(page)).toHaveCount(3);
    await page
      .getByRole("complementary")
      .getByRole("navigation")
      .getByRole("button", { name: "Chapters", exact: true })
      .click();
    await expect(page.locator('nav[aria-label="Chapters"]')).toBeVisible();
    const marker = page.locator('nav[aria-label="Chapters"] li[aria-hidden]');
    const before = await marker.evaluate((el) => el.style.transform);
    await page
      .locator('nav[aria-label="Chapters"]')
      .getByRole("button")
      .first()
      .click();
    await expect
      .poll(() => marker.evaluate((el) => el.style.transform))
      .not.toBe(before);
    expect(
      await marker.evaluate((el) => getComputedStyle(el).transitionProperty),
    ).toBe("transform");
  });
});
