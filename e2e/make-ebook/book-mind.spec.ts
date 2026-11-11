import {
  expect,
  openEditor,
  setBookTitle,
  test,
  typeInEditor,
} from "./helpers";

test.use({ tier: "pro" });

test("Book Mind shows a streamed answer from a mocked server", async ({
  page,
}) => {
  const requests: unknown[] = [];
  await page.route("**/api/ai/book-mind", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
      },
      body: [
        'data: {"content":"Hello"}',
        "",
        'data: {"content":" from the mocked Book Mind."}',
        "",
        "data: [DONE]",
        "",
        "",
      ].join("\n"),
    });
  });

  await openEditor(page);
  await setBookTitle(page, "Questions for the Lighthouse");
  await typeInEditor(page, "Agnes climbed the stairs one more time.");

  await page.getByRole("button", { name: "Book Mind", exact: true }).click();
  const bookMind = page.getByRole("dialog", { name: "Book Mind" });
  await expect(bookMind).toBeVisible();

  const ask = bookMind.getByRole("textbox", { name: "Ask Book Mind" });
  await ask.fill("Who climbs the stairs?");
  await bookMind.getByRole("button", { name: "Send" }).click();

  await expect(
    bookMind.getByText("Hello from the mocked Book Mind."),
  ).toBeVisible();
  await expect(bookMind).toContainText("Who climbs the stairs?");
  expect(requests).toHaveLength(1);
  expect(JSON.stringify(requests[0])).toContain("Who climbs the stairs?");
});
