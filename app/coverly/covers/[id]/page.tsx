import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCoverDetail, type CoverDetailData } from "../../browse/actions";
import { CoverActions } from "./cover-actions";
import { BackLink } from "../../back-link";

export const dynamic = "force-dynamic";

const cap = (s: string) =>
  s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const TAGS: [keyof CoverDetailData, string][] = [
  ["sub_genre", "Sub-genre"],
  ["art_style", "Art style"],
  ["typography", "Typography"],
  ["people", "People"],
  ["layout", "Layout"],
];

export default async function CoverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cover = await fetchCoverDetail(id);
  if (!cover) notFound();

  const tone = cover.palette
    ? cover.palette.is_dark
      ? "dark"
      : "light"
    : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <BackLink />

      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        <div className="w-full max-w-xs shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.image_url}
            alt={`Cover of ${cover.title}${cover.author ? ` by ${cover.author}` : ""}`}
            className="w-full rounded-2xl border bg-muted shadow-sm"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            {cover.title}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {cover.author ?? "Unknown author"}
            {cover.year ? ` · ${cover.year}` : ""}
            {cover.imprint ? ` · ${cover.imprint}` : ""}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Designer: {cover.designer_credit ?? "unknown"}
            {cover.isbn13 ? ` · ISBN ${cover.isbn13}` : ""}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {TAGS.map(([key, label]) =>
              cover[key] ? (
                <Link
                  key={key}
                  href={`/coverly/browse?${key}=${encodeURIComponent(String(cover[key]))}`}
                  className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted/60"
                >
                  <span className="text-muted-foreground">{label} </span>
                  {cap(String(cover[key]))}
                </Link>
              ) : null,
            )}
            {tone && (
              <Link
                href={`/coverly/browse?tone=${tone}`}
                className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted/60"
              >
                <span className="text-muted-foreground">Tone </span>
                {tone}
              </Link>
            )}
          </div>

          {cover.palette?.colors && cover.palette.colors.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs text-muted-foreground">Palette</p>
              <div className="flex flex-wrap gap-2">
                {cover.palette.colors.map((hex) => (
                  <div key={hex} className="text-center">
                    <span
                      title={hex}
                      className="block h-9 w-9 rounded-md border border-black/10"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                      {hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CoverActions coverId={cover.id} />
        </div>
      </div>

      {cover.similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Similar covers</h2>
          <div className="grid grid-cols-3 items-start gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
            {cover.similar.map((s) => (
              <Link
                key={s.id}
                href={`/coverly/covers/${s.id}`}
                className="group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image_url}
                  alt={s.title}
                  loading="lazy"
                  className="w-full rounded-lg shadow-sm transition-transform group-hover:-translate-y-0.5"
                />
                <p className="mt-1.5 line-clamp-2 text-xs font-medium">
                  {s.title}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {s.author ?? ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
