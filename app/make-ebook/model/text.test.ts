import { describe, expect, it } from "vitest";
import {
  countWords,
  decodeEntities,
  hasText,
  htmlToText,
  textStats,
} from "./text";

describe("htmlToText", () => {
  it("keeps a word whole across inline marks", () => {
    expect(htmlToText("<p><strong>wo</strong>rd</p>")).toBe("word");
  });

  it("separates blocks and line breaks", () => {
    expect(htmlToText("<p>one</p><p>two</p>")).toBe("one two");
    expect(htmlToText("<p>one<br>two</p>")).toBe("one two");
    expect(htmlToText("<ul><li>a</li><li>b</li></ul>")).toBe("a b");
  });

  it("decodes entities, including no-break spaces", () => {
    expect(htmlToText("<p>Tom&nbsp;&amp;&nbsp;Jerry&rsquo;s</p>")).toBe(
      "Tom & Jerry’s",
    );
    expect(decodeEntities("&#8217;&#x2014;&bogus;")).toBe("’—&bogus;");
  });

  it("drops endnote markers and back links", () => {
    const ref =
      '<a class="note-1" href="#end1" id="ref1" data-endnote-ref="1"><sup>[1]</sup></a>';
    const back =
      '<a href="#ref1" id="end1" data-back-to-ref="1" class="endnote-back">[1]</a>';
    expect(htmlToText(`<p>light${ref} here</p>`)).toBe("light here");
    expect(htmlToText(`<p>${back} A note.</p>`)).toBe("A note.");
  });

  it("ignores styles, scripts and comments", () => {
    expect(
      htmlToText("<style>p{}</style><p>a</p><!-- x --><script>1</script>"),
    ).toBe("a");
  });

  it("handles empty input", () => {
    expect(htmlToText("")).toBe("");
    expect(htmlToText(null)).toBe("");
    expect(hasText("<p><br></p>")).toBe(false);
    expect(hasText("<p>&nbsp;</p>")).toBe(false);
    expect(hasText("<p>x</p>")).toBe(true);
  });
});

describe("countWords", () => {
  it("counts tokens with a letter or digit", () => {
    expect(countWords("For my father, who kept the light.")).toBe(7);
    expect(countWords("wait — what * 2026")).toBe(3);
    expect(countWords("   ")).toBe(0);
  });

  it("gives one count for the same chapter however it is written", () => {
    const a = "<p>For my <em>father</em>, who kept the light.</p>";
    const b =
      "<p>For&nbsp;my father, who <strong>kept</strong> the light.</p>\n";
    expect(textStats(a).words).toBe(7);
    expect(textStats(b).words).toBe(7);
  });
});
