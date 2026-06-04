import Image from "next/image";
import Link from "next/link";
import { type ProjectKey } from "@/components/HomepageProjectPreview";
import ProfileCard from "@/components/ProfileCard";
import TestimonialDrawer from "@/components/TestimonialDrawer";

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
  body: string;
  // Background image filling the card behind the content, peeking out above the
  // panel. 1200x800 (3:2).
  image: string;
}[] = [
  {
    client: "Dan Roberts Group",
    discipline: "Branding",
    body: "Logo design for the fitness coach and his training business.",
    image: "/nuksoo-canvas.png",
  },
  {
    client: "Gatewick House & Gardens",
    discipline: "Branding",
    body: "Logo design and signage for a historic house & gardens.",
    image: "/gatewick-canvas.png",
  },
];

// Clients and experience strip, the minimalist CV device. Names and discipline
// only, no confidential artefacts. Avis and Banner of Truth are listed by name.
const CLIENTS: { name: string; note: string }[] = [
  { name: "Avis Budget Group", note: "Product design" },
  { name: "Banner of Truth", note: "Visual design" },
  { name: "Dan Roberts Group", note: "Branding" },
  { name: "Gatewick House & Gardens", note: "Branding" },
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
      "Neil is a talented designer who has an impressive work ethic.  He has assisted on number of key design projects for our brand and he over-delivers each and every time! Neil is a delight to work with and I can't recommend him enough.",
    name: "Dan Roberts",
    org: "Dan Roberts Group",
  },
  {
    quote:
      "I handed over a rough brief and got something far better than I'd pictured, and faster than I expected.",
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
  const photoCard = <ProfileCard clients={CLIENTS} />;

  return (
    <div className="min-h-screen bg-[rgb(15,15,17)] relative isolate overflow-hidden">
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
            <div className="flex-1 h-px bg-tan/30" />
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
              <div className="order-3 lg:hidden mt-6 w-full max-w-[440px]">
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
                className="gold-btn order-6 lg:hidden group inline-flex items-center gap-3 mt-5 pl-6 pr-2.5 py-2.5 rounded-full whitespace-nowrap self-start"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                <span>{ctaLabel}</span>
                <span className="gold-btn-badge w-7 h-7">
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
              {/* Primary CTA (desktop) — sits inside the title block under
                  the positioning copy. Hidden on mobile; the lg:hidden copy
                  above renders instead. */}
              <a
                href="#pricing"
                className="gold-btn gold-btn-trace group relative hidden lg:order-5 lg:inline-flex self-start items-center gap-3 mt-5 sm:mt-6 pl-6 pr-2.5 py-2.5 rounded-full whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                <span>{ctaLabel}</span>
                <span className="gold-btn-badge w-7 h-7">
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
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
          <div className="soft-card relative grid grid-cols-1 lg:grid-cols-2 rounded-[1.5rem] overflow-hidden">
            <div className="relative p-8 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10">
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
          <div className="soft-card grid grid-cols-1 sm:grid-cols-3 rounded-[1.5rem] overflow-hidden">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={`relative p-8 sm:p-10 lg:p-12 border-white/10 ${
                  i < STEPS.length - 1
                    ? "border-b sm:border-b-0 sm:border-r"
                    : ""
                }`}
              >
                <div
                  className="text-gold mb-4"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.13em",
                    fontWeight: 600,
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
          <div className="soft-card grid grid-cols-1 md:grid-cols-3 rounded-[1.5rem] overflow-hidden">
            {WHY_ONE.map((point, i) => (
              <div
                key={point.title}
                className={`relative p-8 sm:p-10 lg:p-12 border-white/10 ${
                  i < WHY_ONE.length - 1
                    ? "border-b md:border-b-0 md:border-r"
                    : ""
                }`}
              >
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16 items-start">
            {CLIENT_WORK.map((c) => {
              // Each client's testimonial sits directly beneath their work card.
              const testimonial = TESTIMONIALS.find((t) => t.org === c.client);
              return (
              <div key={c.client} className="flex flex-col">
              {/* Layered "tucked" card: the outer soft-card is the frame; an inset
                  image sits at the top and peeks out behind a second raised panel
                  that overlaps it and carries the text on a solid, legible surface.
                  Sits above the testimonial drawer (z-10) so the drawer tucks
                  behind its bottom edge. */}
              <div className="soft-card group relative z-10 rounded-[1.5rem] p-3 sm:p-3.5">
                {/* Inset image — framed inside the outer border, peeking out the
                    top behind the panel below. */}
                <div className="relative aspect-[3/2] rounded-[1.05rem] overflow-hidden border border-white/10">
                  {/* Blurred ambient backdrop — a soft version of the brand image. */}
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover scale-110 blur-[3px]"
                  />
                  {/* Film grain — clipped to the image, leaving the panel clean. */}
                  <div className="img-grain absolute inset-0 pointer-events-none" aria-hidden="true" />
                  {/* Pocket: the crisp brand image on a single card, peeking from
                      behind the panel below. */}
                  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="soft-card absolute left-1/2 bottom-0 h-[88%] w-[56%] -translate-x-1/2 translate-y-[16%] origin-bottom rotate-[5deg] rounded-2xl overflow-hidden">
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 60vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                {/* Foreground panel — raised, opaque, overlaps the image so it
                    hides its lower portion and the image reads as tucked behind. */}
                <div className="soft-card relative z-10 -mt-12 rounded-[1.15rem] p-6 sm:p-7 shadow-[0_-10px_24px_-10px_rgba(0,0,0,0.7)]">
                  <div
                    className="text-tan mb-3"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                    }}
                  >
                    {c.discipline}
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
              </div>
              {/* Matching testimonial — a collapsible drawer tucked behind the
                  work card above; the handle pulls the quote down. */}
              {testimonial && (
                <TestimonialDrawer
                  quote={testimonial.quote}
                  name={testimonial.name}
                  org={testimonial.org}
                />
              )}
              </div>
              );
            })}
          </div>

          {/* Clients and experience now lives in the bottom sheet of the hero
              portrait card (ProfileCard), raised via the toggle chip, so it is
              no longer duplicated as a strip here. */}

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
          <div className="grid grid-cols-1 gap-2">
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
          <div className="soft-card grid grid-cols-1 md:grid-cols-2 rounded-[1.5rem] overflow-hidden">
            {CAPABILITIES.map((col, i) => (
              <div
                key={col.heading}
                className={`relative p-8 sm:p-10 lg:p-12 border-white/10 ${
                  i === 0 ? "border-b md:border-b-0 md:border-r" : ""
                }`}
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
                      <span className="text-gold flex-shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing — one price, public, no call. The Subscribe CTA points at
            SUBSCRIBE_URL (swap for a Stripe Payment Link). */}
        <section id="pricing" className="mb-24 scroll-mt-12">
          <SectionHeader label="Pricing" />
          <div className="soft-card relative isolate max-w-2xl mx-auto rounded-[1.75rem] overflow-hidden">
            {/* Warm gold glow pooling top-right so the priced moment feels lit,
                not flat — the accent that anchors the whole soft-UI palette. */}
            <div
              className="pointer-events-none absolute -z-10 -top-24 -right-20 w-80 h-80 rounded-full bg-gold/[0.10] blur-3xl"
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
                  className="shrink-0 rounded-full px-3 py-1.5 text-gold border border-gold/30 bg-gold/10"
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
              <div className="my-7 border-t border-dashed border-white/15" />

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
              <div className="soft-inset relative mt-8 rounded-[1rem] p-6 sm:p-7">
                <span
                  className="absolute -top-2 left-5 bg-[#1a1a1d] px-2 text-gold"
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

              {/* CTA — full width, inverts on hover like the rest of the site. */}
              <a
                href={ctaHref}
                className="gold-btn gold-btn-trace group mt-8 flex w-full items-center justify-center gap-3 rounded-full px-8 py-4"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                <span>{ctaLabel}</span>
                <span className="gold-btn-badge w-7 h-7">
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
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
            className="gold-btn gold-btn-trace group relative inline-flex items-center justify-center gap-3 pl-8 pr-2.5 py-3.5 rounded-full"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            <span>{ctaLabel}</span>
            <span className="gold-btn-badge w-8 h-8">
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </a>
        </section>

        {/* Built for my kids — the games and kid-facing tools, grouped with
            the books strip as a quiet "more" area at the foot of the page. */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="icon-chip w-9 h-9">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 12h4M9 10v4M15 11.5h.01M17.5 13h.01" />
                <path d="M17.5 6h-11A4.5 4.5 0 002 10.5v.5l1.2 5.3A2.4 2.4 0 005.6 18c.9 0 1.7-.5 2.1-1.3L8.4 15h7.2l.7 1.7c.4.8 1.2 1.3 2.1 1.3a2.4 2.4 0 002.4-1.7L22 11v-.5A4.5 4.5 0 0017.5 6z" />
              </svg>
            </span>
            <h2
              className="text-tan"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              Built for my kids
            </h2>
            <div className="flex-1 h-px bg-tan/30" />
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
          <div className="flex items-center gap-4 mb-10">
            <span className="icon-chip w-9 h-9">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 5.5A2.5 2.5 0 016.5 3H12v16H6.5A2.5 2.5 0 004 21.5z" />
                <path d="M20 5.5A2.5 2.5 0 0017.5 3H12v16h5.5a2.5 2.5 0 012.5 2.5z" />
              </svg>
            </span>
            <h2
              className="text-tan"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              My eBooks and Audiobooks
            </h2>
            <div className="flex-1 h-px bg-tan/30" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="soft-card rounded-[1.25rem] flex items-start gap-5 sm:gap-6 p-5 sm:p-6">
              <div
                className="text-gold flex-shrink-0"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.13em",
                  fontWeight: 600,
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
                className="relative h-20 sm:h-24 aspect-[2/3] rounded-md overflow-hidden border border-white/10 flex-shrink-0 transition-[transform,box-shadow] duration-300 ease-out hover:scale-[1.06] hover:-rotate-[4deg] hover:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.75)]"
              >
                <Image
                  src="/books/sol0-part-one.png"
                  alt="Sol0 — Part One of Three cover"
                  fill
                  className="object-cover"
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

        <footer className="pt-12 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
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

// Per-section glyph for the gold icon chip beside each section title, matching
// the soft-UI sheet (lightbulb for "why", gear for process, etc.). Falls back
// to a small plus mark so a new section without a mapped icon still renders.
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
          fontFamily: "var(--font-jetbrains-mono)",
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
        className="text-gold flex-shrink-0"
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.13em",
          fontWeight: 600,
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
        className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold group-hover:text-gold-bright group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-[color,transform]"
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
    "group flex items-start gap-5 p-4 sm:p-5 rounded-xl border border-transparent hover:border-gold/30 hover:bg-white/[0.025] transition-colors";

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
  // Minimal row, matching the "Built for my kids" list (AlsoBuiltRow): number,
  // title + category tag inline, description, and a hover arrow. The logo
  // previews were dropped in this redesign.
  const inner = (
    <>
      <span
        className="text-gold flex-shrink-0"
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.13em",
          fontWeight: 600,
          paddingTop: "0.15rem",
        }}
      >
        {project.number}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="text-cream"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}
          >
            {project.title}
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
            {project.category}
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
          {project.description}
        </p>
      </div>
      <svg
        className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold group-hover:text-gold-bright group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-[color,transform]"
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

  const rowCls =
    "group flex items-start gap-5 p-4 sm:p-5 rounded-xl border border-transparent hover:border-gold/30 hover:bg-white/[0.025] transition-colors";

  const row = project.external ? (
    <a href={project.href} target="_blank" rel="noopener noreferrer" className={rowCls}>
      {inner}
    </a>
  ) : (
    <Link href={project.href} className={rowCls}>
      {inner}
    </Link>
  );

  if (!project.appStoreUrl) return row;

  // DoodleWire is the only Built-solo project live on the App Store. Keep the
  // store link as a compact secondary CTA below the row, indented under the
  // text column, so it stays its own clickable target (no nested <a>).
  return (
    <div>
      {row}
      <a
        href={project.appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Download ${project.title} on the App Store`}
        className="group/ios -mt-2 ml-[3.25rem] sm:ml-[3.5rem] mb-1 inline-flex items-center gap-2 text-tan hover:text-cream transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.625rem",
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
    </div>
  );
}
