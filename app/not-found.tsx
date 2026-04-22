import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="px-8 sm:px-16 lg:px-24 pt-8 pb-0 max-w-[1100px] mx-auto w-full">
        <Link href="/" aria-label="Neil McArdle — home">
          <Image
            src="/dark-neil-mcardle-logomark.svg"
            alt="Neil McArdle"
            width={26}
            height={26}
            className="opacity-50 hover:opacity-100 transition-opacity duration-300"
            style={{ color: "transparent" }}
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center px-8 sm:px-16 lg:px-24 max-w-[1100px] mx-auto w-full pb-32">
        <section className="max-w-[640px]">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45 mb-6"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            404 · Page not found
          </p>

          <h1
            className="text-[48px] sm:text-[64px] lg:text-[76px] text-white leading-[0.95] mb-8"
            style={{
              fontFamily: "var(--font-playfair)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
            }}
          >
            Not all those<br />who wander are lost.
          </h1>

          <p
            className="text-sm text-white/45 mb-12 tracking-wide"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            J.R.R. Tolkien
          </p>

          <div className="w-full h-px bg-white/[0.08] mb-10" />

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Back to the homepage
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  );
}
