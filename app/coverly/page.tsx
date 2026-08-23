import Link from "next/link";
import { CoverlyWaitlistForm } from "./CoverlyWaitlistForm";
import { CoverMarquee } from "./CoverMarquee";
import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "./logomark";

const DARK = "#0a0a0c";

export default function CoverlyPage() {
  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0a0a0a]">
      <section className="relative flex w-full flex-col justify-center px-6 py-16 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-14"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Neil McArdle</span>
          </Link>

          <div className="flex items-center gap-2.5 mb-7">
            <svg
              viewBox={LOGOMARK_VIEWBOX}
              width="26"
              height="26"
              fill="#fbf9f3"
              aria-hidden="true"
            >
              <path d={LOGOMARK_PATH} />
            </svg>
            <span
              className="text-white"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "1.0625rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              coverly
            </span>
          </div>

          <h1
            className="text-white mb-7"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2.75rem, 7vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            Comp research for cover designers
          </h1>

          <p
            className="text-white mb-9 max-w-md"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.125rem, 2.4vw, 1.4rem)",
              fontWeight: 400,
              lineHeight: 1.45,
              fontStyle: "italic",
            }}
          >
            Search thousands of book covers by how they look — not by genre.
          </p>

          <div
            className="space-y-4 text-white/70 max-w-md mb-11"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.9375rem",
              lineHeight: 1.7,
            }}
          >
            <p>
              Every cover is tagged by the things designers actually brief on:
              art style, typography, layout, whether a face is showing, and the
              palette pulled straight out of the artwork.
            </p>
            <p>
              Build a board, then export it as a comp deck you can put in front
              of a publisher. Free — sign up with an email and it&apos;s yours.
            </p>
          </div>

          <div
            className="text-white/40 mb-4"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.6875rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            + Get early access
          </div>
          <CoverlyWaitlistForm />
        </div>
      </section>

      <section
        className="relative hidden overflow-hidden lg:block lg:w-1/2"
        style={{ backgroundColor: DARK }}
      >
        <CoverMarquee />

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
