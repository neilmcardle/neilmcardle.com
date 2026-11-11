import { test, expect } from "@playwright/test";
test("the landing rain effect runs in a frame with no size", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/make-ebook/privacy");
  await page.evaluate(() => {
    const f = document.createElement("iframe");
    f.style.width = "0";
    f.style.height = "0";
    f.src =
      "/make-ebook/brand/rain-on-glass.html?bg=/make-ebook/brand/library-lamp.jpg";
    document.body.appendChild(f);
  });
  await page.waitForTimeout(2500);
  expect(errors).toEqual([]);
});
