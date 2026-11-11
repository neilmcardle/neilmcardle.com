import { describe, expect, it } from "vitest";
import { cleanPastedHtml, plainTextToHtml } from "./pasteCleaner";

const wordHtml = `<!--[if gte mso 9]><xml><o:OfficeDocumentSettings/></xml><![endif]-->
<p class="MsoNormal" style="mso-margin-top-alt:auto;margin-bottom:0cm"><span style="font-family:Calibri;mso-bidi-font-family:Arial">It was a <b>bright</b> cold <i>day</i> in April.</span><o:p></o:p></p>
<p class="MsoNormal"><span style="color:red">Second paragraph.</span><o:p>&nbsp;</o:p></p>
<script>alert(1)</script><img src="x" onerror="alert(2)">`;

describe("cleanPastedHtml", () => {
  const out = cleanPastedHtml(wordHtml);

  it("keeps the words", () => {
    expect(out).toContain("It was a");
    expect(out).toContain("in April.");
    expect(out).toContain("Second paragraph.");
  });

  it("turns Word bold and italic into strong and em", () => {
    expect(out).toContain("<strong>bright</strong>");
    expect(out).toContain("<em>day</em>");
    expect(out).not.toMatch(/<b>|<i>/);
  });

  it("drops Word markup, styles and classes", () => {
    expect(out).not.toMatch(/mso-|o:p|MsoNormal|style=|class="Mso/);
    expect(out).not.toContain("<span");
    expect(out).not.toContain("<!--");
  });

  it("drops scripts and event handlers", () => {
    expect(out).not.toContain("<script");
    expect(out).not.toContain("alert(1)");
    expect(out).not.toContain("onerror");
  });

  it("keeps code blocks as literal text", () => {
    const code = cleanPastedHtml("<pre><code>if (a < b) { x(); }</code></pre>");
    expect(code).toContain("<pre>");
    expect(code).toContain("a &lt; b");
  });

  it("starts a new paragraph after a double line break", () => {
    expect(cleanPastedHtml("one<br><br>two")).toBe("one<p>two</p>");
  });

  it("removes empty paragraphs", () => {
    expect(cleanPastedHtml("<p>a</p><p> </p><p>b</p>")).toBe(
      "<p>a</p><p>b</p>",
    );
  });
});

describe("plainTextToHtml", () => {
  it("makes one paragraph per line", () => {
    expect(plainTextToHtml("First line\nSecond line")).toBe(
      "<p>First line</p><p>Second line</p>",
    );
  });

  it("keeps text that looks like markup exactly as typed", () => {
    const out = plainTextToHtml("Use <b>tags</b> & entities");
    expect(out).toBe("<p>Use &lt;b&gt;tags&lt;/b&gt; &amp; entities</p>");
  });

  it("never runs pasted script text", () => {
    expect(plainTextToHtml("<script>alert(1)</script>")).not.toContain(
      "<script",
    );
  });

  it("keeps one blank paragraph for a run of empty lines", () => {
    expect(plainTextToHtml("a\n\n\n\nb")).toBe("<p>a</p><p><br></p><p>b</p>");
  });
});
