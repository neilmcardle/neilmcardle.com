import Image from "next/image";
import Link from "next/link";
import { HomepageProjectPreview, type ProjectKey } from "@/components/HomepageProjectPreview";
import { PAINTINGS } from "./paintings/paintings";

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
  {
    number: "07",
    key: "touchtype",
    title: "Touchtype",
    description:
      "A touch-typing tutor with two modes. A playful course for kids learning their first home row, and a focused practice ground for adults who want to type without looking. Best on a real keyboard.",
    href: "/touchtype",
    external: false,
    category: "Tool · Education · Solo-built",
  },
  {
    number: "08",
    key: "kids-alphabet",
    title: "Kids Alphabet",
    description:
      "An alphabet game for toddlers. Tap a letter, swipe to the next, finish with a quick quiz. Mobile-first, so it works on tiny fingers.",
    href: "/kids-alphabet/",
    external: true,
    category: "Tool · Education · Solo-built",
  },
];

export default function Homepage() {
  return (
    <div className="min-h-screen bg-black relative isolate overflow-hidden">
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
              className="ripple-line absolute top-0 bottom-0 w-px bg-[#fbf9f3]"
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
        className="hidden sm:block fixed top-6 right-6 z-10 text-[#8a7f70]"
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

      <div className="max-w-6xl mx-auto pl-6 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pt-12 sm:pt-24 lg:pt-12 pb-20">
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
            <div className="flex-1 h-[1px] bg-[#8a7f70]/50" />
          </div>

          {/* Hero grid — photo spans both rows on desktop so the link
              bar in row 2 col 1 aligns to the photo's bottom edge. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div>
              <h1
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
                  color: "#fbf9f3",
                  marginBottom: "1.25rem",
                }}
              >
                NEIL
                <br />
                McARDLE
              </h1>
              <div
                className="flex gap-12 sm:gap-16"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.8125rem",
                  color: "#8a7f70",
                  textTransform: "uppercase",
                  letterSpacing: "0.13em",
                }}
              >
                <span>ARTIST</span>
                <span>|                                                                                                                                                             </span>
                <span>DESIGNER</span>
              </div>
              {/* Primary CTA — desktop sits inside the title block under
                  ARTIST/DESIGNER; on mobile the matching copy below the
                  photo is shown instead (see lg:hidden sibling). */}
              <a
                href="https://www.cal.eu/neilmca"
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden lg:inline-flex items-center gap-2 mt-4 sm:mt-6 px-5 py-3 border-2 border-[#fbf9f3]/80 text-[#fbf9f3] hover:bg-[#fbf9f3] hover:border-[#fbf9f3] hover:text-black transition-all whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Book a call</span>
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="relative max-w-[360px] lg:max-w-none">
              <div className="project-card-trace relative border-2 border-[#8a7f70]/50 hover:border-[#fbf9f3] transition-all duration-300 overflow-hidden aspect-square">
                <Image
                  src="/me.png"
                  alt="Neil McArdle"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover grayscale contrast-125"
                  priority
                />
                {/* "Thinking..." label — LLM streaming aesthetic, a nod to
                    the AI work. Pulsing dot + shimmering text, transparent
                    so it floats over the photo. */}
                <div
                  className="absolute top-5 left-5 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fbf9f3]/80 animate-pulse" />
                  <span className="thinking-shimmer text-[11px] font-medium tracking-wide">
                    Thinking...
                  </span>
                </div>
                {/* Social icons — floated bottom-right over the photo.
                    Light shadow so they stay legible on any tone. */}
                <div
                  className="absolute bottom-5 right-5 flex items-center gap-5"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}
                >
                  <a
                    href="https://www.linkedin.com/in/neilmcardle/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-[#fbf9f3] hover:text-[#8a7f70] transition-colors"
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
                    className="text-[#fbf9f3] hover:text-[#8a7f70] transition-colors"
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
                    className="text-[#fbf9f3] hover:text-[#8a7f70] transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile-only copy of the primary CTA — sits below the photo
                cell in the stacked single-column layout. Desktop hides this
                copy and shows the inline one inside the title block. */}
            <a
              href="https://www.cal.eu/neilmca"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex lg:hidden items-center gap-2 px-5 py-3 border-2 border-[#fbf9f3]/80 text-[#fbf9f3] hover:bg-[#fbf9f3] hover:border-[#fbf9f3] hover:text-black transition-all whitespace-nowrap self-start"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Book a call</span>
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </header>

        <section className="mb-20 mt-16">
          <div className="flex items-center gap-8 mb-12">
            <div
              className="text-[#8a7f70]"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
              }}
            >
              + DIGITAL PRODUCTS
            </div>
            <div className="flex-1 h-[2px] bg-[#8a7f70]/50" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.number} project={p} />
            ))}
          </div>
        </section>

        {/* Paintings teaser — compact social-card style. Backs the ARTIST
            claim in the hero without taking over the homepage. Links to
            /paintings for the full statement. */}
        <section className="mb-20 mt-16">
          <div className="flex items-center gap-8 mb-10">
            <div
              className="text-[#8a7f70]"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              + Oil Paintings
            </div>
            <div className="flex-1 h-[2px] bg-[#8a7f70]/50" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {PAINTINGS.filter((p) => p.featured).map((p, i) => (
              <Link
                key={p.slug}
                href="/paintings"
                className="group flex items-center gap-5 sm:gap-6 border-2 border-[#8a7f70]/50 hover:border-[#fbf9f3] transition-all duration-300 p-4 sm:p-5"
              >
                <div
                  className="text-[#8a7f70] flex-shrink-0"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.13em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#8a7f70] flex-shrink-0">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="flex items-center gap-3 flex-wrap text-[#fbf9f3]/85 text-sm sm:text-[0.9375rem]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    <span>{p.title}</span>
                    {p.status === "sold" && (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500" aria-hidden />
                        <span
                          className="text-[#fbf9f3]/70"
                          style={{
                            fontSize: "0.625rem",
                            fontFamily: "var(--font-jetbrains-mono)",
                            letterSpacing: "0.13em",
                            textTransform: "uppercase",
                          }}
                        >
                          Sold
                        </span>
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[#8a7f70] mt-1"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                    }}
                  >
                    Painting · Oils · On Board
                  </div>
                </div>
                <span
                  className="text-[#8a7f70] group-hover:text-[#fbf9f3] group-hover:translate-x-1 transition-all flex-shrink-0 text-lg"
                  aria-hidden
                >
                  →
                </span>
              </Link>
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
          <div className="flex items-center gap-5 order-first sm:order-none mx-auto sm:mx-0">
            <a
              href="https://www.linkedin.com/in/neilmcardle/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[#8a7f70] hover:text-[#fbf9f3] transition-colors"
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
              className="text-[#8a7f70] hover:text-[#fbf9f3] transition-colors"
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
              className="text-[#8a7f70] hover:text-[#fbf9f3] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
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

function ProjectCard({ project }: { project: Project }) {
  const content = (
    <>
      <div className="flex items-start justify-between mb-4 gap-6">
        <div
          className="text-[#8a7f70]"
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.13em",
          }}
        >
          {project.number}
        </div>
        <svg
          className="w-4 h-4 text-[#8a7f70] group-hover:text-[#fbf9f3] group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all"
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
          <h2
            className="text-[#fbf9f3] mb-4"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {project.title}
          </h2>
          <p
            className="text-[#fbf9f3]/70 max-w-2xl"
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
  const wrapperClassName =
    "project-card-trace group relative block border-2 border-[#8a7f70]/50 hover:border-[#fbf9f3] transition-all duration-300 p-6 sm:p-8";

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
      className="text-[#8a7f70]"
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
            className="inline-flex shrink-0 transition-opacity hover:opacity-85"
          >
            <Image
              src="/apple-download.png"
              alt="Download on the App Store"
              width={132}
              height={45}
              priority={false}
            />
          </a>
        )}
      </div>
    </div>
  );
}
