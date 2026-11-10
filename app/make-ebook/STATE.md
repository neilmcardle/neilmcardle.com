# makeEbook state map

The editor's important flows are explicit state machines. Each one is a pure reducer in `state/`, tested in a file next to it, and wrapped by a hook that still returns the older flag names, so components don't change when a flow does.

Read this before adding a flag. If a new flag only makes sense alongside another one, extend the reducer instead.

## Explicit flows

| Flow                             | Reducer                    | Hook                                  | States                                                                                                                                                                     |
| -------------------------------- | -------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Book Mind request              | `state/bookMindRequest.ts` | `useBookMind`                         | `idle` (may carry an error and a code), `reading` (may carry the chapters being read), `streaming`                                                                         |
| Inline rewrite takes and compose | `state/takes.ts`           | `InlineEditPopover`, `ComposePalette` | `idle`, `running` (with a run number), `done` (error only when every take failed)                                                                                          |
| Manuscript import                | `state/documentImport.ts`  | `useDocumentImport`                   | `closed`, `open`, `importing`, `failed` (always shown in the dialog)                                                                                                       |
| Panels and dialogs in the editor | `state/overlays.ts`        | `useOverlays`                         | three layers, one item each: `sheet` (mobile sidebar, mobile Book Mind, chapters), `panel` (new book, history, pre-flight), `popup` (confirm dialog, upgrade, EPUB reader) |

Rules these encode:

- **Book Mind:** a request is never loading and streaming at once. A new request clears the last error. The free question is spent when the server answers `freeQuestionSpent: true`, which arrives as `errorCode === "free_question_spent"`. Never match error wording.
- **Takes:** every run gets a number. Takes or errors from an older run are ignored, so a slow answer can't land in a newer run.
- **Import:** a failed import always opens the dialog with the error, even when it started from the hidden file picker. The dialog can't close halfway through an import.
- **Overlays:** a popup can sit over a panel, and a panel over a sheet. Opening a second item in the same layer replaces the first. Closing an item only works if it's the one that's open. `closeTop` closes the highest layer first.

## Flows still held as separate flags

These are small enough that flags are clearer. Don't add to them without moving them into a reducer.

- **App phase**, in `page.tsx`: `showMarketingPage`, `initialized`, `libraryLoading`.
- **Autosave**, in `useAutoSave`: one state object plus a retry count.
- **Cloud sync**, in `useCloudSync`: `initialSyncDone`, conflicts, merged map.
- **Onboarding tour**, in `useOnboarding`: active, step, complete.
- **Checkout**, in `UpgradeModal` and `ManageBillingButton`: loading, plan, error, and the `?checkout=success` query.
- **Short flashes**, in `page.tsx`: `saveFeedback`, `bookJustLoaded`, `chapterJustAdded`.
- **Undo delete**, in `page.tsx`: `pendingDeleteIndex`, which clears itself after five seconds.
- **Chapter drag and drop**, in `useChapters`.
- **Preview paging**, in `PreviewSurface`; the EPUB reader's own state, in `EPUBReaderModal`; ghost text, in `GhostTextOverlay`; pre-flight drafting, in `PreflightExportDialog`.

## Server states

- **Pro access:** `lib/billing/proStatus.ts` (`isProUser`) is the one place that decides it. Active and trialing Pro subscriptions, lifetime and grandfathered users count.
- **The free Book Mind question:** `lib/ai/questionGrant.ts` claims it in one database update and refunds it if the answer fails before any text arrives.
