# Coverly — backlog

Known issues and deferred work for the Coverly build on neilmcardle.com.
Newest first. Each item records the _why_ so it can be picked up cold.

---

## Open

### 1. "Find this book" buttons link to 404s

**Reported:** 2026-08-25 · **Status:** buttons removed 2026-08-25, link still broken

The buttons are pulled from the cover detail page and the browse expanded
panel for now — a dead link is worse than no link. `lib/coverly/buy-link.ts`
is left intact and unused, ready to wire back up once the URL is fixed.

> Note: AGENTS.md states every cover must carry an outbound buy link, so the
> app is knowingly out of step with that rule until this is resolved.

Every cover carries an outbound buy link (AGENTS.md treats this as a hard
rule alongside attribution), so a dead link breaks a commitment, not just a
button.

What's established:

- `NEXT_PUBLIC_BOOKSHOP_AFFILIATE_ID` is **not set** in `.env.local`, so
  `lib/coverly/buy-link.ts` takes its fallback branch and emits
  `https://bookshop.org/uk/search?keywords=<isbn13>`.
- Confirmed live on a detail page: `.../uk/search?keywords=9781464292019`.

Two candidate causes, not yet separated:

1. **Wrong URL shape.** Bookshop.org's UK storefront is its own domain,
   `uk.bookshop.org`, not the `bookshop.org/uk/...` path the fallback builds.
2. **ISBNs genuinely unlisted.** Much of the seeded catalogue has 2027
   publication years, so Bookshop may have no record. That would normally be
   an empty result rather than a 404 — but it would still be a dead end.

Could not confirm by curl: bookshop.org returns 403 to non-browser agents for
all three URL shapes tried. Needs a real browser to diagnose.

Fix direction: correct the fallback URL, then decide what to do when a book
genuinely isn't listed — either suppress the button or fall back to a search
that reliably resolves. Setting the affiliate ID changes the URL shape
entirely (`/a/<id>/<isbn>`), so verify both branches, not just one.

---

## Deferred (flagged during the Phase 1–2 build)

### 2. `board_exported` instrumentation is not wired

AGENTS.md names this the key success metric and says don't remove it. The
standalone app's `events` insert needs a `user_id`, and the site build has no
auth yet. Wire it when auth lands — don't ship PDF export believing this is
being measured.

### 3. Tag pills render "People None"

`none` is a real value in the `PEOPLE` enum (covers with no people), so the
pill is a legitimate filter — it just reads badly. `browse-filters.tsx` and
`covers/[id]/page.tsx` both label it through the same `cap()` helper, so a
fix has to touch both or they desync. Purely cosmetic.

### 4. `data/coverly-dimensions.json` was never ported

`lib/coverly/book-size.ts` reads it to size covers in bookshelf view. The file
doesn't exist on the site, so `withHeights()` runs entirely on its heuristic
fallback. Harmless — heights are approximate by design — but the real data is
sitting in the standalone repo.
