import { describe, expect, it } from "vitest";
import {
  docToHtml,
  htmlToDoc,
  htmlToSlice,
  isEmptyDoc,
  normaliseHtml,
} from "./html";
import { schema } from "./schema";

const roundTrip = (html: string) => docToHtml(htmlToDoc(html));

const ENDNOTE_REF =
  '<a class="note-3" href="#end3" id="ref3" title="note 3" data-endnote-ref="3" data-endnote-id="endnote-1731234567890" style="color: #0066cc; text-decoration: none;"><sup>[3]</sup></a>';

const ENDNOTE_ENTRY =
  '<p data-endnote-entry-id="endnote-1731234567890">3. A note about the tide. <a href="#ref3" id="end3" data-back-to-ref="3" class="endnote-back" style="color: #0066cc; text-decoration: none; margin-left: 8px; cursor: pointer; user-select: none; font-weight: bold; font-size: 14px; padding: 2px 6px; border: 1px solid #0066cc; border-radius: 3px; background-color: #f0f8ff; display: inline-block;">[3]</a></p>';

const FIGURE =
  '<figure style="margin: 1em 0px; text-align: center;"><img src="data:image/png;base64,AAAA" alt="A harbour" style="max-width: 100%; display: block; margin: 0px auto;"><figcaption style="margin-top: 0.5em; font-size: 0.9em; font-style: italic; color: rgb(102, 102, 102);">A harbour</figcaption></figure>';

const VISUAL_CONTENT = [
  "<h1>Chapter heading</h1>",
  "<p>The keeper counted every ship that passed the rocks. Some nights there were <strong>none at all</strong>, and on others the sea was <em>crowded with lights</em> from end to end.</p>",
  "<p>He wrote each one down with the time, the weather and the colour of its lamp.</p>",
  "<h2>A smaller heading</h2>",
  "<blockquote><p>The light does not choose who it saves.</p></blockquote>",
  "<ul><li>First item in a list</li><li>Second item, a little longer than the first</li></ul>",
  "<ol><li>Numbered one</li><li>Numbered two</li></ol>",
  '<p>A line with <u>underline</u>, <s>strike</s>, H<sub>2</sub>O and E = mc<sup>2</sup>, and a <a href="https://example.com">link</a>.</p>',
  "<hr>",
  "<p>After the break, the morning came slowly.</p>",
].join("");

describe("round trip of every node and mark", () => {
  const cases: Record<string, string> = {
    paragraph: "<p>Plain words.</p>",
    "aligned paragraph": '<p style="text-align: center;">Centred.</p>',
    "paragraph with an id": '<p id="opening">An anchor target.</p>',
    "heading 1": "<h1>One</h1>",
    "heading 2": "<h2>Two</h2>",
    "heading 3": '<h3 style="text-align: right;">Three</h3>',
    blockquote: "<blockquote><p>Quoted.</p><p>Twice.</p></blockquote>",
    "bullet list": "<ul><li>One</li><li>Two</li></ul>",
    "ordered list": "<ol><li>One</li><li>Two</li></ol>",
    "ordered list with a start": '<ol start="4"><li>Four</li></ol>',
    "nested list": "<ul><li>Outer<ul><li>Inner</li></ul></li></ul>",
    "list item with two paragraphs": "<ul><li>First<p>Second</p></li></ul>",
    "scene break": "<p>Before.</p><hr><p>After.</p>",
    "code block": "<pre><code>if (a &lt; b) {\n  go();\n}</code></pre>",
    "code block with a language":
      '<pre><code class="language-js">let x = 1;</code></pre>',
    "inline image":
      '<p>Look <img src="https://example.com/a.png" alt="a mark" title="Mark"> here.</p>',
    figure: FIGURE,
    "hard break": "<p>Line one<br>Line two</p>",
    "hard break at the end": "<p>Line one<br><br></p>",
    "empty paragraph": "<p><br></p>",
    strong: "<p><strong>bold</strong></p>",
    em: "<p><em>italic</em></p>",
    underline: "<p><u>under</u></p>",
    strike: "<p><s>struck</s></p>",
    subscript: "<p>H<sub>2</sub>O</p>",
    superscript: "<p>mc<sup>2</sup></p>",
    code: "<p>Run <code>npm test</code> now.</p>",
    link: '<p><a href="https://example.com">a link</a></p>',
    "link with a title":
      '<p><a href="https://example.com" title="Example">a link</a></p>',
    "nested marks": "<p><strong><em>both</em></strong></p>",
    "endnote reference": `<p>The tide turned.${ENDNOTE_REF} Then it ebbed.</p>`,
    "endnote entry": ENDNOTE_ENTRY,
    anchor: '<p><a id="chapter-introduction"></a>Introduction</p>',
    "em spaces for indent": "<p>  Indented line.</p>",
    "non-breaking spaces": "<p>Two&nbsp; spaces.</p>",
    "the visual test chapter": VISUAL_CONTENT,
  };

  for (const [name, html] of Object.entries(cases)) {
    it(name, () => {
      expect(roundTrip(html)).toBe(html);
    });
  }
});

describe("endnote references", () => {
  it("become one inline atom with every attribute", () => {
    const doc = htmlToDoc(`<p>Text${ENDNOTE_REF}</p>`);
    const ref = doc.firstChild!.lastChild!;
    expect(ref.type).toBe(schema.nodes.endnote_ref);
    expect(ref.isAtom).toBe(true);
    expect(ref.attrs).toMatchObject({
      number: "3",
      endnoteId: "endnote-1731234567890",
      cls: "note-3",
      href: "#end3",
      id: "ref3",
      title: "note 3",
      label: "[3]",
      sup: true,
    });
  });

  it("keep the id the endnote sync looks for", () => {
    const html = roundTrip(`<p>Text${ENDNOTE_REF}</p>`);
    expect(html).toMatch(/data-endnote-id="endnote-1731234567890"/);
    expect(html).toMatch(
      /<a[^>]*data-endnote-id="endnote-1731234567890"[^>]*>.*?<\/a>/,
    );
  });

  it("back links in the endnotes chapter keep their entry id", () => {
    const doc = htmlToDoc(ENDNOTE_ENTRY);
    expect(doc.firstChild!.attrs.endnoteEntryId).toBe("endnote-1731234567890");
    expect(doc.firstChild!.lastChild!.type).toBe(schema.nodes.endnote_back);
  });
});

describe("pasting from Word", () => {
  const word = `<!--[if gte mso 9]><xml><o:OfficeDocumentSettings/></xml><![endif]-->
<p class="MsoNormal" style="mso-margin-top-alt:auto"><span style="font-family:Calibri">It was a <b>bright</b> cold <i>day</i> in April.</span><o:p></o:p></p>
<p class="MsoNormal"><span style="color:red">Second paragraph.</span></p>
<script>alert(1)</script><img src="x" onerror="alert(2)">`;

  it("keeps the words and the bold and italic", () => {
    const html = docToHtml(htmlToDoc(word, "untrusted"));
    expect(html).toContain(
      "It was a <strong>bright</strong> cold <em>day</em> in April.",
    );
    expect(html).toContain("Second paragraph.");
  });

  it("drops scripts, handlers, classes and styles", () => {
    const html = docToHtml(htmlToDoc(word, "untrusted"));
    expect(html).not.toMatch(/script|alert|onerror|Mso|mso-|style=|class=/);
  });

  it("parses as a slice for the editor to paste", () => {
    const slice = htmlToSlice(word);
    expect(slice.content.textBetween(0, slice.content.size, "\n")).toContain(
      "Second paragraph.",
    );
  });
});

describe("empty documents", () => {
  it("an empty string is one empty paragraph", () => {
    const doc = htmlToDoc("");
    expect(isEmptyDoc(doc)).toBe(true);
    expect(docToHtml(doc)).toBe("<p><br></p>");
  });

  it("a fresh paragraph from the old editor stays empty", () => {
    expect(isEmptyDoc(htmlToDoc("<p><br></p>"))).toBe(true);
  });

  it("an empty doc built from the schema serialises as the old editor did", () => {
    const doc = schema.topNodeType.createAndFill()!;
    expect(docToHtml(doc)).toBe("<p><br></p>");
  });
});

describe("HTML the old contentEditable editor produced", () => {
  const legacy: Record<string, [string, string]> = {
    "browser bold and italic tags": [
      "<p>A <b>bold</b> and <i>italic</i> word.</p>",
      "<p>A <strong>bold</strong> and <em>italic</em> word.</p>",
    ],
    "browser strike tags": [
      "<p><strike>gone</strike></p>",
      "<p><s>gone</s></p>",
    ],
    "a div line": ["<div>Line</div>", "<p>Line</p>"],
    "a trailing break the browser hides": ["<p>Words<br></p>", "<p>Words</p>"],
    "styled spans": [
      '<p><span style="font-size: 18px;">Big</span> words</p>',
      "<p>Big words</p>",
    ],
    "a leftover Book Mind highlight": [
      '<p><span id="bm-edit-1" class="bm-edit-highlight">New words</span></p>',
      "<p>New words</p>",
    ],
    "deep headings": ["<h5>Deep</h5>", "<h3>Deep</h3>"],
    "an inserted figure without a caption": [
      '<figure style="margin: 1em 0px; text-align: center;"><img src="data:image/png;base64,AAAA" alt="Image" style="max-width: 100%; display: block; margin: 0px auto;"></figure>',
      '<figure style="margin: 1em 0px; text-align: center;"><img src="data:image/png;base64,AAAA" alt="Image" style="max-width: 100%; display: block; margin: 0px auto;"></figure>',
    ],
    "loose text": ["one<p>two</p>", "<p>one</p><p>two</p>"],
    "imported paragraphs on separate lines": [
      "<p>First.</p>\n<p>Second.</p>",
      "<p>First.</p><p>Second.</p>",
    ],
    "a script": ["<p>Safe</p><script>alert(1)</script>", "<p>Safe</p>"],
  };

  for (const [name, [input, expected]] of Object.entries(legacy)) {
    it(`${name} normalises once and then stays the same`, () => {
      const once = normaliseHtml(input);
      expect(once).toBe(expected);
      expect(normaliseHtml(once)).toBe(once);
    });
  }

  it("drops javascript links but keeps the words", () => {
    expect(
      normaliseHtml('<p><a href="javascript:alert(1)">click</a></p>'),
    ).toBe("<p>click</p>");
  });

  it("keeps a doubled break that makes a blank line", () => {
    const doc = htmlToDoc("<p>One<br><br>Two</p>");
    expect(doc.firstChild!.childCount).toBe(4);
  });
});
