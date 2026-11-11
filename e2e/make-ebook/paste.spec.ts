import {
  editor,
  expect,
  exportEpub,
  openEditor,
  pasteInto,
  setBookTitle,
  test,
  typeInEditor,
  waitForSave,
} from "./helpers";

const WORD_HTML = [
  '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">',
  "<head><meta name=ProgId content=Word.Document>",
  "<style>p.MsoNormal{mso-style-name:Normal;mso-pagination:widow-orphan;color:#c00000}</style>",
  "<script>window.__pastedScriptRan = true;</script>",
  "</head><body lang=EN-GB>",
  "<!--StartFragment-->",
  '<p class=MsoNormal style="mso-margin-top-alt:auto;font-family:Calibri;mso-fareast-font-family:Calibri">',
  '<span style="font-size:14.0pt;color:#ff0000;mso-bidi-font-weight:bold">Rain fell on the orchard</span>',
  "<o:p></o:p></p>",
  '<p class=MsoNormal><span style="mso-spacerun:yes">&nbsp;</span>',
  '<b style="mso-bidi-font-weight:normal">all through the night</b>',
  "<script>window.__pastedScriptRan = true;</script>",
  '<img src="x" onerror="window.__pastedScriptRan = true">',
  "<o:p>&nbsp;</o:p></p>",
  "<!--EndFragment-->",
  "</body></html>",
].join("");

test("pasting Word HTML keeps the words and drops scripts and Word styling", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Orchard Notes");
  await typeInEditor(page, "Before the paste.");
  await page.keyboard.press("Enter");

  await pasteInto(page, editor(page), {
    html: WORD_HTML,
    text: "Rain fell on the orchard all through the night",
  });

  await expect(editor(page)).toContainText("Rain fell on the orchard");
  await expect(editor(page)).toContainText("all through the night");
  await expect(editor(page)).toContainText("Before the paste.");
  await expect(editor(page)).not.toContainText("mso-");
  await expect(editor(page)).not.toContainText("__pastedScriptRan");
  expect(
    await page.evaluate(
      () => (window as { __pastedScriptRan?: boolean }).__pastedScriptRan,
    ),
  ).toBeUndefined();
  await waitForSave(page);

  const epub = await exportEpub(page);
  const xhtml =
    epub.chapters.find((c) => c.includes("Rain fell on the orchard")) ?? "";
  expect(xhtml).toContain("all through the night");
  expect(xhtml).not.toMatch(/<script/i);
  expect(xhtml).not.toMatch(/mso-/i);
  expect(xhtml).not.toMatch(/<o:p/i);
  expect(xhtml).not.toMatch(/onerror/i);
  expect(xhtml).not.toMatch(/font-size:\s*14/i);
  expect(xhtml).not.toMatch(/color:\s*#ff0000/i);
  expect(xhtml).not.toContain("__pastedScriptRan");
});

test("pasting plain text keeps every line as readable text", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Plain Paste");
  await typeInEditor(page, "Opening line.");
  await page.keyboard.press("Enter");

  await pasteInto(page, editor(page), {
    text: "First pasted line\n\nSecond pasted line\r\nThird pasted line",
  });

  await expect(editor(page)).toContainText("Opening line.");
  await expect(editor(page)).toContainText("First pasted line");
  await expect(editor(page)).toContainText("Second pasted line");
  await expect(editor(page)).toContainText("Third pasted line");
  await waitForSave(page);

  const epub = await exportEpub(page);
  const xhtml =
    epub.chapters.find((c) => c.includes("First pasted line")) ?? "";
  expect(xhtml).toContain("Third pasted line");
  expect(xhtml).not.toMatch(/<script/i);
});

test("pasting plain text that looks like markup keeps the characters as typed", async ({
  page,
}) => {
  await openEditor(page);
  await setBookTitle(page, "Literal Paste");
  await typeInEditor(page, "Opening line.");
  await page.keyboard.press("Enter");

  await pasteInto(page, editor(page), {
    text: "Use <b>tags</b> sparingly & check that 3 < 4.",
  });

  await expect(editor(page)).toContainText(
    "Use <b>tags</b> sparingly & check that 3 < 4.",
  );
});
