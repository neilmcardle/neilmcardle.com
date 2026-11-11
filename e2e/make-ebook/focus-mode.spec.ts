import type { Page } from "@playwright/test";
import {
  editor,
  expect,
  openEditor,
  setBookTitle,
  test,
  typeInEditor,
} from "./helpers";

async function enterFocusMode(page: Page) {
  await page.getByRole("button", { name: "Writing modes" }).click();
  await page.getByRole("menuitem", { name: /Focus mode/ }).click();
  await expect(
    page.getByRole("button", { name: "Focus", exact: true }),
  ).toBeVisible();
  const box = await editor(page).boundingBox();
  expect(box).not.toBeNull();
  if (box)
    await page.mouse.click(
      box.x + box.width / 2,
      box.y + Math.min(40, box.height / 2),
    );
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Focus", exact: true }),
  ).toBeVisible();
}

async function openFocusSettings(page: Page) {
  const settings = page.getByRole("dialog", { name: "Focus settings" });
  if (!(await settings.isVisible())) {
    await page.getByRole("button", { name: "Focus", exact: true }).click();
  }
  await expect(settings).toBeVisible();
  return settings;
}

async function expectFocusModeOff(page: Page) {
  await expect(
    page.getByRole("button", { name: "Focus", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "Focus settings" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Writing modes" }),
  ).toBeVisible();
}

test("focus mode and typewriter mode switch on and off while writing", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Quiet Hours");
  await typeInEditor(page, "The house was finally still.");

  await enterFocusMode(page);
  const settings = await openFocusSettings(page);
  const typewriter = settings.getByRole("switch", { name: "Typewriter mode" });

  await expect(typewriter).toHaveAttribute("aria-checked", "true");
  await typewriter.click();
  await expect(typewriter).toHaveAttribute("aria-checked", "false");
  await typeInEditor(page, " Without the typewriter.");

  const reopened = await openFocusSettings(page);
  const typewriterAgain = reopened.getByRole("switch", {
    name: "Typewriter mode",
  });
  await typewriterAgain.click();
  await expect(typewriterAgain).toHaveAttribute("aria-checked", "true");
  await typeInEditor(page, " With the typewriter again.");

  await expect(editor(page)).toContainText(
    "The house was finally still. Without the typewriter. With the typewriter again.",
  );

  const panel = await openFocusSettings(page);
  await panel.getByRole("button", { name: /Exit focus mode/ }).click();
  await expectFocusModeOff(page);

  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+Shift+f");
  await expect(
    page.getByRole("button", { name: "Focus", exact: true }),
  ).toBeVisible();
  await page.keyboard.type(" Shortcut focus.");
  await page.keyboard.press("Escape");
  await expectFocusModeOff(page);
  await expect(editor(page)).toContainText(
    "With the typewriter again. Shortcut focus.",
  );
});

test("closing the modes menu with Escape leaves focus mode on", async ({
  page,
}) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Writing modes" }).click();
  await page.getByRole("menuitem", { name: /Focus mode/ }).click();
  await expect(
    page.getByRole("button", { name: "Focus", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Focus", exact: true }),
  ).toBeVisible();
});
