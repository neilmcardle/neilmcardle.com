import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createCoverlyPublicClient } from "@/lib/coverly/supabase/public";
import { RIGHTS_NOTICE } from "@/lib/coverly/attribution";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared board — Coverly",
  robots: { index: false, follow: false },
};

type SharedCover = {
  id: string;
  title: string;
  author: string | null;
  imprint: string | null;
  year: number | null;
  image_url: string;
};

export default async function SharedBoardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createCoverlyPublicClient();
  if (!supabase) notFound();

  const { data, error } = await supabase.rpc("get_shared_board", {
    p_token: token,
  });
  if (error) {
    console.error("coverly shared board lookup failed", error);
    notFound();
  }

  const board = (Array.isArray(data) ? data[0] : data) as
    { name: string; cover_ids: string[] } | null | undefined;
  if (!board?.cover_ids?.length) notFound();

  const { data: rows } = await supabase
    .from("covers")
    .select("id, title, author, imprint, year, image_url")
    .in("id", board.cover_ids)
    .eq("delisted", false);

  const byId = new Map(
    ((rows ?? []) as SharedCover[]).map((row) => [row.id, row]),
  );
  const covers = board.cover_ids
    .map((id) => byId.get(id))
    .filter((cover): cover is SharedCover => cover !== undefined);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-2xs uppercase tracking-widest text-muted-foreground">
          Shared board
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {board.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {covers.length} cover{covers.length === 1 ? "" : "s"}
        </p>
      </header>

      {covers.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            The covers on this board are no longer available.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {covers.map((cover) => (
            <figure
              key={cover.id}
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              <div className="aspect-[2/3] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.image_url}
                  alt={cover.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="p-2">
                <p className="line-clamp-2 text-xs font-medium">
                  {cover.title}
                </p>
                <p className="line-clamp-1 text-2xs text-muted-foreground">
                  {[cover.author, cover.imprint, cover.year]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <footer className="mt-10 border-t pt-6 text-xs text-muted-foreground">
        <p>{RIGHTS_NOTICE}</p>
        <p className="mt-2">
          Built with{" "}
          <Link
            href="/coverly/browse"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Coverly
          </Link>
          , a comp research tool for book cover designers.
        </p>
      </footer>
    </div>
  );
}
