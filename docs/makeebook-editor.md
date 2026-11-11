# makeEbook editor

The chapter editor is ProseMirror, used directly with no wrapper. Everything lives in `app/make-ebook/editor/`. Storage is still HTML (schema version 1 in `docs/makeebook-data.md`), so exports, word counts, Book Mind and sync read the same strings as before.

## Files

| File                             | What it does                                                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema.ts`                      | The schema: every node and mark a chapter can hold                                                                                                                                                             |
| `html.ts`                        | `htmlToDoc`, `htmlToSlice`, `docToHtml`: the only way HTML enters or leaves the editor                                                                                                                         |
| `setup.ts`                       | Builds an `EditorState` with history, keymaps and the plugins below                                                                                                                                            |
| `commands.ts`                    | Toolbar and menu commands: marks, headings, alignment, indent, links, anchors, endnotes, figures, text insertion                                                                                               |
| `useEditorView.ts`               | Owns one `EditorView` per mounted chapter editor: creates it, syncs `value` in, debounces HTML out, builds the imperative handle                                                                               |
| `ChapterEditor.tsx`              | The React component `ChapterPanel` renders. Same props as the old `RichTextEditor`                                                                                                                             |
| `Toolbar.tsx`, `toolbarItems.ts` | The toolbar, defined once in `toolbarItems.ts` and drawn in two layouts: full and compact (phone, with the more menu)                                                                                          |
| `EditorDialogs.tsx`              | Endnote and image caption dialogs                                                                                                                                                                              |
| `contextMenu.tsx`                | The right-click menu groups                                                                                                                                                                                    |
| `insert.ts`                      | Image file reading, link and anchor prompts, copy and cut                                                                                                                                                      |
| `registry.ts`                    | Every mounted editor registers an `EditorHandle`. `activeEditor()` and `editorForChapter(id)` find one; focus effects, the find query and the current selection (`subscribeSelection`) are broadcast from here |
| `search.ts`                      | Find and replace on chapters that are not open, through the same doc search                                                                                                                                    |
| `typography.ts`                  | The typography fixer applied to text nodes, as a transaction                                                                                                                                                   |
| `text.ts`                        | `docText(doc, from, to)`: the plain text of a document or range, as `htmlToText` in `model/text.ts` reads the same chapter's HTML                                                                              |
| `plugins/marks.ts`               | Book Mind highlights (decorations that fade after 2.2 s) and tracked ranges that follow edits                                                                                                                  |
| `plugins/focusEffects.ts`        | Paragraph focus (a node decoration with `data-para-focused`) and typewriter scrolling                                                                                                                          |
| `plugins/find.ts`                | Find highlights (`.find-match` decorations), `findMatches`, `replaceMatches`                                                                                                                                   |
| `plugins/ghost.ts`               | The flow mode ghost anchor: a zero-width widget at the caret that the suggestion is placed by and inserted at                                                                                                  |
| `EditorStyles.tsx`               | The editor's global CSS, unchanged from the old editor, plus the few rules ProseMirror needs                                                                                                                   |

## The schema

Nodes:

- `doc`: `block+`
- `paragraph`: `inline*`, attrs `align`, `id`, `endnoteEntryId` (`<p style="text-align: …" id data-endnote-entry-id>`)
- `heading`: levels 1 to 3, attrs `align`, `id`. `h4` to `h6` parse as `h3`, as the EPUB export does
- `blockquote`: `block+`
- `bullet_list`, `ordered_list` (attr `order` from `start`), `list_item`: `paragraph block*`
- `horizontal_rule`: `<hr>`, the scene break
- `code_block`: `<pre><code>`, attr `language` (the code element's class)
- `figure`: `figure_image figcaption?`, each with its `style` kept exactly, as the image dialog inserts them
- `image`: inline `<img>`, attrs `src`, `alt`, `title`, `style`
- `hard_break`: `<br>`
- `endnote_ref`: an inline atom for `<a class="note-N" href="#endN" id="refN" title="note N" data-endnote-ref="N" data-endnote-id="…" style="…"><sup>[N]</sup></a>`, with every attribute kept, in the same order
- `endnote_back`: an inline atom for the back link in the Endnotes chapter, `<a href="#refN" id="endN" data-back-to-ref="N" class="endnote-back" style="…">[N]</a>`
- `anchor`: an inline atom for an empty `<a id="…"></a>`
- `text`

Marks, outermost first: `link` (`href`, `title`; `javascript:` links are dropped), `strong` (`strong`, `b`), `em` (`em`, `i`), `underline` (`u`), `strike` (`s`, `strike`, `del`), `subscript`, `superscript`, `code`.

## How HTML crosses in and out

In: `htmlToDoc(html)` parses with the browser's `DOMParser` into an inert document, then the schema's parse rules. Stored chapter HTML is trusted and keeps its whitespace. Pasted HTML goes through `cleanPastedHtml` first (`htmlToDoc(html, "untrusted")`, or ProseMirror's `transformPastedHTML` in the editor), and pasted text through `plainTextToHtml`.

Out: `docToHtml(doc)` serialises with the schema, then:

- writes `style` attributes back exactly as stored (ProseMirror would normalise `#0066cc` to `rgb(0, 102, 204)`)
- gives an empty paragraph, heading or caption a `<br>`, and a block that ends in a line break a second `<br>`, as browsers need to show them. On the way in, a `<br>` that is the last thing in a block is dropped, because browsers don't show it either
- writes `<li><p>text</p></li>` as `<li>text</li>`, as the old editor and the importer did

So `docToHtml(htmlToDoc(x))` gives back `x` for the HTML the editor writes, and older HTML (`<b>`, `<i>`, `<div>`, styled spans) settles after one pass. `editor/html.dom.test.ts` checks both.

When a chapter opens, its HTML is parsed once. Edits are serialised 150 ms after typing stops, and at least once a second while it continues, then passed to `onChange`. Blur, `pagehide`, a chapter switch, `getHTML()` and a book switch (`flushEditors()`) flush straight away. A `value` that arrives from outside (import, cloud pull, find and replace in another chapter) replaces the document when the editor isn't focused and has no unsaved edits. A hidden editor, such as the phone layout on a desktop, only parses it when it becomes visible.

## The imperative API

`ChapterEditor` forwards a ref to its `EditorHandle`, and every handle is also in the registry, so the providers use `activeEditor()` rather than a ref through `ChapterPanel`. The handle (`registry.ts`) can focus, flush and get or set HTML, map a DOM `Range` to positions, track a range through edits, replace a range or insert compose and ghost text as one undo step with the highlight, undo and redo, count and replace matches, and run the typography fixer.

## Adding a node or mark

1. Add it to `schema.ts` with `parseDOM` and `toDOM`. Put a specific parse rule (an `a` with a data attribute, say) at a higher `priority` than the general one.
2. Add round-trip cases to `editor/html.dom.test.ts`: the HTML you expect to store must come back unchanged.
3. If the EPUB export needs it, check `EPUB_SAFE_CONFIG` in `utils/pasteCleaner.ts` and `normalizeHtmlForEpub` in `utils/exportEpub.ts`, and update the golden snapshot only if the change is intended.
4. If it needs CSS in the editor, add it to `EditorStyles.tsx` and run the visual browser test.

## Adding a command

1. Write it in `commands.ts` as a ProseMirror `Command` (`(state, dispatch, view) => boolean`).
2. For a toolbar button, add an entry to `toolbarItems.ts`, a case to `onAction` in `ChapterEditor.tsx`, and draw it in `Toolbar.tsx`. For a shortcut, add it to `shortcutKeymap` in `setup.ts`.
3. If it's an edit that should undo on its own, close the history group around it, as `run()` in `useEditorView.ts` does.
4. Never use `document.execCommand`.

## Text, word counts and selection

- **One reading of the text.** `model/text.ts` has `htmlToText`, `countWords`, `textStats` and `hasText`. Every word count, reading position, Book Mind brief and empty-chapter check uses them, so the footer, the version history and the pre-flight agree. Inline marks don't split a word, blocks and line breaks do, entities are decoded, and endnote markers and back links don't count. A word is any run with a letter or a digit in it.
- **Same answer from the document.** `editor/text.ts` reads the same text from the ProseMirror document. `editor/text.dom.test.ts` checks that the two agree on every kind of node.
- **Selection.** Features that act on selected text read it from the editor, not `window.getSelection()`. The editor publishes its selection on every change through `noteSelection` in `registry.ts`, and clears it on blur. Subscribe with `subscribeSelection`, and turn positions into a DOM `Range` with `domRangeAt` when a popover needs a rectangle. The phone's selection bar works this way. The ⌘K hint in `providers/editor/useWritingAssist.ts` still reads the browser selection and should move over. `useKeyboardInset` and `GhostTextOverlay` only listen for `selectionchange` as a layout or activity signal, which is fine.
