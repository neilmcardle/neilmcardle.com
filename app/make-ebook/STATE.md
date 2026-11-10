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
| Switching book                   | `state/bookSwitch.ts`                    | `useBookSwitch`                       | `token` and `pending`: only the latest switch applies                                                                                                                      |
| Export                           | `state/exportFlow.ts`                    | `useSaveBook`                         | `idle`, `exporting`, `failed`                                                                                                                                              |
| Book Mind chat sessions          | `state/chatSessions.ts`                  | `useBookMind`                         | the stored list; every write starts from it                                                                                                                                |
| Book Mind gate                   | `state/bookMindGate.ts`                  | `BookMindChat`                        | `send`, `upgrade`, `wait`                                                                                                                                                  |
| Checkout                         | `state/checkout.ts`                      | `UpgradeModal`                        | `idle`, `redirecting`, `failed` (each with a plan)                                                                                                                         |
| Subscription tier                | `lib/hooks/subscriptionState.ts`         | `useSubscription`                     | `loading`, `known`, `failed`, plus `awaitingUpgrade` after checkout                                                                                                        |

Rules these encode:

- **Book Mind:** a request is never loading and streaming at once. A new request clears the last error. The free question is spent when the server answers `freeQuestionSpent: true`, which arrives as `errorCode === "free_question_spent"`. Never match error wording.
- **Takes:** every run gets a number. Takes or errors from an older run are ignored, so a slow answer can't land in a newer run.
- **Import:** a failed import always opens the dialog with the error, even when it started from the hidden file picker. The dialog can't close halfway through an import.
- **Overlays:** a popup can sit over a panel, and a panel over a sheet. Opening a second item in the same layer replaces the first. Closing an item only works if it's the one that's open. `closeTop` closes the highest layer first.
- **Saves:** one save runs at a time. A save asked for while one runs is queued and merged with any other queued save, then runs with the latest book. Its callers get the follow-up's result, so "busy" is never a failure and autosave never backs off for it. Autosave reads the save function from a ref, so it always saves the current endnotes and cloud tier.
- **Snapshots:** Cmd+S, overwrite and save as new version only snapshot a version when the result is `saved`.
- **Cloud pushes:** one push per book at a time, with one queued follow-up. A push that renames a book to its cloud id passes the new id to its follow-up.
- **Switching book:** library loads, imports, new book and going home all go through `useBookSwitch`. A switch flushes the open book, then checks it is still the latest switch, prepares (reads the book, or parses the file), checks again, bumps `editorSessionRef` and applies. An import clears `currentBookId`, so it saves as a new book and never under the old book's id. A save that finishes after a switch can't set the old id back.
- **Export:** a second export while one runs is ignored. A failure opens an alert. Export only updates chapter ids when one is missing and never calls `markClean`, so edits made during an export stay unsaved until autosave saves them.
- **Book Mind chats:** there is one `useBookMind` in `page.tsx`, shared by the desktop window and the mobile sheet. A message without a chat picks a chat id first, and the exchange creates the stored chat when it is saved. Create, rename, delete and save all read the stored list first.
- **Book Mind gate:** sending, quick actions and retry all ask `bookMindGate`, so retry respects the trial lock. While the tier is unknown nobody is on the trial, so a Pro writer never sees trial copy while loading.
- **Checkout:** Back from Stripe (`pageshow` with `persisted`) ends the spinner. Opening the modal again clears the last error and goes back to monthly.
- **Subscription tier:** loading and failed fetches are unknown (`tierKnown: false`), not free. Every fetch has a request number and an AbortController, so a slow answer for a previous user is dropped. `?checkout=success` calls `expectUpgrade`, which polls every two seconds, up to eight times, until the tier is Pro.

## Flows still held as separate flags

These are small enough that flags are clearer. Don't add to them without moving them into a reducer.

- **App phase**, in `page.tsx`: `showMarketingPage`, `initialized`, `libraryLoading`.
- **Autosave timing**, in `useAutoSave`: one state object plus a retry count. It only backs off when a save returns `failed`.
- **Cloud sync**, in `useCloudSync`: `initialSyncDone`, conflicts, merged map.
- **Onboarding tour**, in `useOnboarding`: active, step, complete.
- **Billing portal**, in `ManageBillingButton`: loading and error.
- **Short flashes**, in `page.tsx`: `saveFeedback`, `bookJustLoaded`, `chapterJustAdded`.
- **Undo delete**, in `page.tsx`: `pendingDeleteIndex`, which clears itself after five seconds.
- **Chapter drag and drop**, in `useChapters`.
- **Preview paging**, in `PreviewSurface`; the EPUB reader's own state, in `EPUBReaderModal`; ghost text, in `GhostTextOverlay`; pre-flight drafting, in `PreflightExportDialog`.

## Server states

- **Pro access:** `lib/billing/proStatus.ts` (`isProUser`) is the one place that decides it. Active and trialing Pro subscriptions, lifetime and grandfathered users count.
- **The free Book Mind question:** `lib/ai/grants.ts` claims it in one database update and refunds only that claim if the answer fails before any text arrives. The rules are in `lib/ai/grantRules.ts`.
