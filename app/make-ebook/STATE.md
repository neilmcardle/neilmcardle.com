# makeEbook state map

The editor's important flows are explicit state machines. Each one is a pure reducer in `state/`, tested in a file next to it, and wrapped by a hook that still returns the older flag names, so components don't change when a flow does.

Read this before adding a flag. If a new flag only makes sense alongside another one, extend the reducer instead.

## Explicit flows

| Flow                             | Reducer                                  | Hook                                  | States                                                                                                                                                                     |
| -------------------------------- | ---------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Book Mind request              | `state/bookMindRequest.ts`               | `useBookMind`                         | `idle` (may carry an error and a code), `reading` (may carry the chapters being read), `streaming`                                                                         |
| Inline rewrite takes and compose | `state/takes.ts`                         | `InlineEditPopover`, `ComposePalette` | `idle`, `running` (with a run number), `done` (error only when every take failed)                                                                                          |
| Manuscript import                | `state/documentImport.ts`                | `useDocumentImport`                   | `closed`, `open`, `importing`, `failed` (always shown in the dialog)                                                                                                       |
| Panels and dialogs in the editor | `state/overlays.ts`                      | `useOverlays`                         | three layers, one item each: `sheet` (mobile sidebar, mobile Book Mind, chapters), `panel` (new book, history, pre-flight), `popup` (confirm dialog, upgrade, EPUB reader) |
| Saves and cloud pushes           | `state/singleFlight.ts`, `state/save.ts` | `useSaveBook`                         | per key: in flight with at most one queued follow-up, or absent. Results: `saved`, `blank`, `failed`                                                                       |
| Cloud sync per book              | `state/sync.ts`                          | `useCloudSync`                        | `decide(local, remote)` returns `push`, `pull`, `conflict`, `nothing` or `deleteLocal` from the revisions on each side                                                     |
| Switching book                   | `state/bookSwitch.ts`                    | `useBookSwitch`                       | `token` and `pending`: only the latest switch applies                                                                                                                      |
| Export                           | `state/exportFlow.ts`                    | `useSaveBook`                         | `idle`, `exporting`, `failed`                                                                                                                                              |
| Book Mind chats                  | `state/chats.ts`                         | `useBookMind`                         | the stored list; every write starts from it                                                                                                                                |
| Book Mind gate                   | `state/bookMindGate.ts`                  | `BookMindChat`                        | `send`, `upgrade`, `wait`                                                                                                                                                  |
| Checkout                         | `state/checkout.ts`                      | `UpgradeModal`                        | `idle`, `redirecting`, `failed` (each with a plan)                                                                                                                         |
| Subscription tier                | `lib/hooks/subscriptionState.ts`         | `useSubscription`                     | `loading`, `known`, `failed`, plus `awaitingUpgrade` after checkout                                                                                                        |
| App phase                        | `state/appPhase.ts`                      | `SessionProvider`                     | `booting` (with or without the landing), `marketing` (library read or not), `choosing`, `loading` (from, pending), `ready`                                                 |
| Autosave timing                  | `state/autosave.ts`                      | `useAutoSave`                         | dirty, saving, failed, last saved, first unsaved edit, failures, attempt; `autosaveDelay` gives the wait                                                                   |
| Cloud sync status                | `state/syncStatus.ts`                    | `useCloudSync`                        | gate: running, rerun, last run, conflicts open. Status: first sync done, conflicts, merged library                                                                         |

Rules these encode:

- **Book Mind:** a request is never loading and streaming at once. A new request clears the last error. The free question is spent when the server answers `freeQuestionSpent: true`, which arrives as `errorCode === "free_question_spent"`. Never match error wording.
- **Takes:** every run gets a number. Takes or errors from an older run are ignored, so a slow answer can't land in a newer run.
- **Import:** a failed import always opens the dialog with the error, even when it started from the hidden file picker. The dialog can't close halfway through an import.
- **Overlays:** a popup can sit over a panel, and a panel over a sheet. Opening a second item in the same layer replaces the first. Closing an item only works if it's the one that's open. `closeTop` closes the highest layer first.
- **Saves:** one save runs at a time. A save asked for while one runs is queued and merged with any other queued save, then runs with the latest book. Its callers get the follow-up's result, so "busy" is never a failure and autosave never backs off for it. Autosave keeps its save function in a ref updated by an effect, so it always saves the current endnotes and cloud tier.
- **Snapshots:** Cmd+S, overwrite and save as new version only snapshot a version when the result is `saved`.
- **Cloud pushes:** one push per book at a time, with one queued follow-up. Pushes go through one queue per book in `storage/cloudStore.ts`, shared by saves and sync, so two pushes never race the same revision guard. Ids are UUIDs from creation, so a push never renames a book.
- **Switching book:** library loads, imports, new book and going home all go through `useBookSwitch`, owned by `BookProvider`. Its wrapper tells the app phase `loadStarted`, then `opened` inside the apply or `loadAbandoned`. A switch flushes the open book, then checks it is still the latest switch, prepares (reads the book, or parses the file), checks again, bumps `editorSessionRef` and applies. An import clears `currentBookId`, so it saves as a new book and never under the old book's id. A save that finishes after a switch can't set the old id back.
- **Export:** a second export while one runs is ignored. A failure opens an alert. Export only updates chapter ids when one is missing and never calls `markClean`, so edits made during an export stay unsaved until autosave saves them.
- **Book Mind chats:** there is one `useBookMind`, in `EditorProvider`, shared by the desktop window and the mobile sheet. A message without a chat picks a chat id first, and the exchange creates the stored chat when it is saved. Create, rename, delete and save all read the stored list first.
- **Book Mind gate:** sending, quick actions and retry all ask `bookMindGate`, so retry respects the trial lock. While the tier is unknown nobody is on the trial, so a Pro writer never sees trial copy while loading.
- **Checkout:** Back from Stripe (`pageshow` with `persisted`) ends the spinner. Opening the modal again clears the last error and goes back to monthly.
- **Subscription tier:** loading and failed fetches are unknown (`tierKnown: false`), not free. Every fetch has a request number and an AbortController, so a slow answer for a previous user is dropped. `?checkout=success` calls `expectUpgrade`, which polls every two seconds, up to eight times, until the tier is Pro.

- **App phase:** the landing shows while `showsLanding(phase)` and no chapters are open. `isHydrated(phase)` replaces the old `initialized`, and the old `libraryLoading` is gone because nothing read it apart from `initialized`. Signing in or out, the first library read, start writing, `?load=`, opening, closing and abandoning a book are the events.
- **Loading a book is not an edit:** `useLibrary` bumps `loadToken` in the same batch as the loaded book. The dirty tracker in `providers/editor/useSaveStatus.ts` skips the one change that carries a new token and marks every other change dirty. There is no `isLoadingBookRef` or second effect to clear it, so the order of effects no longer matters.
- **Autosave:** it only backs off when a save returns `failed`: 15 s, doubling, up to two minutes. Otherwise it waits two seconds after the last edit, and never more than 20 seconds after the first.
- **Cloud sync:** one sync at a time. A forced sync asked for mid-sync runs once more afterwards. Unforced syncs are throttled to one every ten seconds, and nothing runs while conflicts are on screen. The first sync is done when one finishes or after six seconds.

## Flows still held as separate flags

These are small enough that flags are clearer. Don't add to them without moving them into a reducer.

- **Onboarding tour**, in `useOnboarding`: active, step, complete.
- **Billing portal**, in `ManageBillingButton`: loading and error.
- **Undo delete**, in `sidebar/ChaptersPanel`: `pendingDeleteIndex`, which clears itself after five seconds.
- **Chapter drag and drop**, in `useChapters`.
- **Preview paging**, in `PreviewSurface`; the EPUB reader's own state, in `EPUBReaderModal`; ghost text timing, in `GhostTextOverlay` (the anchor itself is editor state, below); pre-flight drafting, in `PreflightExportDialog`.

The short flashes `saveFeedback`, `bookJustLoaded` and `chapterJustAdded` and a second `pendingDeleteIndex` in `page.tsx` were set but never read, so phase 3 removed them.

## Where the state lives

`docs/makeebook-architecture.md` maps the providers. In short: `SessionProvider` holds auth, the subscription, cloud sync and the app phase; `BookProvider` holds the open book, the library and book switching; `EditorProvider` holds overlays, panels, modes, Book Mind, history, save status and find and replace. No function ref is assigned during render. Where one provider needs another's callback it goes through a port (`usePort` in `providers/store.ts`), connected in a layout effect.

## The editor's own state

The chapter editor is ProseMirror (`editor/`, described in `docs/makeebook-editor.md`). Anything that used to read or change the DOM selection is now editor state, changed only by transactions:

- **Document and selection:** one `EditorState` per mounted chapter editor. Undo and redo are `prosemirror-history`. Enter and Shift+Enter start a new undo step, as the browser did.
- **HTML out:** serialised 150 ms after typing stops (at most a second apart while it continues), and straight away on blur, `pagehide`, chapter switch and book switch (`flushEditors()` runs first in `beforeSwitch`).
- **HTML in:** a new `value` replaces the document only while the editor isn't focused and has nothing unsaved. A hidden editor keeps it until it is shown.
- **Book Mind edits:** the inline rewrite, compose and ghost text each go in as one transaction with its own undo step. The target is a tracked range (`plugins/marks.ts`), taken when the request is made and mapped through any edits since. The green highlight is a decoration that fades after 2.2 seconds.
- **Paragraph focus and typewriter mode:** `plugins/focusEffects.ts`, switched by `useParagraphFocus` and `useTypewriterMode` through the registry. The focused block gets `data-para-focused` as a node decoration.
- **Find and replace:** the query lives in the registry and every editor highlights matches with decorations. Replacing in an open chapter is one transaction; other chapters are replaced through the same document search on their HTML.
- **Ghost text anchor:** `plugins/ghost.ts`, a widget at the caret that follows edits. Tab inserts at it.

## Server states

- **Pro access:** `lib/billing/proStatus.ts` (`isProUser`) is the one place that decides it. Active and trialing Pro subscriptions, lifetime and grandfathered users count.
- **The free Book Mind question:** `lib/ai/allowances.ts` claims it in one database update and refunds only that claim if the answer fails before any text arrives. The rules are in `lib/ai/allowanceRules.ts`.
