import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  HomepageProjectPreview,
  type ProjectKey,
} from "@/components/HomepageProjectPreview";
import BorderGlow from "@/components/BorderGlow";
import HeroCta from "@/components/HeroCta";

const SUBSCRIBE_URL = "https://buy.stripe.com/9B600l7XfblGdOxgk8fIs01";

const CLIENTS = [
  "Avis Budget Group",
  "Banner of Truth",
  "Dan Roberts Group",
  "Gatewick House & Gardens",
];

export const metadata: Metadata = {
  title: "Good to meet you — Neil McArdle",
  description:
    "I design and build digital products. One person, start to finish.",
  robots: { index: false, follow: false },
};

export default function Hello() {
  return (
    <div className="min-h-screen bg-black relative isolate overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[760px]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(68% 46% at 50% 24%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 48%, transparent 74%)",
        }}
      />

      <div className="home-prose relative z-10 max-w-4xl mx-auto px-6 lg:px-16 pt-12 sm:pt-20 pb-20">
        <header className="flex flex-col items-center text-center">
          <svg
            width="34"
            height="34"
            viewBox="0 0 78 78"
            fill="none"
            role="img"
            aria-label="Neil McArdle"
            className="mb-10 text-cream"
          >
            <path
              d="M0,0v76.8c0,.5.4,1,1,1h37c.5,0,1-.4,1-1v-37.8L0,0Z"
              fill="currentColor"
            />
            <path
              d="M78,78V1.2c0-.5-.4-1-1-1h-37c-.5,0-1,.4-1,1v37.8l39,39Z"
              fill="currentColor"
            />
          </svg>

          <Image
            src="/me.png"
            alt="Neil McArdle"
            width={120}
            height={120}
            priority
            className="mb-8 w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover grayscale"
          />

          <p
            className="mb-5 text-tan"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.8125rem",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            Good to meet you
          </p>

          <h1
            className="text-cream mb-6 max-w-2xl"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(2rem, 6vw, 3.25rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            I design and build digital products. One person, start to finish.
          </h1>

          <p
            className="text-cream/70 max-w-xl"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "1.0625rem",
              lineHeight: 1.6,
            }}
          >
            The Figma file and the shipped, working product come from the same
            hands, so nothing gets lost in between.
          </p>

          <div className="mt-10 flex flex-col items-center gap-5">
            <HeroCta href={SUBSCRIBE_URL} alwaysElectric />
          </div>
        </header>

        <section className="mt-24 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <ProofTile
            tileKey="makeebook"
            category="Product · AI · Solo"
            name="makeEbook"
            href="https://makeebook.ink"
            linkLabel="makeebook.ink"
            external
          />
          <ProofTile
            tileKey="doodlewire"
            category="Product · iOS · Solo"
            name="DoodleWire"
            href="https://apps.apple.com/us/app/doodlewire/id6771274835"
            linkLabel="App Store"
            external
          />
        </section>

        <section className="mt-20 text-center">
          <p
            className="text-tan/70 mb-4"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.625rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Selected clients
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-cream/55">
            {CLIENTS.map((c) => (
              <span
                key={c}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </section>

        <footer className="mt-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {[
            {
              label: "neilmcardle.com",
              href: "https://neilmcardle.com",
              external: true,
            },
            { label: "Privacy", href: "/privacy" },
          ].map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                className="text-tan hover:text-cream transition-colors"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                href={l.href}
                className="text-tan hover:text-cream transition-colors"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                {l.label}
              </Link>
            ),
          )}
        </footer>
      </div>
    </div>
  );
}

function ProofTile({
  tileKey,
  category,
  name,
  href,
  linkLabel,
  external,
}: {
  tileKey: ProjectKey;
  category: string;
  name: string;
  href: string;
  linkLabel: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group block"
      aria-label={name}
    >
      <BorderGlow
        className="block w-full"
        backgroundColor="#000000"
        borderRadius={16}
        glowColor="40 62 64"
        glowRadius={34}
        glowIntensity={1}
        edgeSensitivity={32}
        coneSpread={22}
        colors={["#f0d091", "#d8b46a", "#b8923f"]}
      >
        <div className="relative aspect-[4/3] flex items-center justify-center">
          <div className="relative w-[44%] max-w-[200px] drop-shadow-[0_26px_55px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:scale-[1.05]">
            <HomepageProjectPreview k={tileKey} />
          </div>
        </div>
      </BorderGlow>
      <div className="mt-5">
        <div
          className="text-tan mb-1.5"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.6875rem",
            letterSpacing: "0.13em",
            textTransform: "uppercase",
          }}
        >
          {category}
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <h2
            className="text-cream"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "1.5rem",
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </h2>
          <span
            className="text-gold group-hover:text-gold-bright transition-colors"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.6875rem",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            {linkLabel}
          </span>
        </div>
      </div>
    </a>
  );
}
