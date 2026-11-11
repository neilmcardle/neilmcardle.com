import { describe, expect, it } from "vitest";
import { closeHistory, undo, undoDepth } from "prosemirror-history";
import {
  EditorState,
  TextSelection,
  type Transaction,
} from "prosemirror-state";
import type { DecorationSet } from "prosemirror-view";
import {
  clearFormatting,
  indentBlock,
  INDENT,
  outdentBlock,
  replaceWithText,
  setAlign,
  setBlockLevel,
  toggleInline,
} from "./commands";
import { formatState } from "./formatState";
import { docToHtml, htmlToDoc } from "./html";
import { findMatches, replaceMatches } from "./plugins/find";
import { focusEffectsKey } from "./plugins/focusEffects";
import { trackRange, trackedRange } from "./plugins/marks";
import { replaceInHtml, countInHtml } from "./search";
import { createEditorState } from "./setup";
import { fixTypographyHtml } from "./typography";

const callbacks = { onModK: () => true };

function stateOf(html: string, at?: number) {
  const state = createEditorState(htmlToDoc(html), callbacks);
  if (at == null) return state;
  return state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, at)),
  );
}

function select(state: EditorState, from: number, to: number) {
  return state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, from, to)),
  );
}

function run(
  state: EditorState,
  command: (s: EditorState, d: (tr: Transaction) => void) => boolean,
) {
  let next = state;
  command(state, (tr) => {
    next = state.apply(tr);
  });
  return next;
}

const html = (state: EditorState) => docToHtml(state.doc);

describe("find and replace", () => {
  const doc = htmlToDoc(
    "<p>The <strong>grey</strong> gull and the Grey sea.</p><p>grey again</p>",
  );

  it("finds matches in every block, across marks", () => {
    expect(
      findMatches(doc, { term: "grey", caseSensitive: false }),
    ).toHaveLength(3);
    expect(
      findMatches(doc, { term: "grey", caseSensitive: true }),
    ).toHaveLength(2);
    expect(
      findMatches(doc, { term: "e g", caseSensitive: false }),
    ).toHaveLength(2);
  });

  it("treats the search term as text, not a pattern", () => {
    expect(
      findMatches(htmlToDoc("<p>a.b axb</p>"), {
        term: "a.b",
        caseSensitive: false,
      }),
    ).toHaveLength(1);
  });

  it("replaces every match and keeps the marks on the replacement", () => {
    const state = EditorState.create({ doc });
    const matches = findMatches(doc, { term: "grey", caseSensitive: false });
    const next = state.apply(replaceMatches(state.tr, matches, "silver"));
    expect(docToHtml(next.doc)).toBe(
      "<p>The <strong>silver</strong> gull and the silver sea.</p><p>silver again</p>",
    );
  });

  it("counts and replaces in a chapter that is not open", () => {
    const query = { term: "grey", caseSensitive: false };
    expect(countInHtml("<p>grey &amp; grey</p>", query)).toBe(2);
    expect(replaceInHtml("<p>grey &amp; grey</p>", query, "blue")).toEqual({
      html: "<p>blue &amp; blue</p>",
      count: 2,
    });
  });

  it("does not match inside tag names or attributes", () => {
    expect(
      countInHtml('<p><a href="https://grey.example">link</a></p>', {
        term: "grey",
        caseSensitive: false,
      }),
    ).toBe(0);
  });
});

describe("Book Mind edits", () => {
  it("replace a range as one undo step, keeping the marks", () => {
    let state = stateOf("<p>Start <em>old words</em> end.</p>");
    state = state.apply(state.tr.insertText("x", 1));
    const tr = closeHistory(state.tr);
    replaceWithText(tr, 8, 17, "new words");
    state = state.apply(tr);
    expect(html(state)).toBe("<p>xStart <em>new words</em> end.</p>");
    state = run(state, undo);
    expect(html(state)).toBe("<p>xStart <em>old words</em> end.</p>");
  });

  it("turn blank lines into paragraphs and single lines into breaks", () => {
    const state = stateOf("<p>Before after</p>");
    const tr = state.tr;
    replaceWithText(tr, 8, 8, "one\ntwo\n\nthree ");
    expect(docToHtml(state.apply(tr).doc)).toBe(
      "<p>Before one<br>two</p><p>three after</p>",
    );
  });

  it("track a range through edits made before it", () => {
    let state = stateOf("<p>Hello world</p>");
    state = state.apply(trackRange(state.tr, "t", 7, 12));
    state = state.apply(state.tr.insertText("Oh, ", 1));
    expect(trackedRange(state, "t")).toEqual({ from: 11, to: 16 });
    expect(state.doc.textBetween(11, 16)).toBe("world");
  });
});

describe("toolbar commands", () => {
  it("toggle bold on a selection and report it as active", () => {
    const state = run(
      select(stateOf("<p>Make this bold</p>"), 6, 10),
      toggleInline("bold"),
    );
    expect(html(state)).toBe("<p>Make <strong>this</strong> bold</p>");
    expect(formatState(select(state, 7, 8)).bold).toBe(true);
  });

  it("change a paragraph to a heading and back, keeping its alignment", () => {
    let state = stateOf('<p style="text-align: center;">Title</p>', 2);
    state = run(state, setBlockLevel(2));
    expect(html(state)).toBe('<h2 style="text-align: center;">Title</h2>');
    expect(formatState(state).heading2).toBe(true);
    state = run(state, setBlockLevel(0));
    expect(html(state)).toBe('<p style="text-align: center;">Title</p>');
  });

  it("align blocks the way the old editor stored them", () => {
    const state = run(stateOf("<p>Right</p>", 2), setAlign("right"));
    expect(html(state)).toBe('<p style="text-align: right;">Right</p>');
    expect(formatState(state).justifyRight).toBe(true);
  });

  it("indent and outdent with two em spaces", () => {
    let state = run(stateOf("<p>Line</p>", 3), indentBlock);
    expect(html(state)).toBe(`<p>${INDENT}Line</p>`);
    state = run(state, outdentBlock);
    expect(html(state)).toBe("<p>Line</p>");
  });

  it("clear formatting but keep links", () => {
    const state = run(
      select(
        stateOf(
          '<p><strong><a href="https://a.example">bold link</a></strong></p>',
        ),
        1,
        10,
      ),
      clearFormatting,
    );
    expect(html(state)).toBe(
      '<p><a href="https://a.example">bold link</a></p>',
    );
  });

  it("Enter and the following typing are one undo step, apart from what came before", () => {
    let state = stateOf("<p>Kept</p>", 5);
    state = state.apply(state.tr.insertText(" too"));
    const depth = undoDepth(state);
    state = state.apply(closeHistory(state.tr.split(state.selection.from)));
    state = state.apply(state.tr.insertText("Taken back"));
    expect(undoDepth(state)).toBe(depth + 1);
    state = run(state, undo);
    expect(html(state)).toBe("<p>Kept too</p>");
  });
});

describe("focus effects", () => {
  it("mark the top-level block with the caret", () => {
    let state = stateOf("<p>One</p><blockquote><p>Two</p></blockquote>", 8);
    state = state.apply(
      state.tr.setMeta(focusEffectsKey, {
        typewriter: false,
        paragraphFocus: true,
      }),
    );
    const plugin = state.plugins.find((p) => p.spec.key === focusEffectsKey)!;
    const decorations = plugin.props.decorations!.call(
      plugin,
      state,
    ) as DecorationSet;
    const found = decorations.find();
    expect(found).toHaveLength(1);
    expect(found[0].from).toBe(5);
    expect(found[0].to).toBe(state.doc.content.size);
  });
});

describe("typography", () => {
  it("fixes text node by node and leaves code alone", () => {
    expect(
      fixTypographyHtml(
        '<p>"Wait..." he said -- it\'s late.</p><pre><code>a -- b</code></pre>',
      ),
    ).toBe("<p>“Wait…” he said — it’s late.</p><pre><code>a -- b</code></pre>");
  });

  it("keeps at most two line breaks in a row", () => {
    expect(fixTypographyHtml("<p>a<br><br><br><br>b</p>")).toBe(
      "<p>a<br><br>b</p>",
    );
  });

  it("returns the chapter untouched when there is nothing to fix", () => {
    const html = "<p>Already “fine”.</p>";
    expect(fixTypographyHtml(html)).toBe(html);
  });
});
