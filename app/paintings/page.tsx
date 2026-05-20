import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PAINTINGS, type Painting } from "./paintings";

export const metadata: Metadata = {
  title: "Paintings · Neil McArdle",
  description:
    "Oil paintings by Neil McArdle. Painting in oils since 2006, before the pixel work. Selected pieces, including recent sales to private collectors.",
  alternates: { canonical: "https://neilmcardle.com/paintings" },
  openGraph: {
    title: "Paintings · Neil McArdle",
    description:
      "Oil paintings by Neil McArdle. Painting in oils since 2006, before the pixel work.",
    url: "https://neilmcardle.com/paintings",
    type: "website",
    locale: "en_GB",
  },
};

export default function ArtPage() {
  return (
    <div className="min-h-screen bg-black relative isolate overflow-hidden">
      <div className="max-w-6xl mx-auto pl-6 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pt-12 sm:pt-24 lg:pt-12 pb-20">
        {/* Eyebrow: logomark + hairline + back link */}
        <header className="mb-12 sm:mb-20">
          <div className="mb-5 sm:mb-8 flex items-center gap-4">
            <Link
              href="/"
              className="text-[#8a7f70] hover:text-[#fbf9f3] transition-colors"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              ← Back
            </Link>
            <div className="flex-1 h-[1px] bg-[#8a7f70]/50" />
            <Link href="/" aria-label="Neil McArdle — home">
              <Image
                src="/dark-neil-mcardle-logomark.svg"
                alt="Neil McArdle"
                width={26}
                height={26}
                style={{ color: "transparent" }}
              />
            </Link>
          </div>

          {/* Hero */}
          <div className="max-w-3xl">
            <div
              className="text-[#8a7f70] mb-6"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              Paintings · Oil on canvas · Since 2006
            </div>
            <h1
              style={{
                fontFamily: "var(--font-eb-garamond)",
                fontSize: "clamp(2.25rem, 9vw, 4.5rem)",
                fontWeight: 800,
                letterSpacing: "0.2em",
                paddingRight: "0.24em",
                lineHeight: "0.95",
                color: "#fbf9f3",
                marginBottom: "1.75rem",
                textTransform: "uppercase",
              }}
            >
              Painting
              <br />
              then pixels
            </h1>
            <p
              className="text-[#fbf9f3]/70 max-w-2xl"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "1rem",
                lineHeight: 1.7,
              }}
            >
              I have been painting since graduating in Fine Art in 2006. Painting came first,
              then graphic design in 2013, then product design in 2021. My most recent paintings
              sold to a collector in London. See them below.
            </p>
          </div>
        </header>

        {/* Featured paintings: alternating layout for visual rhythm */}
        <section className="mb-20">
          <div className="flex items-center gap-8 mb-12">
            <div
              className="text-[#8a7f70]"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              + Selected paintings
            </div>
            <div className="flex-1 h-[2px] bg-[#8a7f70]/50" />
          </div>

          <div className="flex flex-col gap-20 sm:gap-28">
            {PAINTINGS.map((painting, i) => (
              <FeaturedPainting key={painting.slug} painting={painting} reverse={i % 2 === 1} />
            ))}
          </div>
        </section>

        <footer className="pt-12 border-t-2 border-[#8a7f70]/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p
            className="text-[#8a7f70]"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}
          >
            © 2026 Neil McArdle
          </p>
          <a
            href="mailto:neil@neilmcardle.com"
            className="text-[#fbf9f3]/70 hover:text-[#fbf9f3] transition-colors"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}
          >
            neil@neilmcardle.com
          </a>
        </footer>
      </div>
    </div>
  );
}

function FeaturedPainting({ painting, reverse }: { painting: Painting; reverse: boolean }) {
  const aspect = painting.aspect ?? "4/5";
  const yearLine = painting.acquiredYear
    ? `Painted ${painting.year} · Acquired ${painting.acquiredYear}`
    : `Painted ${painting.year}`;

  return (
    <article
      className={`grid grid-cols-1 gap-8 lg:gap-16 items-start ${
        reverse
          ? "lg:grid-cols-[1fr_minmax(0,360px)]"
          : "lg:grid-cols-[minmax(0,360px)_1fr]"
      }`}
    >
      <div className={reverse ? "lg:order-2" : ""}>
        <figure
          className="relative border-2 border-[#8a7f70]/50 overflow-hidden"
          style={{ aspectRatio: aspect }}
        >
          <Image
            src={painting.image}
            alt={painting.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 360px"
          />
        </figure>
        {/* Gallery-style red dot for sold pieces, sat left under the image. */}
        {painting.status === "sold" && (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden />
            <span
              className="text-[#fbf9f3]/80"
              style={{
                fontSize: "0.6875rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              Sold
            </span>
          </div>
        )}
      </div>

      <div>
        <div
          className="text-[#8a7f70] mb-4"
          style={{
            fontSize: "0.6875rem",
            fontFamily: "var(--font-jetbrains-mono)",
            letterSpacing: "0.13em",
            textTransform: "uppercase",
          }}
        >
          {yearLine}
        </div>

        <h2
          className="text-[#fbf9f3] mb-5"
          style={{
            fontFamily: "var(--font-eb-garamond)",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
        >
          {painting.title}
        </h2>

        <dl className="mb-6 space-y-1.5">
          <MetaRow label="Medium" value={painting.medium} />
          <MetaRow label="Size" value={painting.dimensions} />
          {painting.collector && <MetaRow label="Acquired by" value={painting.collector} />}
        </dl>

        <div className="space-y-4">
          {painting.description.map((para, i) => {
            if (para.startsWith("> ")) {
              return (
                <blockquote
                  key={i}
                  className="border-l-4 border-[#8a7f70] pl-5 py-1 text-[#fbf9f3]/90 italic"
                  style={{
                    fontFamily: "var(--font-eb-garamond)",
                    fontSize: "1.0625rem",
                    lineHeight: 1.7,
                  }}
                >
                  {para.slice(2)}
                </blockquote>
              );
            }
            return (
              <p
                key={i}
                className="text-[#fbf9f3]/75"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.7,
                }}
              >
                {para}
              </p>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt
        className="text-[#8a7f70] w-[7.5rem] flex-shrink-0 whitespace-nowrap"
        style={{
          fontSize: "0.6875rem",
          fontFamily: "var(--font-jetbrains-mono)",
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          paddingTop: "0.15rem",
        }}
      >
        {label}
      </dt>
      <dd
        className="text-[#fbf9f3]/85"
        style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}
      >
        {value}
      </dd>
    </div>
  );
}
