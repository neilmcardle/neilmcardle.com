import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive · Neil McArdle",
  description:
    "Other things Neil McArdle has designed and built: tools, games for his kids, and books.",
};

type Entry = {
  title: string;
  category: string;
  description: string;
  href: string;
  external: boolean;
};

type Group = { label: string; entries: Entry[] };

const GROUPS: Group[] = [
  {
    label: "Also built",
    entries: [
      {
        title: "Vector Paint",
        category: "Tool · SVG · Drawing",
        description:
          "Vector drawing in the browser. Sketch freehand, export SVG, print crisp at any size.",
        href: "/vector-paint",
        external: false,
      },
      {
        title: "Icon Animator",
        category: "Tool · Front-end",
        description:
          "SVG icon animation presets with copy-ready CSS export. Pick, tune the timing, ship.",
        href: "/icon-animator",
        external: false,
      },
      {
        title: "Promptr",
        category: "Tool · AI · UX",
        description:
          "A prompt workshop. Rubric-based scoring turns fuzzy prompts into specific ones.",
        href: "/promptr",
        external: false,
      },
      {
        title: "Spark",
        category: "Product · Education · Solo-built",
        description:
          "A learning platform to teach designers full-stack engineering, by a designer.",
        href: "/spark",
        external: false,
      },
    ],
  },
  {
    label: "Built for my kids",
    entries: [
      {
        title: "Tessera",
        category: "Game",
        description:
          "The Triangle Game. A two-player dice game on a hexagonal triangle grid.",
        href: "/tessera",
        external: false,
      },
      {
        title: "Kids Alphabet",
        category: "Game · Education",
        description:
          "An alphabet game for toddlers. Tap a letter, swipe, finish with a quick quiz.",
        href: "/kids-alphabet/",
        external: true,
      },
      {
        title: "Touchtype",
        category: "Tool · Education · Solo-built",
        description:
          "A touch-typing tutor with two modes, one playful for kids and one focused for adults.",
        href: "/touchtype",
        external: false,
      },
    ],
  },
  {
    label: "eBooks and Audiobooks",
    entries: [
      {
        title: "Sol0",
        category: "Sci-fi Novel · Made with makeEbook",
        description:
          "He came to Mars expecting solitude. He found home. Listen on ElevenReader.",
        href: "https://elevenreader.io/audiobooks/sol0-audiobook/lDuTf0Co8szKJBdzzAnu",
        external: true,
      },
    ],
  },
];

function Row({ entry }: { entry: Entry }) {
  const inner = (
    <>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="text-cream"
            style={{ fontFamily: "var(--font-inter)", fontSize: "1.0625rem", fontWeight: 500 }}
          >
            {entry.title}
          </span>
          <span
            className="text-tan"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.625rem",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            {entry.category}
          </span>
        </div>
        <p
          className="text-cream/60 mt-1.5"
          style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", lineHeight: 1.55 }}
        >
          {entry.description}
        </p>
      </div>
      <svg
        className="w-4 h-4 mt-1.5 flex-shrink-0 text-gold group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );

  const cls =
    "group flex items-start gap-5 py-5 border-b border-white/10 transition-colors hover:border-gold/30";

  return entry.external ? (
    <a href={entry.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={entry.href} className={cls}>
      {inner}
    </Link>
  );
}

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 sm:pt-24 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-tan hover:text-cream transition-colors"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.13em",
            textTransform: "uppercase",
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Neil McArdle
        </Link>

        <h1
          className="text-cream mt-12"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "clamp(2.25rem, 6vw, 3.25rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Archive
        </h1>
        <p
          className="text-cream/60 mt-5 max-w-md"
          style={{ fontFamily: "var(--font-inter)", fontSize: "1.0625rem", lineHeight: 1.6 }}
        >
          Other things I&apos;ve designed and built. Tools, a few games for my
          kids, and the odd book.
        </p>

        <div className="mt-16 space-y-16">
          {GROUPS.map((group) => (
            <section key={group.label}>
              <h2
                className="text-tan mb-2"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                {group.label}
              </h2>
              <div className="border-t border-white/10">
                {group.entries.map((entry) => (
                  <Row key={entry.title} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
