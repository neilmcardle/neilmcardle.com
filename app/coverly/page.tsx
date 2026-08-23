import Link from "next/link";
import { CoverlySignup } from "./CoverlySignup";
import { CoverMarquee } from "./CoverMarquee";
import { fetchCovers } from "./covers";
import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "./logomark";

const DARK = "#0a0a0c";

export default async function CoverlyPage() {
  const { covers, count } = await fetchCovers();

  const rounded = Math.floor(count / 50) * 50;
  const countLabel =
    rounded >= 50 ? `over ${rounded.toLocaleString()}` : `${count}`;

  return (
    <main className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
      <section className="relative flex w-full flex-col justify-center px-6 py-14 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            aria-label="Neil McArdle"
            className="mb-9 inline-flex items-center gap-2"
          >
            <svg
              viewBox={LOGOMARK_VIEWBOX}
              className="h-6 w-auto text-foreground"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={LOGOMARK_PATH} />
            </svg>
            <span className="text-lg font-semibold tracking-tight">
              coverly
            </span>
          </Link>

          <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Book cover inspiration
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Featuring {countLabel} book cover designs.
          </p>

          <div className="mt-8">
            <CoverlySignup />
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Curious who made this?{" "}
            <Link
              href="/"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Neil McArdle
            </Link>
          </p>
        </div>

        <p className="absolute bottom-6 left-6 text-xs text-muted-foreground sm:left-10 lg:left-16">
          © {new Date().getFullYear()} Coverly
        </p>
      </section>

      <section
        className="relative hidden overflow-hidden lg:block lg:w-1/2"
        style={{ backgroundColor: DARK }}
      >
        <CoverMarquee covers={covers} />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background: `linear-gradient(to bottom, ${DARK}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background: `linear-gradient(to top, ${DARK}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16"
          style={{
            background: `linear-gradient(to right, ${DARK}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16"
          style={{
            background: `linear-gradient(to left, ${DARK}, transparent)`,
          }}
        />
      </section>
    </main>
  );
}
