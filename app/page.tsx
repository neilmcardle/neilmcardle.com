import Image from "next/image";
import Link from "next/link";
import { HomepageProjectPreview, type ProjectKey } from "@/components/HomepageProjectPreview";

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
  openBadge: "One slot open now",
  fullBadge: "Currently full",
  // Fuller line used in the final CTA sentence.
  openLine: "One client at a time. One slot open now.",
  fullLine: "One client at a time. Currently full, join the waitlist.",
} as const;

// Sol0 links. The audiobook is live on ElevenReader. The ebook (made with
// makeEbook) is not published yet — likely Amazon KDP. Paste the listing URL
// into SOL0_EBOOK_URL to light up the "Read the ebook" action; until then it
// stays hidden so there is no dead link.
const SOL0_AUDIOBOOK_URL =
  "https://elevenreader.io/audiobooks/sol0-audiobook/lDuTf0Co8szKJBdzzAnu";
const SOL0_EBOOK_URL = "";

// Ripple line positions as explicit viewport percentages — ported from
// the gated /portfolio template so the public homepage shares the same
// signature backdrop. Tune numbers here to re-rhythm the pattern.
const RIPPLE_POSITIONS: number[] = [
  0, 0.6, 1.3, 2.1,
  4.8, 6.9,
  11.2, 13.4,
  19.7,
  25.3, 27.9,
  36.5,
  45.8,
  54.6, 57.1,
  66.8,
  75.4,
  83.9,
  90.2,
  95.5,
];

interface Project {
  number: string;
  key: ProjectKey;
  title: string;
  description: string;
  href: string;
  external: boolean;
  category: string;
  // If set, an "Available on the App Store" badge is overlaid on the card
  // as a separate link to the App Store listing.
  appStoreUrl?: string;
}

const PROJECTS: Project[] = [
  {
    number: "01",
    key: "makeebook",
    title: "makeEbook",
    description:
      "AI-first eBook creation platform. Conversational writing assistant with multi-turn context, Claude API under the hood, designed and built solo.",
    href: "https://makeebook.ink",
    external: true,
    category: "Product · AI · Solo-built",
  },
  {
    number: "02",
    key: "doodlewire",
    title: "DoodleWire",
    description:
      "Doodle a UI on a blank page. Teach the local recogniser your style and it snaps your strokes into polished wireframe elements. Export clean HTML or React when you are ready. Runs entirely in the browser, no API calls.",
    href: "/doodlewire",
    external: false,
    category: "Tool · Drawing · Local-only",
    appStoreUrl: "https://apps.apple.com/us/app/doodlewire/id6771274835",
  },
  {
    number: "03",
    key: "vector-paint",
    title: "Vector Paint",
    description:
      "Vector drawing in the browser. Sketch freehand, export SVG, print crisp at any size from sticker to poster.",
    href: "/vector-paint",
    external: false,
    category: "Tool · SVG · Drawing",
  },
  {
    number: "04",
    key: "icon-animator",
    title: "Icon Animator",
    description:
      "SVG icon animation presets with copy-ready CSS export. Pick an icon, pick a preset, tune the timing, ship. No install.",
    href: "/icon-animator",
    external: false,
    category: "Tool · Front-end",
  },
  {
    number: "05",
    key: "promptr",
    title: "Promptr",
    description:
      "A prompt workshop. Rubric-based scoring turns fuzzy prompts into specific ones before you spend tokens running them.",
    href: "/promptr",
    external: false,
    category: "Tool · AI · UX",
  },
  {
    number: "06",
    key: "spark",
    title: "Spark",
    description:
      "A learning platform built from a spark, to teach designers full-stack engineering. A course built for designers, by a designer, so they can build for themselves.",
    href: "/spark",
    external: false,
    category: "Product · Education · Solo-built",
  },
];

// Lighter projects, kept off the main proof grid so Work reads as premium
// software, but still visible for range.
const ALSO_BUILT: {
  number: string;
  title: string;
  description: string;
  href: string;
  external: boolean;
  category: string;
}[] = [
  {
    number: "01",
    title: "Tessera",
    description:
      "The Triangle Game. A two-player dice game on a hexagonal triangle grid.",
    href: "/tessera",
    external: false,
    category: "Game",
  },
  {
    number: "02",
    title: "Kids Alphabet",
    description:
      "An alphabet game for toddlers. Tap a letter, swipe, finish with a quick quiz.",
    href: "/kids-alphabet/",
    external: true,
    category: "Game · Education",
  },
  {
    number: "03",
    title: "Touchtype",
    description:
      "A touch-typing tutor with two modes. A playful course for kids learning their first home row, and a focused practice ground for adults who want to type without looking. Best on a real keyboard.",
    href: "/touchtype",
    external: false,
    category: "Tool · Education · Solo-built",
  },
];

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Subscribe",
    body: "Subscribe and the slot is yours. Two minutes, no call to book.",
  },
  {
    n: "02",
    title: "Request",
    body: "Drop requests in however suits you, a Loom, a doc, a sketch. I work them one at a time, in priority order. No intake meeting, no forms.",
  },
  {
    n: "03",
    title: "Receive",
    body: "Shipped, working, live on your domain. Most requests land in 2 to 4 working days. You review async and add the next one.",
  },
];

// The spine of the pitch: why one client, why async. The Avis line is the
// honest reason for async and lends product gravitas in the same breath.
const WHY_ONE: { title: string; body: string }[] = [
  {
    title: "Only your backlog.",
    body: "Most design subscriptions run a queue of thirty-plus clients and rotate between them. I don't. I take one. Your requests never sit behind a stranger's.",
  },
  {
    title: "Async by design.",
    body: "By day I'm a senior digital product designer at Avis Budget Group, so I work with you in focused blocks around it. No standing calls, no status meetings. You send work when it suits you and it's waiting when you're back.",
  },
  {
    title: "Design matches build.",
    body: "The person who designs it is the person who ships it. No handoff, no “the dev interpreted it differently,” no Figma file gathering dust.",
  },
];

// Selected client work, only the projects that can be shown publicly. No
// invented outcomes; these are real engagements with testimonials on the page.
const CLIENT_WORK: {
  client: string;
  discipline: string;
  year: string;
  body: string;
}[] = [
  {
    client: "Dan Roberts Group",
    discipline: "Branding",
    year: "2015",
    body: "Logo and brand identity for the fitness coach and his training business.",
  },
  {
    client: "Gatewick House & Gardens",
    discipline: "Brand identity + signage",
    year: "2025",
    body: "Identity and wayfinding signage for a historic house and gardens.",
  },
];

// Clients and experience strip, the minimalist CV device. Names and discipline
// only, no confidential artefacts. Avis and Banner of Truth are listed by name.
const CLIENTS: { name: string; note: string }[] = [
  { name: "Avis Budget Group", note: "Product design" },
  { name: "Banner of Truth", note: "Book covers + illustration" },
  { name: "Dan Roberts Group", note: "Branding · 2015" },
  { name: "Gatewick House & Gardens", note: "Brand identity + signage · 2025" },
];

const CAPABILITIES: {
  heading: string;
  note: string;
  items: string[];
}[] = [
  {
    heading: "Design",
    note: "From identity to interface.",
    items: [
      "Branding",
      "UI design",
      "Landing pages and marketing sites",
      "AI chat and AI product interfaces",
    ],
  },
  {
    heading: "Build",
    note: "Working product, not handoffs.",
    items: ["Web apps, shipped to your domain", "iOS apps"],
  },
];

const PLAN_FEATURES: string[] = [
  "One active request at a time, worked in priority order",
  "Design and build, by one person, start to finish",
  "Shipped to your domain in days, not months",
  "Async only, no calls, no meetings",
  "Pause or cancel anytime",
];

const TESTIMONIALS: { quote: string; name: string; org: string }[] = [
  {
    quote:
      "Neil turned work around at a pace I'd never seen from a studio, and it landed right the first time. The quality spoke for itself.",
    name: "Dan Roberts",
    org: "Dan Roberts Group",
  },
  {
    quote:
      "I handed over a rough brief and got back something far better than I'd pictured, far faster than I expected. Genuinely high-quality work.",
    name: "Guy Sanderson",
    org: "Gatewick House & Gardens",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can one person really design and build a whole product?",
    a: "Yes. Everything in the work above was built this way, solo, start to finish.",
  },
  {
    q: "Do you only design, or do you build too?",
    a: "Both. That's the whole point. The design and the working product come from the same hands.",
  },
  {
    q: "How fast is it?",
    a: "Most requests ship in 2 to 4 working days. Because I take one client at a time, your work isn't sitting behind anyone else's.",
  },
  {
    q: "How does a request work?",
    a: "Send it however's easiest, a Loom, a doc, a sketch. No forms, no intake call. I get on with it.",
  },
  {
    q: "Do we need to get on calls?",
    a: "No. It's async by design. That's what keeps it fast and keeps the time going into the work instead of meetings.",
  },
  {
    q: "What if I need changes?",
    a: "Revisions are part of it. I keep going until it's right.",
  },
  {
    q: "One request at a time, isn't that slow?",
    a: "It's the opposite. One focused request, shipped, then the next. Big builds get broken into a sequence, each piece live in days. Nothing stalls in a pile.",
  },
  {
    q: "What if I run out of things to build?",
    a: "Pause the plan. Billing freezes and picks up where it left off when you're ready.",
  },
];

export default function Homepage() {
  // One source of truth for the scarcity line and the primary action, so the
  // hero, pricing and final CTA stay in sync when the slot toggles.
  const slotLine = AVAILABILITY.open
    ? AVAILABILITY.openLine
    : AVAILABILITY.fullLine;
  const slotBadge = AVAILABILITY.open
    ? AVAILABILITY.openBadge
    : AVAILABILITY.fullBadge;
  const ctaLabel = AVAILABILITY.open ? "Claim the slot" : "Join the waitlist";
  const ctaHref = AVAILABILITY.open ? SUBSCRIBE_URL : WAITLIST_URL;

  // The portrait card, rendered twice: a smaller copy pulled up near the name
  // on mobile so the face is above the fold, and the large copy in the right
  // grid column on desktop. Only one is visible per breakpoint.
  const photoCard = (
    <div className="project-card-trace relative border-2 border-tan/50 hover:border-cream transition-colors duration-300 overflow-hidden aspect-square">
      <Image
        src="/me.png"
        alt="Neil McArdle"
        width={600}
        height={600}
        className="w-full h-full object-cover grayscale contrast-125"
        priority
      />
      {/* "Thinking..." label — LLM streaming aesthetic, a nod to the AI work. */}
      <div
        className="absolute top-5 left-5 flex items-center gap-2"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cream/80 animate-pulse" />
        <span className="thinking-shimmer text-[11px] font-medium tracking-wide">
          Thinking...
        </span>
      </div>
      {/* Social icons — floated bottom-right over the photo. */}
      <div
        className="absolute bottom-5 right-5 flex items-center gap-5"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}
      >
        <a
          href="https://www.linkedin.com/in/neilmcardle/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="inline-flex p-2 -m-2 text-cream hover:text-tan transition-colors"
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
          className="inline-flex p-2 -m-2 text-cream hover:text-tan transition-colors"
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
          className="inline-flex p-2 -m-2 text-cream hover:text-tan transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[rgb(15,15,17)] relative isolate overflow-hidden">
      {/* Ripple backdrop — vertical hairlines clustered on the left and
          dispersing right. Sits above the black bg but below everything
          else via -z-10 inside the isolated root stacking context. */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {RIPPLE_POSITIONS.map((x, i) => {
          const opacity = 0.14 - (i / (RIPPLE_POSITIONS.length - 1)) * 0.11;
          // Stagger the shimmer peak across lines (~80ms per line) so
          // the brightness wave sweeps left-to-right in ~1.5s.
          const delay = i * 0.08;
          return (
            <div
              key={i}
              className="ripple-line absolute top-0 bottom-0 w-px bg-cream"
              style={{
                left: `${x}%`,
                ["--ripple-base" as string]: opacity,
                animationDelay: `${delay}s`,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Year corner */}
      <div
        className="hidden sm:block fixed top-6 right-6 z-10 text-tan"
        style={{
          fontSize: "0.75rem",
          fontFamily: "var(--font-jetbrains-mono)",
          letterSpacing: "0.13em",
        }}
      >
        20
        <br />/<br />
        26
      </div>

      <div className="home-prose max-w-6xl mx-auto pl-6 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pt-12 sm:pt-24 lg:pt-12 pb-20">
        <header className="mb-10 sm:mb-20">
          {/* Eyebrow: logomark + hairline */}
          <div className="mb-5 sm:mb-8 flex items-center gap-4">
            <Image
              src="/dark-neil-mcardle-logomark.svg"
              alt="Neil McArdle"
              width={26}
              height={26}
              style={{ color: "transparent" }}
            />
            <div className="flex-1 h-[1px] bg-tan/50" />
          </div>

          {/* Hero grid — photo spans both rows on desktop so the link
              bar in row 2 col 1 aligns to the photo's bottom edge. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Left column is a flex-col so the hero can reorder per breakpoint
                via `order`. Mobile (base order-*): name, nav, portrait, headline,
                availability, CTA, then the explanation/buyer line below the fold.
                Desktop (lg:order-*) remaps to the original sequence and the
                portrait moves to the right grid column. */}
            <div className="flex flex-col">
              <h1
                className="order-1 lg:order-1"
                style={{
                  fontFamily: "var(--font-eb-garamond)",
                  fontSize: "clamp(2.25rem, 11vw, 4.5rem)",
                  fontWeight: 800,
                  // 240 letter-spacing units = 0.2em.
                  // Compensate for the trailing-space optical drift by
                  // padding the right edge by the same amount.
                  letterSpacing: "0.2em",
                  paddingRight: "0.24em",
                  lineHeight: "0.95",
                  textTransform: "none",
                  color: "var(--cream)",
                  marginBottom: "1.25rem",
                }}
              >
                NEIL
                <br />
                McARDLE
              </h1>
              {/* Section nav — WORK / PRICING only. ABOUT was dropped (the
                  section stays, it just isn't a nav target) and ART moved to the
                  footer so the homepage stays a single, leak-free sales argument. */}
              <nav
                aria-label="Primary"
                className="order-2 lg:order-2 flex gap-8 sm:gap-10"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.8125rem",
                  color: "var(--tan)",
                  textTransform: "uppercase",
                  letterSpacing: "0.13em",
                }}
              >
                <a href="#work" className="inline-block py-2 -my-2 hover:text-cream transition-colors">
                  WORK
                </a>
                <a href="#pricing" className="inline-block py-2 -my-2 hover:text-cream transition-colors">
                  PRICING
                </a>
              </nav>

              {/* Mobile-only portrait — pulled up near the name so the face is
                  visible above the fold on phones. Hidden on lg, where the right
                  grid column renders the large copy instead. */}
              <div className="order-3 lg:hidden mt-6 w-full max-w-[260px]">
                {photoCard}
              </div>

              {/* Positioning block — the value prop now leads with the offer
                  (design + build subscription) not the job title. */}
              <p
                className="order-4 lg:order-3 mt-4 sm:mt-6 text-cream"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "clamp(1.0625rem, 1.6vw, 1.375rem)",
                  lineHeight: 1.45,
                  fontWeight: 500,
                }}
              >
                Digital design and build, on subscription.
              </p>
              <p
                className="order-7 lg:order-4 mt-5 lg:mt-3 text-cream/70 max-w-md"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "clamp(0.9375rem, 1.2vw, 1.0625rem)",
                  lineHeight: 1.55,
                }}
              >
                I take on one client at a time and ship working product to your
                domain. Fast, async, no calls. Design and code from the same
                hands, so nothing gets lost in translation.
              </p>
              {/* Mobile-only CTA — a filled green button. Touch has no hover, so
                  the desktop hover-trace would leave it looking like a text link;
                  a solid fill gives a clear, large tap target instead. */}
              <a
                href="#pricing"
                className="order-6 lg:hidden group inline-flex items-center gap-2 mt-5 px-6 py-3.5 rounded-2xl bg-emerald-400 text-black active:bg-emerald-500 transition-colors whitespace-nowrap self-start"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                <span>{ctaLabel}</span>
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              {/* Primary CTA (desktop) — sits inside the title block under
                  the positioning copy. Hidden on mobile; the lg:hidden copy
                  above renders instead. */}
              <a
                href="#pricing"
                className="project-card-trace group relative hidden lg:order-5 lg:inline-flex items-center gap-2 mt-5 sm:mt-6 px-5 py-3 rounded-2xl border-2 border-transparent text-emerald-400 transition-colors duration-300 whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                <span>{ctaLabel}</span>
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>

              {/* Availability is the real lever on the price. Reads from the
                  single AVAILABILITY source so it never contradicts itself. */}
              <p
                className="order-5 lg:order-6 mt-5 self-start inline-flex items-center gap-2.5 rounded-full border border-tan/30 px-3.5 py-2 text-tan lg:border-0 lg:rounded-none lg:px-0 lg:py-0"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  className={
                    AVAILABILITY.open
                      ? "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                      : "w-1.5 h-1.5 rounded-full bg-tan/60"
                  }
                  aria-hidden="true"
                />
                {slotBadge}
              </p>
              <p
                className="order-8 lg:order-7 mt-3 text-cream/70 max-w-md"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                  lineHeight: 1.55,
                }}
              >
                Built for founders who'd rather ship than sit in scoping calls.
              </p>
            </div>

            {/* Desktop portrait — hidden on mobile, where the copy above renders
                a smaller copy near the name instead. */}
            <div className="hidden lg:block relative">{photoCard}</div>
          </div>
        </header>

        {/* Why this exists — the anti-studio contrast. Sets the problem before
            the process. */}
        <section className="mb-24 mt-8">
          <SectionHeader label="Why this exists" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border-2 border-tan/40 glass-tile-bg">
            <div className="relative p-8 sm:p-10 lg:p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-tan/40">
              <div
                className="text-tan mb-5"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                The usual way
              </div>
              <p
                className="text-cream/70"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "clamp(1rem, 1.6vw, 1.1875rem)",
                  lineHeight: 1.6,
                }}
              >
                Hire a studio and you get months of forms, calls, scoping decks
                and contracts before anyone touches the work, then a Figma file
                you still can't ship. Hire in-house and you're recruiting for a
                quarter. Either way you're managing people instead of shipping
                product.
              </p>
            </div>
            <div className="relative p-8 sm:p-10 lg:p-12 bg-cream/[0.02]">
              <div
                className="text-cream mb-5"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                With me
              </div>
              <p
                className="text-cream"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  lineHeight: 1.25,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                Subscribe. Send the request. Approve the working thing when it
                lands. That's the whole relationship.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mb-24 scroll-mt-12">
          <SectionHeader label="How it works" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div
                  className="text-tan mb-4"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.13em",
                  }}
                >
                  {s.n}
                </div>
                <h3
                  className="text-cream mb-3"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-cream/70"
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

        {/* Why one client at a time — the differentiator and the spine of the
            pitch. The Avis line makes the async claim honest and credible. */}
        <section id="why-one" className="mb-24 scroll-mt-12">
          <SectionHeader label="Why one client at a time" />
          <h3
            className="text-cream mb-10 -mt-2 max-w-2xl"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            I take one client at a time. You get my full focus.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10">
            {WHY_ONE.map((point, i) => (
              <div
                key={point.title}
                className="pt-6 border-t-2 border-tan/40"
              >
                <div
                  className="text-tan mb-4"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.13em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h4
                  className="text-cream mb-3"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "1.375rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {point.title}
                </h4>
                <p
                  className="text-cream/70"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                  }}
                >
                  {point.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Work — client outcomes first, self-built products second as proof of
            shipping velocity. Design credibility from clients, build credibility
            from the products below. */}
        <section id="work" className="mb-24 scroll-mt-12">
          <SectionHeader label="Work" />

          {/* Selected client work — only what can be shown publicly. */}
          <h3
            className="text-cream mb-6"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Selected client work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {CLIENT_WORK.map((c) => (
              <div
                key={c.client}
                className="rounded-2xl border-2 border-tan/40 bg-cream/[0.02] p-7 sm:p-8"
              >
                <div
                  className="text-tan mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>{c.discipline}</span>
                  <span className="text-tan/50">·</span>
                  <span>{c.year}</span>
                </div>
                <h4
                  className="text-cream mb-3"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "clamp(1.375rem, 2.6vw, 1.75rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
                  }}
                >
                  {c.client}
                </h4>
                <p
                  className="text-cream/70"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                  }}
                >
                  {c.body}
                </p>
              </div>
            ))}
          </div>

          {/* Clients and experience — the minimalist CV strip. Names and
              discipline only, no confidential artefacts. */}
          <div className="mb-16">
            <h3
              className="text-tan mb-5"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.6875rem",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              Clients and experience
            </h3>
            <ul className="border-t border-tan/25">
              {CLIENTS.map((c) => (
                <li
                  key={c.name}
                  className="flex items-baseline justify-between gap-4 py-3.5 border-b border-tan/25"
                >
                  <span
                    className="text-cream"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "1rem",
                      fontWeight: 500,
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    className="text-tan text-right shrink-0"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {c.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Built solo — proof of build velocity. Honestly labelled: these are
              my own products, not client work. */}
          <h3
            className="text-cream mb-8"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Built solo
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.number} project={p} />
            ))}
          </div>
        </section>

        {/* Capabilities — the scope boundary, curated to read as premium
            product and software work. Sits before Pricing so the offer is
            defined, then priced. */}
        <section id="scope" className="mb-24 scroll-mt-12">
          <SectionHeader label="What I make" />
          <div className="grid grid-cols-1 md:grid-cols-2">
            {CAPABILITIES.map((col, i) => (
              <div
                key={col.heading}
                className={
                  i === 1
                    ? "mt-10 pt-10 border-t-2 md:mt-0 md:pt-0 md:border-t-0 md:pl-12 md:border-l-2 border-tan/40"
                    : "md:pr-12"
                }
              >
                <h3
                  className="text-cream mb-1.5"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {col.heading}
                </h3>
                <p
                  className="text-tan mb-6"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                  }}
                >
                  {col.note}
                </p>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-baseline gap-3 text-cream/85"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "1rem",
                        lineHeight: 1.5,
                      }}
                    >
                      <span className="text-tan flex-shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Praise — real client quotes sit immediately before the price so the
            objection-handling happens before the number lands. */}
        <section id="praise" className="mb-24 scroll-mt-12">
          <SectionHeader label="Praise" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="relative rounded-2xl border-2 border-tan/40 glass-tile-bg p-8 sm:p-10"
              >
                <span
                  className="absolute top-4 left-6 text-tan/30 select-none"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "4rem",
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <blockquote
                  className="relative text-cream"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "clamp(1.25rem, 2.4vw, 1.625rem)",
                    lineHeight: 1.35,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex flex-col gap-1">
                  <span
                    className="text-cream"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                    }}
                  >
                    {t.name}
                  </span>
                  <span
                    className="text-tan"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.org}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Pricing — one price, public, no call. The Subscribe CTA points at
            SUBSCRIBE_URL (swap for a Stripe Payment Link). */}
        <section id="pricing" className="mb-24 scroll-mt-12">
          <SectionHeader label="Pricing" />
          <div className="relative isolate max-w-2xl mx-auto rounded-2xl border-2 border-tan/40 overflow-hidden bg-black">
            {/* Warm glow pooling top-right, same family as the comparison card
                so the priced moment feels lit, not flat. */}
            <div
              className="pointer-events-none absolute -z-10 -top-24 -right-20 w-80 h-80 rounded-full bg-cream/[0.06] blur-3xl"
              aria-hidden="true"
            />
            <div className="p-8 sm:p-10">
              {/* Header: plan name + pause pill */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    className="text-cream"
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Monthly
                  </h3>
                  <p
                    className="mt-1.5 text-tan"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                    }}
                  >
                    One client at a time. When the slot's yours, it's yours.
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full bg-tan px-3 py-1.5 text-black"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.625rem",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                  }}
                >
                  Pause anytime
                </span>
              </div>

              {/* Dotted divider */}
              <div className="my-7 border-t border-dashed border-tan/40" />

              {/* Price */}
              <div className="flex items-end flex-wrap gap-x-3 gap-y-1">
                <span
                  className="text-cream leading-none"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "clamp(2.75rem, 8vw, 4rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {PRICE.amount}
                </span>
                <span
                  className="text-tan mb-1.5"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.875rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  /month
                </span>
                <span
                  className="text-tan mb-2"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.625rem",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                  }}
                >
                  {PRICE.suffix}
                </span>
              </div>

              {/* Included panel — labelled inner surface, the centrepiece. */}
              <div className="relative mt-8 rounded-xl border border-tan/30 bg-cream/[0.02] p-6 sm:p-7">
                <span
                  className="absolute -top-2 left-5 bg-black px-2 text-tan"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
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
                        className="w-4 h-4 mt-0.5 flex-shrink-0 text-tan"
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

              {/* CTA — full width, inverts on hover like the rest of the site. */}
              <a
                href={ctaHref}
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 bg-emerald-400 text-black border-2 border-emerald-400 hover:bg-transparent hover:text-emerald-400 transition-colors"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                <span>{ctaLabel}</span>
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <p
                className="mt-3 text-center text-tan"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.08em",
                }}
              >
                Email, payment, you&apos;re in. Two minutes.
              </p>

              {/* Risk reversal */}
              <p
                className="mt-6 pt-5 border-t border-tan/20 text-cream/70"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                }}
              >
                Try it for a week. If it&apos;s not for you, cancel. No call to
                book, no notice to give.
              </p>
            </div>
          </div>
        </section>

        {/* About — solo as a feature, the Brett play. */}
        <section id="about" className="mb-24 scroll-mt-12">
          <SectionHeader label="About" />
          <h3
            className="text-cream mb-5 -mt-2"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            One designer, on purpose.
          </h3>
          <p
            className="text-cream/75"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "1.0625rem",
              lineHeight: 1.6,
            }}
          >
            You hire me, you get me. No account managers, no process to sit
            through, no meetings on the calendar. I design it and I build it,
            which is why it stays fast and the product stays coherent. I take one
            client at a time, so the work always has my full attention, not a
            slice of it.
          </p>
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
            className="text-cream mb-4"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem, 6vw, 3.25rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Got something to ship?
          </h2>
          <p
            className="text-cream/70 mb-8"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "1.0625rem",
              lineHeight: 1.5,
            }}
          >
            {slotLine} Two minutes to your first request.
          </p>
          <a
            href={ctaHref}
            className="project-card-trace group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-transparent text-emerald-400 transition-colors duration-300"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            <span>{ctaLabel}</span>
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </section>

        {/* Built for my kids — the games and kid-facing tools, grouped with
            the books strip as a quiet "more" area at the foot of the page. */}
        <section className="mb-12">
          <div className="flex items-center gap-8 mb-8">
            <h2
              className="text-tan"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              + Built for my kids
            </h2>
            <div className="flex-1 h-[2px] bg-tan/50" />
          </div>
          <div className="grid grid-cols-1 gap-2">
            {ALSO_BUILT.map((p) => (
              <AlsoBuiltRow key={p.number} item={p} />
            ))}
          </div>
        </section>

        {/* Also — books survive as a quiet personal note below the funnel.
            Paintings now live on their own page, linked as ART in the nav. */}
        <section className="mb-20">
          <div className="flex items-center gap-8 mb-10">
            <h2
              className="text-tan"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              + My eBooks and Audiobooks
            </h2>
            <div className="flex-1 h-[2px] bg-tan/50" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-5 sm:gap-6 p-4 sm:p-5">
              <div
                className="text-tan flex-shrink-0"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.13em",
                  paddingTop: "0.25rem",
                }}
              >
                01
              </div>
              <a
                href={SOL0_AUDIOBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sol0 on ElevenReader"
                className="group relative h-20 sm:h-24 aspect-[2/3] rounded-sm overflow-hidden border border-tan flex-shrink-0"
              >
                <Image
                  src="/books/sol0-part-one.png"
                  alt="Sol0 — Part One of Three cover"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="96px"
                />
              </a>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    className="text-cream/85 text-sm sm:text-[0.9375rem]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Sol0
                  </span>
                  <span
                    className="text-tan"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.625rem",
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                    }}
                  >
                    Sci-fi Novel
                  </span>
                </div>
                <p
                  className="text-cream/80 text-sm mt-1.5"
                  style={{ fontFamily: "var(--font-inter)", lineHeight: 1.5 }}
                >
                  He came to Mars expecting solitude. He found home.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <a
                    href={SOL0_AUDIOBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center py-2 -my-2 text-tan hover:text-cream transition-colors"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                    }}
                  >
                    Listen on ElevenReader
                    <svg
                      className="ml-1 w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden
                    >
                      <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>

                  {SOL0_EBOOK_URL && (
                    <a
                      href={SOL0_EBOOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center py-2 -my-2 text-tan hover:text-cream transition-colors"
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: "0.6875rem",
                        letterSpacing: "0.13em",
                        textTransform: "uppercase",
                      }}
                    >
                      Read the ebook
                      <svg
                        className="ml-1 w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden
                      >
                        <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  )}
                </div>

                <a
                  href="https://makeebook.ink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 py-1 -my-1 text-tan hover:text-cream transition-colors"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.625rem",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                  }}
                >
                  Made with makeEbook
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-12 border-t-2 border-tan/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
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
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-8 mb-12">
      <h2
        className="text-tan"
        style={{
          fontSize: "0.75rem",
          fontFamily: "var(--font-jetbrains-mono)",
          letterSpacing: "0.13em",
          textTransform: "uppercase",
        }}
      >
        + {label}
      </h2>
      <div className="flex-1 h-[2px] bg-tan/50" />
    </div>
  );
}

function AlsoBuiltRow({
  item,
}: {
  item: {
    number: string;
    title: string;
    description: string;
    href: string;
    external: boolean;
    category: string;
  };
}) {
  const inner = (
    <>
      <span
        className="text-tan flex-shrink-0"
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.13em",
          paddingTop: "0.15rem",
        }}
      >
        {item.number}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="text-cream"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}
          >
            {item.title}
          </span>
          <span
            className="text-tan"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.625rem",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            {item.category}
          </span>
        </div>
        <p
          className="text-cream/70 mt-1"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.875rem",
            lineHeight: 1.5,
          }}
        >
          {item.description}
        </p>
      </div>
      <svg
        className="w-4 h-4 mt-0.5 flex-shrink-0 text-tan group-hover:text-cream group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-[color,transform]"
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
    "group flex items-start gap-5 p-4 sm:p-5 rounded-xl border-2 border-transparent hover:border-tan/40 transition-colors";

  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={cls}>
      {inner}
    </Link>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const content = (
    <>
      <div className="flex items-start justify-between mb-4 gap-6">
        <div
          className="text-tan"
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.13em",
          }}
        >
          {project.number}
        </div>
        <svg
          className="w-4 h-4 text-tan group-hover:text-cream group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-[color,transform]"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
        <div className="flex-1 min-w-0">
          <h3
            className="text-cream mb-4"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {project.title}
          </h3>
          <p
            className="text-cream/70 max-w-2xl"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {project.description}
          </p>
        </div>
        <div className="lg:self-center lg:flex-shrink-0">
          <HomepageProjectPreview k={project.key} />
        </div>
      </div>
    </>
  );

  // Border + padding + hover sit on the outer wrapper so the link covers the
  // top content and the footer row (category + optional App Store badge)
  // lives below as its own row of siblings — that lets the badge be its own
  // clickable target without nesting an <a> inside an <a>.
  // Static border removed per design — only the project-card-trace::after
  // animation appears on hover. Keep border-2 with transparent color so the
  // box still reserves 2px on each side, preventing layout shift when the
  // trace overlay paints over the card edge.
  const wrapperClassName =
    "project-card-trace group relative block border-2 border-transparent rounded-2xl transition-colors duration-300 p-6 sm:p-8";

  const linkClassName = "block";

  const linkInner = project.external ? (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClassName}
    >
      {content}
    </a>
  ) : (
    <Link href={project.href} className={linkClassName}>
      {content}
    </Link>
  );

  const categoryEl = (
    <div
      className="text-tan"
      style={{
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: "0.6875rem",
        letterSpacing: "0.13em",
        textTransform: "uppercase",
      }}
    >
      {project.category}
    </div>
  );

  return (
    <div className={wrapperClassName}>
      {linkInner}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        {categoryEl}
        {project.appStoreUrl && (
          <a
            href={project.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download ${project.title} on the App Store`}
            className="group/ios inline-flex items-center gap-2 text-tan hover:text-cream transition-colors shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.6875rem",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              Download on iPhone &amp; iPad
            </span>
            <svg
              className="w-3 h-3 group-hover/ios:translate-x-0.5 group-hover/ios:-translate-y-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
