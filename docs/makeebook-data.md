# makeEbook data

How a book is shaped, where it is stored, and how it syncs. Read this before changing any of them.

## One shape: `Book`

`app/make-ebook/model/book.ts` defines the only book shape, used locally, in the cloud and by export:

```ts
type Book = {
  id: string;
  schemaVersion: 1;
  userId: string;
  title;
  author;
  blurb;
  publisher;
  pubDate;
  isbn;
  language;
  genre: string;
  tags: string[];
  coverFile: string | null;
  chapters: Chapter[];
  endnotes: Endnote[];
  endnoteReferences: EndnoteReference[];
  bookmindMemory?: BookMindMemory;
  savedAt: number;
  revision: number;
  syncedRevision: number;
};
```

- **`id`** is a UUID from the start, so a book never changes id when it first syncs.
- **`revision`** goes up by one on every local save.
- **`syncedRevision`** is the revision the cloud last confirmed. A book needs pushing when `revision > syncedRevision`.
- **Chapter `content`** is HTML in schema version 1. Phase 2 moves it to the ProseMirror document, as schema version 2 with a migration.
- **`normaliseBook(value)`** turns anything stored, including books saved before this change, into a valid `Book`. Missing fields get defaults and wrong types are dropped. It never throws.

## Where it is stored

`app/make-ebook/storage/`:

- **`keys.ts`:** every storage key, all starting `makeebook:`. Nothing else in the app builds a key by hand.
- **`bookStore.ts`:** one IndexedDB database, `makeebook`, with a `books` store keyed by `id` and indexed by `userId`.
  - Reads are synchronous, from an in-memory cache filled once by `hydrate(userId)` at start-up, so existing callers keep their synchronous API.
  - Writes update the cache straight away and persist to IndexedDB in the background, one write per book at a time. `flush()` runs on `pagehide` and before a book switch.
  - If IndexedDB is unavailable, the store falls back to one localStorage key per book.
- **First run after the change:** if the old whole-library blob (`makeebook_library_<userId>`) exists, `hydrate` imports every book from it through `normaliseBook`, writes them to IndexedDB, and only then removes the blob. Nothing written before is lost.
- Covers stay in the `makeEbookAssets` database and versions in `makeEbookVersions`, unchanged.

## How it syncs

The cloud keeps one row per book in `makeebook_books`, defined in `lib/db/schema.ts` and created by migration `0011_makeebook_books.sql`:

| column       | type              | notes                                      |
| ------------ | ----------------- | ------------------------------------------ |
| `id`         | uuid, primary key | the book's id                              |
| `user_id`    | uuid, not null    | owner, matches `auth.uid()`                |
| `data`       | jsonb, not null   | the whole `Book`                           |
| `revision`   | integer, not null | the revision this row holds                |
| `updated_at` | timestamptz       |                                            |
| `deleted_at` | timestamptz, null | set instead of deleting, so a delete syncs |

Row-level security lets a signed-in user see and change only their own rows.

- **Push** (`storage/cloudStore.ts`) is a guarded update. It writes `data` and the new `revision` only where the row still holds the revision this device last saw. A first push inserts the row.
- **Conflicts:** if the guarded update changes nothing, another device saved first, and the book is a conflict, never overwritten silently.
- **The decision** for each book (push, pull, conflict or nothing to do) is a pure function in `state/sync.ts`, with tests.
- **Pull** reads every row for the user and applies remote books whose revision is newer than the local copy's synced revision.

## Backups

The library offers "Download a backup", one JSON file with every book, and "Restore a backup". Restored books keep their ids and are merged: if a book with the same id exists, the one with the higher revision wins.

## Migrations

- Migrations are plain SQL files in `lib/db/migrations/`, run in order in the Supabase SQL editor.
- The Drizzle schema in `lib/db/schema.ts` must match them.
- `0012_drop_old_ebooks.sql` removes the old `ebooks` and `chapters` tables. Run it only after checking that the new sync works.
