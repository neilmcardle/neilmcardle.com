import { describe, expect, it } from "vitest";
import { countWords, htmlToText } from "../model/text";
import { docToHtml, htmlToDoc } from "./html";
import { docText } from "./text";

const SAMPLES = [
  "<p>For my father, who kept the light.</p>",
  "<p>The <strong>keep</strong>er wrote&nbsp;nothing<br>at all.</p><p>Then rain.</p>",
  '<p>A tide<a class="note-1" href="#end1" id="ref1" title="note 1" data-endnote-ref="1" data-endnote-id="e1"><sup>[1]</sup></a> rose.</p>',
  '<p data-endnote-entry-id="e1">1. A note. <a href="#ref1" id="end1" data-back-to-ref="1" class="endnote-back">[1]</a></p>',
  "<h2>Harbour</h2><blockquote><p>Quoted line.</p></blockquote><ul><li><p>one</p></li><li><p>two</p></li></ul><hr><p>After the break.</p>",
  '<figure><img src="data:image/png;base64,AAAA" alt="A harbour"><figcaption>A harbour at dusk</figcaption></figure>',
  "<p>Tom &amp; Jerry&rsquo;s &mdash; quarrel</p>",
];

describe("docText matches htmlToText", () => {
  for (const html of SAMPLES) {
    it(html.slice(0, 48), () => {
      const doc = htmlToDoc(html);
      expect(docText(doc)).toBe(htmlToText(html));
      expect(htmlToText(docToHtml(doc))).toBe(htmlToText(html));
      expect(countWords(docText(doc))).toBe(countWords(htmlToText(html)));
    });
  }
});
