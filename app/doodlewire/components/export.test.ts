import { describe, expect, it } from "vitest";
import { exportAsHtml, exportAsReact } from "./export";
import type { WfElement } from "./wireframe-canvas";

const size = { w: 390, h: 844 };

function element(type: WfElement["type"], label: string): WfElement {
  return { id: "1", type, label, bbox: { x: 0, y: 0, w: 100, h: 40 } };
}

describe("exportAsHtml", () => {
  it("escapes labels in text and attributes", () => {
    const html = exportAsHtml(
      [element("input", `Say "hi" & <wave>`), element("text", "<b>bold</b>")],
      size,
    );
    expect(html).toContain(
      `placeholder="Say &quot;hi&quot; &amp; &lt;wave&gt;"`,
    );
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
    expect(html).not.toContain("<b>bold</b>");
  });
});

describe("exportAsReact", () => {
  it("wraps unsafe labels in string expressions", () => {
    const code = exportAsReact(
      [element("heading", "Sale {50%} <now>"), element("input", `Say "hi"`)],
      size,
    );
    expect(code).toContain(`{"Sale {50%} <now>"}`);
    expect(code).toContain(`placeholder={"Say \\"hi\\""}`);
  });

  it("leaves plain labels as text", () => {
    const code = exportAsReact([element("heading", "Welcome back")], size);
    expect(code).toContain(">Welcome back<");
  });
});
