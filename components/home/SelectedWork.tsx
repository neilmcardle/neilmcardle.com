import Link from "next/link";
import {
  HomepageProjectPreview,
  type ProjectKey,
  getProductLogo,
} from "@/components/HomepageProjectPreview";

const FEATURES: {
  tileKey: ProjectKey;
  category: string;
  name: string;
  description: string;
  href: string;
  linkLabel: string;
  external?: boolean;
  appleIcon?: boolean;
  reverse?: boolean;
}[] = [
  {
    tileKey: "makeebook",
    category: "Writing Platform",
    name: "makeEbook",
    description:
      "An AI-first platform that takes a manuscript to a store-ready ebook. Brand, product, and engineering end to end.",
    href: "https://makeebook.ink",
    linkLabel: "makeebook.ink",
    external: true,
    reverse: true,
  },
  {
    tileKey: "coverly",
    category: "Design Research Tool",
    name: "Coverly",
    description:
      "Comparable research for book cover designers. Thousands of covers searchable by design attributes rather than genre, with boards and PDF comp-deck export. Free to use.",
    href: "/coverly",
    linkLabel: "View project",
  },
  {
    tileKey: "doodlewire",
    category: "Wireframing Tool · iOS",
    name: "DoodleWire",
    description:
      "Doodle a UI and on-device ML snaps your strokes into clean wireframe elements, then exports in HTML or React.",
    href: "https://apps.apple.com/us/app/doodlewire/id6771274835",
    linkLabel: "App Store",
    external: true,
    appleIcon: true,
    reverse: true,
  },
];

const CTA_CLS =
  "group/cta inline-flex items-center gap-2 text-gold hover:text-gold-bright transition-colors";

const CTA_STYLE = {
  fontFamily: "var(--font-inter)",
  fontSize: "0.6875rem",
  letterSpacing: "0.13em",
  textTransform: "uppercase" as const,
};

export default function SelectedWork() {
  return (
    <div className="space-y-16 sm:space-y-24">
      {FEATURES.map((f) => (
        <ProductFeature key={f.name} {...f} />
      ))}
    </div>
  );
}

function ProductFeature({
  tileKey,
  category,
  name,
  description,
  href,
  external,
  linkLabel,
  appleIcon,
  reverse,
}: (typeof FEATURES)[number]) {
  const mediaInner = (
    <div className="block w-full">
      <div className="relative flex items-center justify-center">
        <div className="relative w-full drop-shadow-[0_26px_55px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:scale-[1.02]">
          <HomepageProjectPreview k={tileKey} />
        </div>
      </div>
    </div>
  );

  const mediaCls = `block ${reverse ? "md:order-2" : ""}`;
  const media = external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={mediaCls}
      aria-label={name}
    >
      {mediaInner}
    </a>
  ) : (
    <Link href={href} className={mediaCls} aria-label={name}>
      {mediaInner}
    </Link>
  );

  return (
    <div className="group grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
      {media}
      <div className={reverse ? "md:order-1" : ""}>
        <div
          className="text-tan mb-4"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.6875rem",
            letterSpacing: "0.13em",
            textTransform: "uppercase",
          }}
        >
          {category}
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 flex-shrink-0">
            {getProductLogo(tileKey as "makeebook" | "coverly" | "doodlewire")}
          </div>
          <h3
            className="text-cream"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {name}
          </h3>
        </div>
        <p
          className="text-cream/70 mt-4 max-w-md"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "1.0625rem",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
          {external ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={CTA_CLS}
              style={CTA_STYLE}
            >
              {appleIcon && <AppleGlyph />}
              {linkLabel}
              <CtaArrow />
            </a>
          ) : (
            <Link href={href} className={CTA_CLS} style={CTA_STYLE}>
              {linkLabel}
              <CtaArrow />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function CtaArrow() {
  return (
    <svg
      className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M7 7h10v10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
