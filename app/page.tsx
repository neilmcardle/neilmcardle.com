import Link from "next/link";
import {
  HomepageProjectPreview,
  type ProjectKey,
} from "@/components/HomepageProjectPreview";
import GradualBlur from "@/components/GradualBlur";
import ElectricBorder from "@/components/ElectricBorder";
import HeroCard from "@/components/HeroCard";

const SUBSCRIBE_URL = "https://buy.stripe.com/9B600l7XfblGdOxgk8fIs01";

const WAITLIST_URL =
  "mailto:neil@neilmcardle.com?subject=Join%20the%20waitlist";

const PRICE = { amount: "£5,000", suffix: "+ VAT" } as const;

const AVAILABILITY = {
  open: true,
  openBadge: "Slot open now",
  fullBadge: "Currently full",
  openLine: "One client at a time. One slot open now.",
  fullLine: "One client at a time. Currently full, join the waitlist.",
} as const;

const WHO_FOR = {
  fit: [
    "A funded startup or founder who needs product shipped, not just designed",
    "Replacing a slow agency or a designer-plus-engineer hire with one senior pair of hands",
    "Shipping an MVP, a design system, or a polished marketing site that has to feel finished",
  ],
  notFit:
    "Not a fit if you want one-off logos, social templates, or somone to simply push pixels.",
} as const;

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Subscribe",
    body: "Email, payment, you're in. Two minutes, no intake call.",
  },
  {
    n: "02",
    title: "Send requests",
    body: "A Loom, a doc, a sketch, however's easiest. One active request at a time, worked in priority order.",
  },
  {
    n: "03",
    title: "Ship",
    body: "Most requests go live on your domain in 2 to 4 working days, because you're the only client in the queue.",
  },
];

const PLAN_FEATURES: string[] = [
  "One active request at a time, worked in priority order",
  "Design and build, by one person, start to finish",
  "Shipped to your domain in days, not months",
  "Async only, no calls, no meetings, no status decks",
  "Pause or cancel anytime; billing freezes and resumes where it left off",
];

const TESTIMONIALS: { quote: string; name: string; org: string }[] = [
  {
    quote:
      "I handed over a rough brief and got something far better than I'd pictured, and faster than I expected.",
    name: "Guy Sanderson",
    org: "Gatewick House & Gardens",
  },
  {
    quote:
      "He over-delivers every time. A delight to work with, I can't recommend him enough.",
    name: "Dan Roberts",
    org: "Dan Roberts Group",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Do you only design, or build too?",
    a: "Both. That's the whole point. The design and the working product come from the same hands, so nothing gets lost between them.",
  },
  {
    q: "What counts as one request?",
    a: "A screen, a flow, a feature, a landing page, a component system, a discrete, shippable piece. Big things get broken into a sequence and shipped in order. If you're unsure, send it and I'll tell you straight away how I'd scope it.",
  },
  {
    q: "How fast, and how does a request work?",
    a: "Send it however's easiest, a Loom, a doc, a sketch. No forms, no intake call. Most requests ship in 2 to 4 working days, because I take one client at a time and your work isn't sitting behind anyone else's.",
  },
  {
    q: "Can you work with my engineers or existing codebase?",
    a: "Yes. I design in Figma and ship in React, Next and TypeScript, and I'm comfortable in an existing repo or design system, including keeping Figma and code in sync.",
  },
  {
    q: "What if I run out of things to build?",
    a: "Pause the plan. Billing freezes and picks up where it left off when you're ready.",
  },
];

export default function Homepage() {
  const ctaLabel = AVAILABILITY.open
    ? "Let's work together"
    : "Join the waitlist";
  const ctaHref = AVAILABILITY.open ? SUBSCRIBE_URL : WAITLIST_URL;

  return (
    <>
      <HeroCard />
      <div className="min-h-screen bg-black relative isolate overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[760px]"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(68% 46% at 50% 24%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 48%, transparent 74%)",
          }}
        />

        <div
          id="intro"
          className="home-prose relative z-10 max-w-6xl mx-auto pl-6 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pt-12 sm:pt-24 lg:pt-12 pb-20"
        >
          <h2
            className="text-cream max-w-3xl mb-24"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(2rem, 6vw, 3.25rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Your product, designed and built.
          </h2>

          <section id="how-it-works" className="mb-28 scroll-mt-8">
            <SectionHeader label="How it works" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
              {STEPS.map((s) => (
                <div key={s.n}>
                  <div
                    className="text-gold mb-3"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.13em",
                      fontWeight: 600,
                    }}
                  >
                    {s.n}
                  </div>
                  <h3
                    className="text-cream mb-2"
                    style={{
                      fontFamily: "var(--font-eb-garamond)",
                      fontSize: "1.375rem",
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-cream/65"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="work" className="mb-28 scroll-mt-20">
            <SectionHeader label="Selected work" />

            <div className="space-y-16 sm:space-y-24">
              <ProductFeature
                tileKey="makeebook"
                category="Product · AI · Designed and built solo"
                name="makeEbook"
                description="An AI-first platform that takes a manuscript to a store-ready ebook. Brand, product, and engineering end to end, with Claude under the hood."
                href="https://makeebook.ink"
                linkLabel="makeebook.ink"
                external
              />
              <ProductFeature
                tileKey="coverly"
                category="Product · Research tool · Designed and built solo"
                name="Coverly"
                description="Comp research for book cover designers. Thousands of covers searchable by design attributes rather than genre, with boards and PDF comp-deck export. Free, with email sign-up."
                href="/coverly"
                linkLabel="View project"
                reverse
              />
              <ProductFeature
                tileKey="doodlewire"
                category="Product · iOS · Designed and built solo"
                name="DoodleWire"
                description="Doodle a UI and on-device ML snaps your strokes into clean wireframe elements, then exports HTML or React. Designed, built, and shipped through Apple review solo."
                href="/doodlewire"
                linkLabel="View project"
                appStoreUrl="https://apps.apple.com/us/app/doodlewire/id6771274835"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 mt-20">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="border-l-2 border-gold/40 pl-6">
                  <blockquote
                    className="text-cream/85"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "clamp(1.0625rem, 1.6vw, 1.25rem)",
                      lineHeight: 1.55,
                    }}
                  >
                    {t.quote}
                  </blockquote>
                  <figcaption
                    className="mt-4 text-tan"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.name}, {t.org}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section id="pricing" className="mb-24 scroll-mt-12">
            <SectionHeader label="Work with me" />
            <div className="max-w-2xl mx-auto">
              <div
                className="soft-card rounded-[1.75rem] overflow-hidden"
                style={{ background: "#000000" }}
              >
                <div className="p-8 sm:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className="text-cream"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "1.75rem",
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Monthly
                    </h3>
                    <span
                      className="shrink-0 text-tan"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "0.8125rem",
                        letterSpacing: "0.13em",
                        textTransform: "uppercase",
                      }}
                    >
                      Pause anytime
                    </span>
                  </div>

                  <div className="my-7 border-t border-dashed border-white/15" />

                  <div className="flex items-end flex-wrap gap-x-3 gap-y-1">
                    <span
                      className="text-cream leading-none"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "clamp(2.75rem, 8vw, 4rem)",
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {PRICE.amount}
                    </span>
                    <span
                      className="text-tan mb-1.5"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "0.875rem",
                        letterSpacing: "0.08em",
                      }}
                    >
                      /month
                    </span>
                    <span
                      className="text-tan mb-2"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "0.625rem",
                        letterSpacing: "0.13em",
                        textTransform: "uppercase",
                      }}
                    >
                      {PRICE.suffix}
                    </span>
                  </div>

                  <p
                    className="mt-5 text-cream/70"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                    }}
                  >
                    A senior product designer and a front-end engineer is two
                    hires and &pound;150k+ a year. This is both, for one flat
                    monthly fee, with nothing lost in the handoff between them.
                  </p>

                  <div className="soft-inset relative mt-8 rounded-[1rem] p-6 sm:p-7">
                    <span
                      className="absolute -top-2 left-5 bg-[#1a1a1d] px-2 text-gold"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "0.625rem",
                        letterSpacing: "0.13em",
                        textTransform: "uppercase",
                      }}
                    >
                      Included
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                      {PLAN_FEATURES.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2.5 text-cream/85"
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontSize: "0.9375rem",
                            lineHeight: 1.45,
                          }}
                        >
                          <svg
                            className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <CtaButton href={ctaHref} label={ctaLabel} />
                  </div>
                  <p
                    className="mt-3 text-center text-tan"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Email, payment, you&apos;re in. Two minutes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" className="mb-24 scroll-mt-12">
            <SectionHeader label="FAQ" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {FAQS.map((item) => (
                <div key={item.q}>
                  <h3
                    className="text-cream mb-2"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.q}
                  </h3>
                  <p
                    className="text-cream/70"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-24 text-center">
            <h2
              className="text-cream mb-8"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "clamp(2rem, 6vw, 3.25rem)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              Tell me more.
            </h2>
          </section>

          <footer className="pt-12 flex flex-col items-center sm:flex-row sm:justify-between gap-6">
            <p
              className="text-tan"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}
            >
              © 2026 Neil McArdle
            </p>
            <div className="flex items-center gap-5 order-first sm:order-none mx-auto sm:mx-0">
              <a
                href="https://www.linkedin.com/in/neilmcardle/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex p-2 -m-2 text-tan hover:text-cream transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
              </a>
              <a
                href="https://github.com/neilmcardle"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex p-2 -m-2 text-tan hover:text-cream transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://x.com/BetterNeil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="inline-flex p-2 -m-2 text-tan hover:text-cream transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link
                href="/archive"
                className="inline-block py-2 -my-2 text-cream/70 hover:text-cream transition-colors"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                }}
              >
                Archive
              </Link>
              <Link
                href="/paintings"
                className="inline-block py-2 -my-2 text-cream/70 hover:text-cream transition-colors"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                }}
              >
                Paintings
              </Link>
              <a
                href="mailto:neil@neilmcardle.com"
                className="inline-block py-2 -my-2 text-cream/70 hover:text-cream transition-colors"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                }}
              >
                Email
              </a>
              <Link
                href="/terms"
                className="inline-block py-2 -my-2 text-cream/70 hover:text-cream transition-colors"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                }}
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="inline-block py-2 -my-2 text-cream/70 hover:text-cream transition-colors"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                }}
              >
                Privacy
              </Link>
            </div>
          </footer>
        </div>
      </div>
      <GradualBlur
        target="page"
        position="bottom"
        height="6rem"
        strength={2}
        divCount={5}
        curve="bezier"
      />
    </>
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
  appStoreUrl,
  reverse,
}: {
  tileKey: ProjectKey;
  category: string;
  name: string;
  description: string;
  href: string;
  external?: boolean;
  linkLabel: string;
  appStoreUrl?: string;
  reverse?: boolean;
}) {
  const mediaInner = (
    <div className="block w-full">
      <div className="relative aspect-[4/3] flex items-center justify-center">
        <div className="relative w-[64%] max-w-[330px] drop-shadow-[0_26px_55px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:scale-[1.03]">
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

  const ctaCls =
    "group/cta inline-flex items-center gap-2 text-gold hover:text-gold-bright transition-colors";
  const ctaStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.6875rem",
    letterSpacing: "0.13em",
    textTransform: "uppercase" as const,
  };
  const ctaArrow = (
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
              className={ctaCls}
              style={ctaStyle}
            >
              {linkLabel}
              {ctaArrow}
            </a>
          ) : (
            <Link href={href} className={ctaCls} style={ctaStyle}>
              {linkLabel}
              {ctaArrow}
            </Link>
          )}
          {appStoreUrl && (
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Download ${name} on the App Store`}
              className="group/ios inline-flex items-center gap-2 text-tan hover:text-cream transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.625rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                App Store
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CtaButton({
  href,
  label,
  className = "",
  shake = false,
}: {
  href: string;
  label: string;
  className?: string;
  shake?: boolean;
}) {
  return (
    <ElectricBorder
      color="#d8b46a"
      speed={0.7}
      chaos={0.06}
      borderRadius={8}
      className={`${shake ? "cta-shake" : ""} ${className}`}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <a
        href={href}
        className="gold-btn inline-flex items-center gap-2.5 px-5 py-2.5 rounded-[8px]"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "1.125rem",
          fontWeight: 400,
          letterSpacing: "0.01em",
          textTransform: "none",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 78 78"
          fill="currentColor"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path d="M0,0v76.8c0,.5.4,1,1,1h37c.5,0,1-.4,1-1v-37.8L0,0Z" />
          <path d="M78,78V1.2c0-.5-.4-1-1-1h-37c-.5,0-1,.4-1,1v37.8l39,39Z" />
        </svg>
        <span>{label}</span>
      </a>
    </ElectricBorder>
  );
}

function SectionIcon({ label }: { label: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (label) {
    case "Why this exists":
      return (
        <svg {...common}>
          <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.5.7.5 1.1v.5h6v-.5c0-.4 0-.7.5-1.1A6 6 0 0012 3z" />
        </svg>
      );
    case "How it works":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
        </svg>
      );
    case "Why one client at a time":
    case "About":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 20a6.5 6.5 0 0113 0" />
        </svg>
      );
    case "Work":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      );
    case "What I make":
      return (
        <svg {...common}>
          <path d="M12 3l8 4.5-8 4.5-8-4.5L12 3z" />
          <path d="M4 12l8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" />
        </svg>
      );
    case "Praise":
      return (
        <svg {...common}>
          <path d="M9 10c0-2-1.5-3-3-3v4c0 1.5 1 2.5 2.5 3M18 10c0-2-1.5-3-3-3v4c0 1.5 1 2.5 2.5 3" />
        </svg>
      );
    case "Pricing":
      return (
        <svg {...common}>
          <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-6.2-6.2a2 2 0 01-.6-1.4V5a2 2 0 012-2h7.6a2 2 0 011.4.6l6.2 6.2a2 2 0 010 2.6z" />
          <circle cx="8" cy="8" r="1.2" />
        </svg>
      );
    case "FAQ":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 014.5 1.5c0 1.5-2 2-2 3.5M12 17.5h.01" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
  }
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <span className="icon-chip w-9 h-9">
        <SectionIcon label={label} />
      </span>
      <h2
        className="text-tan"
        style={{
          fontSize: "0.75rem",
          fontFamily: "var(--font-inter)",
          letterSpacing: "0.13em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </h2>
      <div className="flex-1 h-px bg-tan/30" />
    </div>
  );
}
