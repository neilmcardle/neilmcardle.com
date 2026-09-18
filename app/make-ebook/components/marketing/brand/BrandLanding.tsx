"use client";

import type React from "react";
import { useState } from "react";
import { track } from "@vercel/analytics";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { openCookieConsent } from "@/components/CookieConsent";
import { Arrow } from "./AppWindow";
import { Mark } from "./BrandMark";
import { BrandNav } from "./BrandNav";
import {
  CoverCard,
  ExportDemo,
  FocusCard,
  ImportDemo,
  OfflineCard,
  PreflightDemo,
  PreviewDemo,
  RewriteDemo,
} from "./demos";
import { HeroVideo } from "./HeroVideo";
import { StudioDemo } from "./StudioDemo";
import styles from "./brand.module.css";
import landing from "./landing.module.css";

const GuideCards = dynamic(
  () => import("./LandingGuides").then((m) => m.GuideCards),
  {
    loading: () => (
      <div className={landing.guides} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${landing.guide} ${landing.guideSkeleton}`}>
            <span className={landing.guideThumb} />
          </div>
        ))}
      </div>
    ),
  },
);
const GuideLinks = dynamic(
  () => import("./LandingGuides").then((m) => m.GuideLinks),
  {
    loading: () => (
      <>
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className={landing.linkSkeleton} aria-hidden="true" />
        ))}
      </>
    ),
  },
);

const STORES = [
  "Kindle",
  "Apple Books",
  "Kobo",
  "Google Play Books",
  "Barnes & Noble",
  "IngramSpark",
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    items: [
      "Unlimited books on this device",
      "Import, chapters and preview",
      "EPUB, PDF and DOCX export",
      "Works offline",
    ],
    cta: "Start free",
    primary: false,
    checkout: undefined,
  },
  {
    name: "Pro",
    price: "$9 / month",
    items: [
      "Everything in Free",
      "Book Mind and rewrites",
      "Pre-flight and AI disclosure",
      "Sync across devices",
    ],
    cta: "Start with Pro",
    primary: true,
    checkout: { endpoint: "/api/checkout", tier: "pro" },
  },
  {
    name: "Lifetime",
    price: "$149",
    items: [
      "Everything in Pro, for good",
      "Every future feature",
      "Supports a one-person team",
    ],
    cta: "Buy Lifetime",
    primary: false,
    checkout: { endpoint: "/api/checkout-lifetime", tier: "lifetime" },
  },
];

function PlanButton({
  label,
  primary,
  checkout,
  onStartWriting,
}: {
  label: string;
  primary: boolean;
  checkout?: { endpoint: string; tier: string };
  onStartWriting: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!checkout) {
      onStartWriting();
      return;
    }
    track("checkout_started", { tier: checkout.tier, from: "landing" });
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(checkout.endpoint, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout could not start.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error && err.message === "Already subscribed to Pro"
          ? "You already have Pro."
          : "Checkout could not start. Try again in a moment.",
      );
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`${primary ? landing.acid : landing.btn} ${landing.planCta}`}
        onClick={start}
        disabled={loading}
        aria-busy={loading || undefined}
      >
        {loading ? "Opening checkout" : label}
      </button>
      {error && (
        <p className={landing.planError} role="alert">
          {error}
        </p>
      )}
    </>
  );
}

type CardLink = {
  label: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
};

function TextLink({ link, className }: { link: CardLink; className: string }) {
  const content = (
    <>
      {link.label}
      {link.external && <Arrow direction="out" />}
    </>
  );
  if (link.onClick) {
    return (
      <button
        type="button"
        className={`${className} ${landing.linkButton}`}
        onClick={link.onClick}
      >
        {content}
      </button>
    );
  }
  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={link.href ?? "#"} className={className}>
      {content}
    </Link>
  );
}

function FeatureCard({
  id,
  title,
  desc,
  link,
  flip = false,
  extra,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  link: CardLink;
  flip?: boolean;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article
      id={id}
      className={`${landing.card} ${flip ? landing.cardFlip : ""}`}
    >
      <div className={landing.cardCopy}>
        <h3 className={landing.cardTitle}>
          <span>{title}</span>
          <span className={landing.muted}>{desc}</span>
        </h3>
        {extra}
        <TextLink link={link} className={landing.cardLink} />
      </div>
      {children}
    </article>
  );
}

function SmallCard({
  title,
  desc,
  link,
  children,
}: {
  title: string;
  desc: string;
  link: CardLink;
  children: React.ReactNode;
}) {
  return (
    <article className={landing.smallCard}>
      <div className={landing.smallCopy}>
        <h3 className={landing.smallTitle}>
          {title}
          <span>{desc}</span>
        </h3>
        <TextLink link={link} className={landing.textLink} />
      </div>
      {children}
    </article>
  );
}

export function BrandIntro() {
  return (
    <section id="intro" className={styles.intro}>
      <iframe
        src="/make-ebook/brand/rain-on-glass.html?bg=/make-ebook/brand/library-lamp.jpg"
        title=""
        aria-hidden="true"
        tabIndex={-1}
        loading="eager"
        className={styles.introRain}
      />
      <Mark className={styles.introMark} />
      <a
        href="#hero"
        className={styles.introChevron}
        aria-label="Scroll to the product"
        onClick={(e) => {
          const intro = document.getElementById("intro");
          if (!intro) return;
          e.preventDefault();
          const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          window.scrollTo({
            top: intro.getBoundingClientRect().bottom + window.scrollY,
            behavior: reduced ? "auto" : "smooth",
          });
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M4 7l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}

export function BrandHero({ onStartWriting }: { onStartWriting: () => void }) {
  return (
    <section id="hero" className={styles.hero}>
      <HeroVideo />
      <div className={styles.heroScrim} />
      <div className={`${styles.shell} ${styles.heroContent}`}>
        <div className={styles.heroCopy}>
          <h1 className={styles.h1}>
            <span className={styles.h1Brand}>
              <Mark className={styles.h1Mark} />
              makeebook
            </span>{" "}
            The writing platform for your most thoughtful book.
          </h1>
          <p className={styles.lede}>
            Write, preview and export from your private workspace.
          </p>
          <div className={styles.ctaRow}>
            <button
              type="button"
              onClick={onStartWriting}
              className={styles.cta}
            >
              Start writing
            </button>
            <span className={styles.free}>It&rsquo;s free.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

type BrandLandingProps = {
  onStartWriting: () => void;
  hideNav?: boolean;
};

export default function BrandLanding({
  onStartWriting,
  hideNav = false,
}: BrandLandingProps) {
  return (
    <div className={styles.page}>
      <BrandIntro />

      {!hideNav && <BrandNav onStartWriting={onStartWriting} onLanding />}

      <main>
        <BrandHero onStartWriting={onStartWriting} />

        <div className={styles.shell}>
          <section id="product" className={landing.stageBand}>
            <StudioDemo />
          </section>

          <section className={landing.bandTight}>
            <p className={landing.stripCaption}>
              Export one file for every major store
            </p>
            <div className={landing.strip}>
              {STORES.map((store) => (
                <div key={store} className={landing.stripTile}>
                  {store}
                </div>
              ))}
            </div>
          </section>

          <section className={landing.band}>
            <div className={landing.cards}>
              <FeatureCard
                id="import"
                title="Bring the book you already have."
                desc="Paste from Google Docs, drop in a Word file or bring an AI draft. Headings become chapters on the way in."
                link={{
                  label: "Start with your manuscript",
                  onClick: onStartWriting,
                }}
                extra={
                  <div className={landing.formats}>
                    <span>.docx</span>
                    <span>.txt</span>
                    <span>.md</span>
                    <span>paste</span>
                  </div>
                }
              >
                <ImportDemo />
              </FeatureCard>

              <FeatureCard
                id="rewrite"
                flip
                title="Ask for another way to say it."
                desc="Select a sentence and Book Mind offers three takes. Use the one that sounds like you, or keep your own."
                link={{
                  label: "Learn how Book Mind reads a manuscript",
                  href: "/make-ebook/blog/ai-manuscript-analysis",
                }}
              >
                <RewriteDemo />
              </FeatureCard>

              <FeatureCard
                id="preview"
                title="See every page as your readers will."
                desc="Kindle, iPad and phone, on white, sepia or dark. Chapter openings and line lengths look the way they will in the store."
                link={{ label: "Try it in the editor above", href: "#product" }}
              >
                <PreviewDemo />
              </FeatureCard>

              <FeatureCard
                id="preflight"
                flip
                title="Know it will ship before Amazon decides."
                desc="Pre-flight reads the whole book for the patterns KDP flags, then writes your AI disclosure answer for you."
                link={{ label: "See what Pro includes", href: "#pricing" }}
              >
                <PreflightDemo />
              </FeatureCard>

              <FeatureCard
                id="export"
                title="One book, every store."
                desc="EPUB for Kindle, Apple Books and Kobo, PDF for proofing, DOCX for your editor. Open formats, so nothing you make here is trapped here."
                link={{
                  label: "Learn how ebook creation tools compare",
                  href: "/make-ebook/blog/best-ebook-creation-tools",
                }}
              >
                <ExportDemo />
              </FeatureCard>
            </div>
          </section>

          <section className={landing.band}>
            <h2 className={landing.sectionTitle}>
              The quiet parts matter too.
            </h2>
            <div className={landing.smallCards}>
              <SmallCard
                title="Focus mode"
                desc="Hide everything but the page, with rain, waves or fire in your ears if you want them."
                link={{ label: "Start writing", onClick: onStartWriting }}
              >
                <FocusCard />
              </SmallCard>
              <SmallCard
                title="Works offline"
                desc="Every change saves to your device first."
                link={{
                  label: "Learn about the best offline ebook editors",
                  href: "/make-ebook/blog/best-offline-ebook-editors",
                }}
              >
                <OfflineCard />
              </SmallCard>
              <SmallCard
                title="Free covers"
                desc="Your title and name, set in type that suits the book, in the colour you choose."
                link={{
                  label: "Learn how to create an ebook cover",
                  href: "/make-ebook/blog/how-to-create-an-ebook-cover",
                }}
              >
                <CoverCard />
              </SmallCard>
            </div>
          </section>

          <section className={landing.band}>
            <article className={landing.maker}>
              <div className={landing.makerCopy}>
                <h3 className={landing.cardTitle}>
                  <span>makeebook is made by one designer, in the open.</span>
                </h3>
                <TextLink
                  link={{
                    label: "neilmcardle.com",
                    href: "https://neilmcardle.com",
                    external: true,
                  }}
                  className={landing.cardLink}
                />
              </div>
              <div className={landing.makerImage}>
                <Image
                  src="/make-ebook/brand/neil.jpg"
                  alt="Neil McArdle, the designer who makes makeebook"
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className={landing.makerPhoto}
                />
                <svg
                  className={landing.makerMark}
                  viewBox="0 0 304 316"
                  aria-hidden="true"
                >
                  <path
                    d="M0 0V311.938C0 313.969 1.62051 316 4.05128 316H153.949C155.974 316 158 314.375 158 311.938V158.406L0 0Z"
                    fill="#fff"
                  />
                  <path
                    d="M304 316V4.0617C304 2.03085 302.379 0 299.949 0H150.051C148.026 0 146 1.62468 146 4.0617V157.594L304 316Z"
                    fill="#fff"
                  />
                </svg>
              </div>
            </article>
          </section>

          <section id="guides" className={landing.band}>
            <h2 className={landing.sectionTitle}>
              Guides for finishing a book.
            </h2>
            <GuideCards />
            <TextLink
              link={{ label: "All guides", href: "/make-ebook/blog" }}
              className={landing.textLink}
            />
          </section>

          <section id="pricing" className={landing.band}>
            <h2 className={landing.sectionTitle}>Choose how you finish.</h2>
            <div className={landing.plans}>
              {PLANS.map((plan) => (
                <div key={plan.name} className={landing.plan}>
                  <p className={landing.planName}>{plan.name}</p>
                  <p className={landing.planPrice}>{plan.price}</p>
                  <ul className={landing.planList}>
                    {plan.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <PlanButton
                    label={plan.cta}
                    primary={plan.primary}
                    checkout={plan.checkout}
                    onStartWriting={onStartWriting}
                  />
                </div>
              ))}
            </div>
            <TextLink
              link={{
                label: "Learn whether lifetime or subscription suits you",
                href: "/make-ebook/blog/lifetime-license-vs-subscription",
              }}
              className={landing.textLink}
            />
          </section>

          <section className={landing.final}>
            <h2 className={landing.finalTitle}>
              Write the book you&rsquo;ve been putting off.
            </h2>
            <button
              type="button"
              className={styles.cta}
              onClick={onStartWriting}
            >
              Start writing
            </button>
          </section>
        </div>
      </main>

      <footer className={landing.footer}>
        <div className={styles.shell}>
          <div className={landing.footerCols}>
            <div>
              <p className={landing.footerHead}>Product</p>
              <ul className={landing.footerList}>
                <li>
                  <a href="#product">Editor</a>
                </li>
                <li>
                  <a href="#import">Import</a>
                </li>
                <li>
                  <a href="#rewrite">Book Mind</a>
                </li>
                <li>
                  <a href="#preflight">Pre-flight</a>
                </li>
                <li>
                  <a href="#export">Export</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
              </ul>
            </div>
            <div>
              <p className={landing.footerHead}>Guides</p>
              <ul className={landing.footerList}>
                <li>
                  <Link href="/make-ebook/blog">All guides</Link>
                </li>
                <GuideLinks />
              </ul>
            </div>
            <div>
              <p className={landing.footerHead}>makeebook</p>
              <ul className={landing.footerList}>
                <li>
                  <Link href="/make-ebook/signin">Sign in</Link>
                </li>
                <li>
                  <a
                    href="https://x.com/makeEbook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @makeebook on X
                  </a>
                </li>
                <li>
                  <a
                    href="https://neilmcardle.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    neilmcardle.com
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className={landing.footerHead}>Legal</p>
              <ul className={landing.footerList}>
                <li>
                  <a
                    href="https://makeebook.ink/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="https://makeebook.ink/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    className={landing.footerButton}
                    onClick={openCookieConsent}
                  >
                    Cookie preferences
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className={landing.footerBase}>
            <span>&copy; makeebook {new Date().getFullYear()}</span>
            <span>Made by Neil McArdle</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
