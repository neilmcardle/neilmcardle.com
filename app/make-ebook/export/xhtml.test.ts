import { describe, expect, it } from "vitest";
import { escapeXml as xml } from "./xhtml";

describe("xml", () => {
  it("escapes characters that break EPUB markup", () => {
    expect(xml(`Tom & Jerry <"Cats"> 'n' dogs`)).toBe(
      "Tom &amp; Jerry &lt;&quot;Cats&quot;&gt; &apos;n&apos; dogs",
    );
  });

  it("leaves plain text alone", () => {
    expect(xml("The Long Road Home")).toBe("The Long Road Home");
  });
});
