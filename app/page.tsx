import Image from "next/image";
import Link from "next/link";
import { HomepageProjectPreview, type ProjectKey } from "@/components/HomepageProjectPreview";
import Strands from "@/components/Strands";
import GradualBlur from "@/components/GradualBlur";
import BorderGlow from "@/components/BorderGlow";

// Destination for the Subscribe buttons, the live Stripe Payment Link for the
// digital design and build subscription (£5,000/mo + VAT, price
// price_1TdomGQgnBfGbp9Oy6ukuZX4). Hosted checkout keeps the promise of
// "email, payment, you're in, two minutes" with no backend.
const SUBSCRIBE_URL = "https://buy.stripe.com/9B600l7XfblGdOxgk8fIs01";

// Where the CTA points when the slot is full. A plain mailto waitlist keeps it
// honest and backend-free.
const WAITLIST_URL = "mailto:neil@neilmcardle.com?subject=Join%20the%20waitlist";

// Single editable price. Quoted ex-VAT because the buyer is a business that
// reclaims it. Raise once two case studies and a waitlist exist.
const PRICE = { amount: "£5,000", suffix: "+ VAT" } as const;

// Availability is real scarcity, one client at a time. Toggle `open` by hand
// when the slot is taken; the hero, pricing and final CTA all read from here so
// they never drift. Only ever set `open: true` when the slot is genuinely open.
const AVAILABILITY = {
  open: true,
  // Short status for the hero pill badge.
  openBadge: "Slot open now",
  fullBadge: "Currently full",
  // Fuller line used in the final CTA sentence.
  openLine: "One client at a time. One slot open now.",
  fullLine: "One client at a time. Currently full, join the waitlist.",
} as const;



const CLIENTS: { name: string; note: string }[] = [
  { name: "Avis Budget Group", note: "Product design" },
  { name: "Banner of Truth", note: "Visual design" },
  { name: "Dan Roberts Group", note: "Branding" },
  { name: "Gatewick House & Gardens", note: "Branding" },
];

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
  const ctaLabel = AVAILABILITY.open ? "Work with me" : "Join the waitlist";
  const ctaHref = AVAILABILITY.open ? SUBSCRIBE_URL : WAITLIST_URL;


  return (
    <>
    <div className="min-h-screen bg-black relative isolate overflow-hidden">
      {}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[760px]"
        aria-hidden="true"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Strands
          colors={["#f0d091", "#d8b46a", "#b8923f", "#9e9482"]}
          count={3}
          speed={0.32}
          amplitude={1}
          waviness={1}
          thickness={0.55}
          glow={1.6}
          taper={3.4}
          spread={1.1}
          intensity={0.32}
          saturation={0.8}
          opacity={0.4}
          scale={1.7}
          glass={false}
        />
      </div>

      {/* Legibility scrim — darkens the centre where the hero text sits so the
          strands read as a glow around the copy, never through it. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[760px]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(68% 46% at 50% 24%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 48%, transparent 74%)",
        }}
      />

      <div className="home-prose relative z-10 max-w-6xl mx-auto pl-6 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pt-12 sm:pt-24 lg:pt-12 pb-20">
        <header className="mb-24 sm:mb-32 pt-4 sm:pt-10 flex flex-col items-center text-center">
          {/* Golden N logomark — Neil's own mark (one shape rotated). */}
          <svg
            width="34"
            height="34"
            viewBox="0 0 78 78"
            fill="none"
            role="img"
            aria-label="Neil McArdle"
            className="mb-10"
          >
            <path
              d="M0,0v76.8c0,.5.4,1,1,1h37c.5,0,1-.4,1-1v-37.8L0,0Z"
              fill="#9e9482"
            />
            <path
              d="M78,78V1.2c0-.5-.4-1-1-1h-37c-.5,0-1,.4-1,1v37.8l39,39Z"
              fill="#9e9482"
            />
          </svg>

          {/* Avatar — small, circular, the profile-card cue. */}
          <div className="relative mb-8">
            <Image
              src="/me.png"
              alt="Neil McArdle"
              width={120}
              height={120}
              priority
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover grayscale"
            />
          </div>

          {/* Identity line + the design⇄code mark, small. The positioning
              headline is the loud element now, not the name. */}
          <div
            className="mb-6 flex items-center gap-3 sm:flex-col sm:gap-1.5"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "1.2em",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            <span className="text-cream/80">Neil McArdle</span>
            <span className="w-1 h-1 rounded-full bg-tan/40 sm:hidden" aria-hidden="true" />
            <span className="text-gold">
              design{" "}
              <span className="text-white">&#8644;</span>{" "}
              code
            </span>
          </div>

          <h1
            className="text-cream max-w-3xl"
            style={{
              fontFamily: "var(--font-cantarell)",
              fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            I design and build your product. One person, start to finish.
          </h1>

          <p
            className="mt-6 max-w-xl text-cream/65"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(1rem, 1.4vw, 1.125rem)",
              lineHeight: 1.6,
            }}
          >
            From Figma file to shipped product, nothing gets lost in
            translation.
          </p>

          <div className="mt-9 flex flex-col items-center gap-5">
            <CtaButton href={ctaHref} label={ctaLabel} />
          </div>

          <nav
            aria-label="Primary"
            className="mt-12 flex items-center gap-6 text-tan"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.13em",
            }}
          >
            <a href="#work" className="py-2 -my-2 hover:text-cream transition-colors">
              Work
            </a>
            <span className="w-1 h-1 rounded-full bg-tan/40" aria-hidden="true" />
            <a href="#pricing" className="py-2 -my-2 hover:text-cream transition-colors">
              Pricing
            </a>
            <span className="w-1 h-1 rounded-full bg-tan/40" aria-hidden="true" />
            <a href="mailto:neil@neilmcardle.com" className="py-2 -my-2 hover:text-cream transition-colors">
              Email
            </a>
          </nav>

          {/* Client strip — instant credibility, a text logo-bar. */}
          <div className="mt-16 w-full max-w-2xl">
            <p
              className="text-tan/70 mb-4"
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.625rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Selected clients
            </p>
            <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2 text-cream/55">
              {CLIENTS.map((c, i) => (
                <span key={c.name} className="flex items-center sm:gap-x-6">
                  {i > 0 && (
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-tan/40" aria-hidden="true" />
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.9375rem",
                      fontWeight: 500,
                    }}
                  >
                    {c.name}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Who it's for — qualifying hard raises the tier and filters the wrong
            buyers. */}
        <section className="mb-28">
          <SectionHeader label="Who it's for" />
          <ul className="space-y-4 max-w-2xl">
            {WHO_FOR.fit.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-cream/85"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "1.0625rem",
                  lineHeight: 1.5,
                }}
              >
                <svg
                  className="w-4 h-4 mt-1 flex-shrink-0 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p
            className="mt-7 max-w-2xl text-tan"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
            }}
          >
            {WHO_FOR.notFit}
          </p>
        </section>

        {}
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
              tileKey="doodlewire"
              category="Product · iOS · Designed and built solo"
              name="DoodleWire"
              description="Doodle a UI and on-device ML snaps your strokes into clean wireframe elements, then exports HTML or React. Designed, built, and shipped through Apple review solo."
              href="/doodlewire"
              linkLabel="View project"
              appStoreUrl="https://apps.apple.com/us/app/doodlewire/id6771274835"
              reverse
            />
          </div>

          {/* Client words. */}
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
                    fontFamily: "var(--font-geist-mono)",
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

        {/* How it works — three steps, no card, kept light. */}
        <section className="mb-28">
          <SectionHeader label="How it works" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div
                  className="text-gold mb-3"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
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
                    fontFamily: "var(--font-cantarell)",
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

        {/* Work with me — the offer, kept to one quiet section. One designer who
            designs and builds, one client at a time, one public price. The
            Subscribe CTA points at SUBSCRIBE_URL. */}
        <section id="pricing" className="mb-24 scroll-mt-12">
          <SectionHeader label="Work with me" />
          <div className="soft-card max-w-2xl mx-auto rounded-[1.75rem] overflow-hidden">
            <div className="p-8 sm:p-10">
              {/* Header: plan name + pause pill */}
              <div className="flex items-start justify-between gap-4">
                <h3
                  className="text-cream"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "1.75rem",
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Monthly
                </h3>
                <span
                  className="shrink-0 rounded-full px-3 py-1.5 text-gold border border-gold/30 bg-gold/10"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "0.625rem",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                  }}
                >
                  Pause anytime
                </span>
              </div>
              <p
                className="mt-2.5 text-tan"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                Design and build, one person, start to finish. One client at a
                time, the slot is yours.
              </p>

              {/* Dotted divider */}
              <div className="my-7 border-t border-dashed border-white/15" />

              {/* Price */}
              <div className="flex items-end flex-wrap gap-x-3 gap-y-1">
                <span
                  className="text-cream leading-none"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
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
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "0.875rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  /month
                </span>
                <span
                  className="text-tan mb-2"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "0.625rem",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                  }}
                >
                  {PRICE.suffix}
                </span>
              </div>

              {/* ROI reframe — the number against the alternative. */}
              <p
                className="mt-5 text-cream/70"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                }}
              >
                A senior product designer and a front-end engineer is two hires
                and &pound;150k+ a year. This is both, for one flat monthly fee,
                with nothing lost in the handoff between them.
              </p>

              {/* Included panel — labelled inner surface, the centrepiece. */}
              <div className="soft-inset relative mt-8 rounded-[1rem] p-6 sm:p-7">
                <span
                  className="absolute -top-2 left-5 bg-[#1a1a1d] px-2 text-gold"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
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
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="mt-8 flex justify-center">
                <CtaButton href={ctaHref} label={ctaLabel} />
              </div>
              <p
                className="mt-3 text-center text-tan"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.08em",
                }}
              >
                Email, payment, you&apos;re in. Two minutes.
              </p>

            </div>
          </div>
        </section>

        {/* FAQ */}
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

        {/* Final CTA */}
        <section className="mb-24 text-center">
          <h2
            className="text-cream mb-8"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "clamp(2rem, 6vw, 3.25rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Got a product to ship?
          </h2>
          <CtaButton href={ctaHref} label={ctaLabel} className="justify-center" />
        </section>

        <footer className="pt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/archive"
              className="inline-block py-2 -my-2 text-cream/70 hover:text-cream transition-colors"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}
            >
              Archive
            </Link>
            <Link
              href="/paintings"
              className="inline-block py-2 -my-2 text-cream/70 hover:text-cream transition-colors"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}
            >
              Paintings
            </Link>
            <a
              href="mailto:neil@neilmcardle.com"
              className="inline-block py-2 -my-2 text-cream/70 hover:text-cream transition-colors"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}
            >
              neil@neilmcardle.com
            </a>
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
    <BorderGlow
      className="block w-full"
      backgroundColor="#0d0d0f"
      borderRadius={16}
      glowColor="40 62 64"
      glowRadius={34}
      glowIntensity={1}
      edgeSensitivity={32}
      coneSpread={22}
      colors={["#f0d091", "#d8b46a", "#b8923f"]}
    >
      <div className="relative aspect-[4/3] flex items-center justify-center">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(56% 56% at 50% 44%, rgba(216,180,106,0.14), transparent 72%)",
          }}
          aria-hidden="true"
        />
        <div className="relative w-[44%] max-w-[230px] drop-shadow-[0_26px_55px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:scale-[1.05]">
          <HomepageProjectPreview k={tileKey} />
        </div>
      </div>
    </BorderGlow>
  );

  const mediaCls = `block ${reverse ? "md:order-2" : ""}`;
  const media = external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={mediaCls} aria-label={name}>
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
    fontFamily: "var(--font-geist-mono)",
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
      <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="group grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
      {media}
      <div className={reverse ? "md:order-1" : ""}>
        <div
          className="text-tan mb-4"
          style={{
            fontFamily: "var(--font-geist-mono)",
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
            fontFamily: "var(--font-geist-mono)",
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
            <a href={href} target="_blank" rel="noopener noreferrer" className={ctaCls} style={ctaStyle}>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-geist-mono)",
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
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`gold-btn group inline-flex items-center gap-1.5 pl-3 pr-2 py-2 rounded-full ${className}`}
      style={{
        fontFamily: "var(--font-inter)",
        fontSize: "1.125rem",
        fontWeight: 400,
        letterSpacing: "0.01em",
        textTransform: "none",
      }}
    >
      <span>{label}</span>
      <span className="gold-btn-badge w-7 h-7">
        {/* Straight face by default, smiles on hover. */}
        <span className="relative inline-block w-[11px] h-[13px]" aria-hidden="true">
          <svg className="face-straight absolute inset-x-0 top-0 w-[11px] h-auto transition-opacity duration-[240ms] ease-in-out opacity-100 group-hover:opacity-0" viewBox="0 0 12 10.71" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="1.5" cy="1.5" r="1.5" />
            <path d="M11.6,9.61c0,.61-.49,1.1-1.1,1.1H1.5c-.61,0-1.1-.49-1.1-1.1s.49-1.1,1.1-1.1h9c.61,0,1.1.49,1.1,1.1Z" />
            <circle cx="10.5" cy="1.5" r="1.5" />
          </svg>
          <svg className="face-smile absolute inset-x-0 top-0 w-[11px] h-auto transition-opacity duration-[240ms] ease-in-out opacity-0 group-hover:opacity-100" viewBox="0 0 11.2 11.95" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.6,1.5c0,.83-.68,1.5-1.5,1.5s-1.5-.67-1.5-1.5.67-1.5,1.5-1.5,1.5.67,1.5,1.5Z" />
            <path d="M10.6,1.5c0,.83-.68,1.5-1.5,1.5s-1.5-.67-1.5-1.5.67-1.5,1.5-1.5,1.5.67,1.5,1.5Z" />
            <path d="M11.02,8.98c-1.19,1.86-3.22,2.97-5.42,2.97S1.36,10.84.17,8.98c-.32-.51-.18-1.19.33-1.52.51-.32,1.2-.18,1.52.33.79,1.23,2.12,1.96,3.58,1.96s2.79-.73,3.57-1.96c.33-.5,1.01-.65,1.52-.33.25.16.42.41.48.69.06.29,0,.59-.15.83Z" />
          </svg>
        </span>
      </span>
    </a>
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
          fontFamily: "var(--font-geist-mono)",
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

