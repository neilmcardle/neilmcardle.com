"use client";

import Link from "next/link";
import styles from "./home.module.css";
import { HomepageProjectPreview } from "@/components/HomepageProjectPreview";
import ProductBadge, { type BadgeKey } from "./ProductBadge";

export type Feature = {
  tileKey: BadgeKey;
  category: string;
  name: string;
  description: string;
  href: string;
  linkLabel: string;
  status?: string;
  external?: boolean;
  appleIcon?: boolean;
};

export const FEATURES: Feature[] = [
  {
    tileKey: "makeebook",
    category: "Writing platform",
    name: "makeEbook",
    description:
      "An AI-first platform that takes a manuscript to a store-ready ebook. Brand, product, and engineering end-to-end.",
    href: "https://makeebook.ink",
    linkLabel: "makeebook.ink",
    external: true,
  },
  {
    tileKey: "coverly",
    category: "Design research tool",
    name: "Coverly",
    description:
      "Comparable research for book cover designers. Thousands of covers searchable by design attributes rather than genre, with boards and PDF comp-deck export. Free to use.",
    href: "/coverly",
    linkLabel: "View project",
  },
  {
    tileKey: "doodlewire",
    category: "Wireframing tool · iOS",
    name: "DoodleWire",
    description:
      "Doodle a UI and on-device ML snaps your strokes into clean wireframe elements, then exports in HTML or React.",
    href: "https://apps.apple.com/us/app/doodlewire/id6771274835",
    linkLabel: "App Store",
    external: true,
    appleIcon: true,
  },
  {
    tileKey: "spark",
    category: "Learning platform",
    name: "Spark",
    description:
      "A full-stack engineering course for designers, so they can build the things they design.",
    href: "/spark",
    linkLabel: "View project",
    status: "In progress",
  },
];

const CTA_CLS = `group/cta inline-flex items-center gap-2 transition-colors ${styles.workCta}`;

const CTA_STYLE = {
  fontFamily: "var(--font-inter)",
  fontSize: "0.6875rem",
  letterSpacing: "0.13em",
  textTransform: "uppercase" as const,
};

export function ProductDetail({ feature }: { feature: Feature }) {
  return (
    <div className={styles.dockSplit}>
      <div className={styles.dockSide}>
        <div className={styles.dockHead}>
          <ProductBadge badge={feature.tileKey} size={40} />
          <h2 className={styles.dockTitle}>{feature.name}</h2>
        </div>
        <dl className={styles.dockFacts}>
          <div>
            <dt>Type</dt>
            <dd>{feature.category}</dd>
          </div>
          {feature.status && (
            <div>
              <dt>Status</dt>
              <dd>{feature.status}</dd>
            </div>
          )}
          <div>
            <dt>About</dt>
            <dd>{feature.description}</dd>
          </div>
        </dl>
        <div className={styles.dockSideLink}>
          <ProductLink
            href={feature.href}
            external={feature.external}
            linkLabel={feature.linkLabel}
            appleIcon={feature.appleIcon}
          />
        </div>
      </div>
      <div className={styles.dockGallery}>
        <div className={styles.dockShot}>
          <HomepageProjectPreview
            k={feature.tileKey}
            sizes="(max-width: 760px) 100vw, (max-width: 1048px) calc(100vw - 400px), 648px"
            bare
          />
        </div>
      </div>
    </div>
  );
}

function ProductLink({
  href,
  external,
  linkLabel,
  appleIcon,
}: Pick<Feature, "href" | "external" | "linkLabel" | "appleIcon">) {
  return external ? (
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
