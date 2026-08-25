import { createCoverlyPublicClient } from "@/lib/coverly/supabase/public";
import { withHeights } from "@/lib/coverly/book-size";
import { fetchCoverPage, filtersFromSearchParams } from "@/lib/coverly/queries";
import { Browse } from "./browse";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = filtersFromSearchParams(sp);
  const supabase = createCoverlyPublicClient();

  if (!supabase) {
    return (
      <main className="mx-auto max-w-xl p-10 text-sm text-muted-foreground">
        <h1 className="mb-3 text-lg font-semibold text-foreground">
          Almost there
        </h1>
        <p>
          Supabase is not configured yet. Add the Coverly Supabase keys to
          .env.local and populate covers.
        </p>
      </main>
    );
  }

  let covers: Awaited<ReturnType<typeof fetchCoverPage>>["covers"];
  let total: number;
  try {
    ({ covers, total } = await fetchCoverPage(supabase, filters, 0));
    covers = withHeights(covers);
  } catch {
    return (
      <main className="mx-auto max-w-xl p-10 text-sm text-muted-foreground">
        <h1 className="mb-3 text-lg font-semibold text-foreground">
          Library temporarily unavailable
        </h1>
        <p>
          The cover database can't be reached right now. Check that your
          Supabase project is running.
        </p>
      </main>
    );
  }

  return (
    <main className="w-full px-4 py-5 sm:px-6">
      <Browse initialCovers={covers} total={total} filters={filters} />
    </main>
  );
}
