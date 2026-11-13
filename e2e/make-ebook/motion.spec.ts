import { expect, test, type Locator } from "@playwright/test";
import {
  editor,
  openEditor,
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
});
