import { expect, test } from "./helpers";

test("a signed-out visitor sees the landing page instead of the editor", async ({
  page,
}) => {
  await page.goto("/make-ebook?fps=0");
  await expect(
    page.getByRole("button", { name: /start writing/i }).first(),
  ).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByTestId("chapter-editor")).toHaveCount(0);
});
