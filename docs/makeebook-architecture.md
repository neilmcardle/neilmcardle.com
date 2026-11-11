# makeEbook architecture

A one-page map of the editor at `/make-ebook` for anyone changing it. Read `app/make-ebook/STATE.md` for the rules each flow keeps, `docs/makeebook-data.md` for storage and sync, and `docs/makeebook-editor.md` for the chapter editor.

## The route

`app/make-ebook/page.tsx` mounts three providers and picks a screen:

```
Suspense
  SessionProvider   auth, subscription, cloud sync, app phase
    BookProvider    the open book, the library, switching book
      EditorProvider  overlays, panels, modes, Book Mind, history, saving
        MakeEbookRoute  landing (showsLanding(phase) and no chapters) or EditorShell
```

Each provider runs the hooks that used to live in `page.tsx`, so the editor behaves as it did before phase 3.

## Reading and changing state

Every provider publishes its state to a small store and its actions as one stable object (`providers/store.ts`).

| Read                 | Change               | Holds                                                                                                                                                                       |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useSession(s => …)` | none (read only)     | `user`, `tierKnown`, `hasCloudSync`, `hasBookMind`, `isPro`, `phase`, `cloudSync`                                                                                           |
| `useBook(s => …)`    | `useBookActions()`   | metadata, tags, cover, chapters, selected chapter, drag state, endnotes, `currentBookId`, library, import, `loadToken`                                                      |
| `useEditor(s => …)`  | `useEditorActions()` | overlays, sidebar view, surface mode, Book Mind window, flow mode, selection, inline edit and compose, stats, versions, exports, `save`, `focus`, `findReplace`, onboarding |

- A component re-renders only when what its selector returns changes. When a selector builds an object, pass `shallowEqual` as the second argument.
- Actions never change identity, and always call the latest version of the handler.
- Providers read each other through `useSessionInternals()` and `useBookInternals()`, which re-render with every change, as the old page did. Components never use these.
- When `BookProvider` needs something from `EditorProvider` (a confirm dialog, closing panels, `markDirty`, `flushSave`, reloading the open book), it calls its `BookUi` port (`providers/types.ts`). `EditorProvider` connects the port in a layout effect. Cloud sync reaches the library and the open book the same way, through `SyncPort` (`hooks/useCloudSync.ts`).
- No function ref is assigned during render. Refs that hold the latest handler are set in layout effects.

## Providers and their hooks

| File                                   | What it does                                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `providers/SessionProvider.tsx`        | `useAuth`, `useSubscription`, checkout return, first-open tracking, app phase, `useCloudSync`                                                          |
| `providers/BookProvider.tsx`           | `useChapters`, `useBookState`, `useTags`, `useCover`, `useEndnotes`, `useBookSwitch`, `useLibrary`, `useDocumentImport`                                |
| `providers/book/useChapterActions.ts`  | Delete with confirm, lock, complete, bulk complete and delete                                                                                          |
| `providers/book/useBookLifecycle.ts`   | Library read on sign-in, `?load=`, opening the latest book, blank book, start writing, home                                                            |
| `providers/book/useBackup.ts`          | Download and restore a backup                                                                                                                          |
| `providers/EditorProvider.tsx`         | `useOverlays`, onboarding, stats, goals, version and export history, `useBookMind`, focus mode, find and replace, shortcuts, new book, restore version |
| `providers/editor/useEditorUi.ts`      | Sidebar view and sections, surface mode, Book Mind window, flow mode, phone keyboard                                                                   |
| `providers/editor/useWritingAssist.ts` | Selection, the ⌘K hint, inline rewrite, compose, ghost text                                                                                            |
| `providers/editor/useSaveStatus.ts`    | `useAutoSave`, `useSaveBook`, the dirty tracker, flush, reload after a remote change, first upload                                                     |

## Layouts

`layout/EditorShell.tsx` keeps the old DOM order, because overlays with the same z-index stack by it:

- `NewBookConfirmDialog`, `ImportDialog` (`components/modals/`), `HistoryModal`, `MobileBookMindSheet`
- `MobileDrawer`: the phone menu with the library, book details and chapters
- `DesktopNav` (`EditorLeftNav`, hidden by focus mode's hide chrome), then `main` with `MobileTopBar`, `MobileSurface` and `DesktopSurface`
- `MobileChrome`: chapters sheet, selection bar, tab bar
- `EditorOverlays`: the desktop Book Mind window, inline edit, compose, ghost text, the ⌘K hint, EPUB reader, confirm dialog, tour, focus panel, ambient sound, find and replace, pre-flight (`components/modals/PreflightHost.tsx`), upgrade

Desktop and phone parts are both mounted and hidden with `lg:` classes, as before.

The sidebar (`EditorLeftNav`, `CollapsibleSidebar`, `sidebar/LibraryPanel`, `BookDetailsPanel`, `ChaptersPanel`, `SyncConflictBanner`) reads from context. Their only props are local: `compact`, `active`, `idPrefix`, and `onNavigate`, which the phone drawer uses to close itself after opening a book or chapter.

## State machines

Pure reducers in `app/make-ebook/state/`, each tested next to it. The full list is in `STATE.md`. Added in phase 3:

- `appPhase.ts`: `booting`, `marketing`, `choosing`, `loading`, `ready`
- `autosave.ts`: the autosave state and `autosaveDelay`
- `syncStatus.ts`: the sync gate (`requestSync`, `finishSync`) and the conflict status

Loading a book is a state, not a ref: `loadToken` in `BookProvider` changes in the same batch as the loaded book, and the dirty tracker ignores that one change.

## Storage and the editor

- `storage/`: `keys.ts`, `bookStore.ts` (IndexedDB with a cache), `cloudStore.ts` (pushes and pulls), `backup.ts`. See `docs/makeebook-data.md`.
- `editor/`: ProseMirror. `registry.ts` finds mounted editors (`activeEditor()`, `editorForChapter(id)`, `flushEditors()`). See `docs/makeebook-editor.md`.
- Saving: `hooks/useSaveBook.ts` runs one save at a time (`state/singleFlight.ts`, `state/save.ts`). Cloud pushes are in `hooks/save/useCloudPush.ts` and exports in `hooks/save/useExports.ts`.

## Adding something

- New book data: add it to `BookProvider`'s `book` object, and its setter to `actions`.
- New panel, mode or dialog: state in `EditorProvider` or one of its hooks, with an overlay layer in `state/overlays.ts` if it covers the page.
- A new flow with more than one flag: write a reducer in `state/` with a test, and add it to `STATE.md`.
