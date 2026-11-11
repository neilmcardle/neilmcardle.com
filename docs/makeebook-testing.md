# makeEbook tests

These are the safety net for the makeEbook refactor (`drafts/makeebook-refactor-plan.md`, outside the repo). Every phase must leave them passing.

## Run them

- Unit tests: `npx vitest run`. Two projects: `node` for plain logic, and `dom` (jsdom) for files named `*.dom.test.ts`, such as the paste cleaner and the editor's HTML round trip (`app/make-ebook/editor/html.dom.test.ts`).
- Browser tests: `npm run test:e2e` (Playwright, using your installed Chrome). They reuse a dev server on http://localhost:3000, or start one.
- Performance baseline: build, `next start -p 3005`, then `npm run perf:baseline -- http://localhost:3005 3`. Results from before the refactor are in `docs/makeebook-baseline.md`.
- Typing performance: `E2E_PERF=1 npx playwright test e2e/make-ebook/perf.spec.ts`. It opens a 100,000-word book in 40 chapters, types a sentence at the end of its longest chapter (6,400 words) and fails if any task takes 50 ms or more. It is skipped without `E2E_PERF`. Against the dev server React runs in development mode, so for a fair number run it against a production build started on port 3005 with a placeholder Supabase URL (`NEXT_PUBLIC_SUPABASE_URL=https://e2eperf.supabase.co`): `E2E_SUPABASE_STORAGE_KEY=sb-e2eperf-auth-token E2E_BASE_URL=http://localhost:3005 E2E_PERF=1 npx playwright test e2e/make-ebook/perf.spec.ts`. A production build doesn't expose the Supabase client, so the helpers take the auth cookie name from `E2E_SUPABASE_STORAGE_KEY`. Measured on 10 November 2026: no tasks over 50 ms in three runs, median 10 ms from key to paint, worst 48 ms.

## What the browser tests cover

`e2e/make-ebook/`:

- **Persistence:** a new book keeps its title and text after a reload.
- **Chapters:** add, rename, reorder, delete and cancel delete, each checked after a reload.
- **Import:** a .txt and a .docx create new books, and the open book is not overwritten.
- **Export:** EPUB (checked inside the zip), Word (checked inside the document) and PDF (the print window).
- **Formatting:** bold, italic and headings by shortcut and toolbar, plus undo and redo.
- **Editor:** a Book Mind inline rewrite (mocked) is accepted, then undone and redone in one step each. Find and replace highlights matches, respects case, replaces across chapters and undoes in the open chapter. An endnote added from the toolbar is in the chapter and links both ways in the EPUB.
- **Visual:** the chapter surface matches saved screenshots on desktop and phone (`visual.spec.ts-snapshots/`). Don't update them to make a change pass; a difference means the editor looks different.
- **Paste:** Word HTML loses its scripts and styling but keeps its words. Plain text keeps every line and its characters as typed.
- **Book Mind:** a streamed answer from a mocked server.
- **Selection:** on a phone, the Book Mind bar appears for a selection, clears when it collapses and comes back for select all.
- **Focus and typewriter modes:** both switch on and off. Escape closes a menu without leaving focus mode.
- **Landing:** a signed-out visitor sees the landing, not the editor.
- **Storage:** a book saved in the old localStorage blob opens after the upgrade and the blob is removed. A backup downloads, and restores into an emptied browser.
- **Cloud sync:** a Pro writer's saved book is pushed to `makeebook_books`, and a book saved on another device is pulled. Both run against an in-test fake of the table.

Every test fails if the page throws an uncaught error.

## How they get into the editor

The editor needs a signed-in user, and the tests never use a real account. `e2e/make-ebook/helpers.ts`:

- puts a made-up session for `writer@example.test` into the Supabase auth cookie
- answers every `*.supabase.co` request locally, with a small fake of the `makeebook_books` table (`FakeCloud`) that handles select, guarded update, insert and its duplicate-key conflict
- mocks `/api/subscription` (free, or Pro for Book Mind)
- returns 503 from the AI routes, so nothing reaches the real project or a model

## Writing new tests

- Find elements by role, label or visible text. Use `data-testid` only where an element has no accessible name. Today that's the chapter editor, chapter list and rows, the add-chapter button and the library list.
- Keep those test ids when components are rebuilt. The ProseMirror editor puts `data-testid="chapter-editor"` on its editable root, through the view's `attributes`.
- The pinned EPUB output is in `app/make-ebook/utils/__snapshots__/`. If a change to the exporter is intended, update the snapshots with `npx vitest run -u` and review the diff.
