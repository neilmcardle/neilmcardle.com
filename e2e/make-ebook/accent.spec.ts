import { expect, test, type Page } from "@playwright/test";
import { openEditor, prepareContext, reloadEditor } from "./helpers";

const acid = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--acid")
      .trim(),
  );

test("the grey accent replaces the yellow and is remembered", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepareContext(context, "pro");
  await openEditor(page);
  expect(await acid(page)).toBe("rgb(222, 234, 83)");
  if (process.env.ACCENT_SHOTS)
    await page.screenshot({ path: process.env.ACCENT_SHOTS + "/acid.png" });

  await page.getByRole("button", { name: "Writing modes" }).click();
  await page.getByRole("menuitem", { name: /Grey accent/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-accent", "mono");
  await expect.poll(() => acid(page)).toBe("rgb(220, 220, 220)");
  await page.keyboard.press("Escape");
  const exportFill = await page
    .getByRole("button", { name: "Export", exact: true })
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(exportFill).toBe("rgb(220, 220, 220)");
  if (process.env.ACCENT_SHOTS)
    await page.screenshot({ path: process.env.ACCENT_SHOTS + "/mono.png" });

  await reloadEditor(page);
  await expect(page.locator("html")).toHaveAttribute("data-accent", "mono");

  await page.goto("/make-ebook/privacy");
  await expect(page.locator("html")).not.toHaveAttribute("data-accent", /.*/);
});

test("the grey accent can be switched on from a phone", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareContext(context, "pro");
  await openEditor(page);
  await page.locator('[data-tour="mobile-menu"]').click();
  const account = page.locator('button[aria-label="Account menu"]:visible');
  await account.focus();
  await page.keyboard.press("Enter");
  const toggle = page.getByRole("menuitemcheckbox", { name: /Grey accent/ });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("html")).toHaveAttribute("data-accent", "mono");
  if (process.env.ACCENT_SHOTS)
    await page.screenshot({ path: process.env.ACCENT_SHOTS + "/phone.png" });
});
