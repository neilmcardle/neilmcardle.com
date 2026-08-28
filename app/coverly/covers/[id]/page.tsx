import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchCoverDetail,
  fetchSimilarCovers,
  type CoverDetailData,
} from "../../browse/actions";
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
  const [cover, similar] = await Promise.all([
    fetchCoverDetail(id),
    fetchSimilarCovers(id),
  ]);
  if (!cover) notFound();

  const tone = cover.palette
    ? cover.palette.is_dark
      ? "dark"
      : "light"
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <BackLink />

      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        <div className="w-full max-w-xs shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-cover-hero=""
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

          <dl className="mt-5 grid max-w-lg grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            {TAGS.map(([key, label]) =>
              cover[key] ? (
                <div key={key}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5">
                    <Link
                      href={`/coverly/browse?${key}=${encodeURIComponent(String(cover[key]))}`}
                      className="text-sm font-medium underline-offset-2 hover:underline"
                    >
                      {cap(String(cover[key]))}
                    </Link>
                  </dd>
                </div>
              ) : null,
            )}
            {tone && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Tone
                </dt>
                <dd className="mt-0.5">
                  <Link
                    href={`/coverly/browse?tone=${tone}`}
                    className="text-sm font-medium underline-offset-2 hover:underline"
                  >
                    {cap(tone)}
                  </Link>
                </dd>
              </div>
            )}
          </dl>

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

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Similar covers</h2>
          <div className="grid grid-cols-3 items-start gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
            {similar.map((s) => (
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
    </div>
  );
}
