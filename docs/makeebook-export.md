# makeEbook export

One renderer turns a book into chapters once, and three thin writers package it. Everything lives in `app/make-ebook/export/`.

## Files

| File         | What it does                                                                                                                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render.ts`  | `renderBook(input)`: parses each chapter's HTML into a ProseMirror document, names chapter files, gathers images once for the whole book, finds the endnotes chapter by its content, and resolves every link (`href`, `noteHref`, `backHref`) |
| `xhtml.ts`   | `chapterBody(target)`: serialises a chapter document to XHTML. Images are either packaged files or inline data, and links either point across files (EPUB) or within one page (PDF)                                                           |
| `styles.ts`  | The nine typography presets, `bookCss(preset)` (the stylesheet every format and the preview share) and `PRINT_CSS` for PDF page rules                                                                                                         |
| `epub.ts`    | `epubFiles(book, options)` lists every file in the package, `buildEpub` zips them, and `chapterSection` is the chapter markup the preview reuses                                                                                              |
| `pdf.ts`     | `pdfHtml(book)` builds one printable page, and `printPdf` opens it and prints once                                                                                                                                                            |
| `docx.ts`    | `buildDocx(book)` maps document nodes straight to Word: real endnotes, numbered and bulleted lists, images at their true proportions, links, and the preset's font, size, spacing and indent                                                  |
| `preview.ts` | `previewDocument(book, index, view)`: the chapter section and EPUB stylesheet, plus page colour and paging, drawn in the preview's frame                                                                                                      |

## Rules

- **One reading.** Writers never parse HTML themselves. If a format needs something new, add it to the renderer or the serialiser so every format gets it.
- **Endnotes.** The endnotes chapter is the one holding `endnote_back` links or entry paragraphs, whatever it is called. EPUB and PDF link both ways, and Word uses real endnotes and skips that chapter.
- **Presets.** A book's `typography` is saved on the book (`normalisePreset` in `model/book.ts` falls back to `default`). It's picked in the preview controls or the export dialog, through `TypographyPicker`.
- **Language.** `dc:language` must be a language tag, so names like "English" are mapped by `languageTag`.

## Checks

- Golden tests: `export/export.golden.dom.test.ts` pins the EPUB package, every chapter, the PDF page and Word's `document.xml` and `endnotes.xml`, and checks the preview shows the same section and stylesheet as the EPUB. If a change to the output is intended, update with `npx vitest run app/make-ebook/export -u` and review the diff.
- EPUBCheck: `EPUB_OUT=/tmp/sample.epub npx vitest run app/make-ebook/export` writes the sample book, then run `java -jar epubcheck.jar /tmp/sample.epub` (EPUBCheck 5.1 needs Java 11 or later). On 11 November 2026 the sample book and an awkward variant (no cover, ISBN, a language name, untitled and empty chapters) both passed with no errors or warnings.
