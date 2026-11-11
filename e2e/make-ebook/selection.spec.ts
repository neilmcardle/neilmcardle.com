import { editor, expect, openEditor, test, typeInEditor } from "./helpers";

test.use({ tier: "pro", viewport: { width: 390, height: 844 } });

test("the phone selection bar follows the editor's selection", async ({
  page,
}) => {
  await openEditor(page);
  await typeInEditor(page, "The keeper counted every ship.");
  const rewrite = page.getByRole("button", { name: "Rewrite" });
  await expect(rewrite).toHaveCount(0);

  for (let i = 0; i < 5; i++) await page.keyboard.press("Shift+ArrowLeft");
  await expect(rewrite).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(rewrite).toHaveCount(0);

  await editor(page).press("ControlOrMeta+a");
  await expect(rewrite).toBeVisible();
});
