import Image from "next/image";
import Link from "next/link";

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
  title: string;
  description: string;
  href: string;
  external: boolean;
  category: string;
}

const PROJECTS: Project[] = [
  {
    number: "01",
    title: "makeEbook",
    description:
      "AI-first eBook creation platform. Conversational writing assistant with multi-turn context, Claude API under the hood, designed and built solo.",
    href: "https://makeebook.ink",
    external: true,
    category: "Product · AI · Solo-built",
  },
  {
    number: "02",
    title: "Icon Animator",
    description:
      "SVG icon animation presets with copy-ready CSS export. Pick an icon, pick a preset, tune the timing, ship. No install.",
    href: "/icon-animator",
    external: false,
    category: "Tool · Front-end",
  },
  {
    number: "03",
    title: "Promptr",
    description:
      "A prompt workshop. Rubric-based scoring turns fuzzy prompts into specific ones before you spend tokens running them.",
    href: "/promptr",
    external: false,
    category: "Tool · AI · UX",
  },
];

// Color lives on a className (`text-white`) not inline, so `hover:text-black`
// can actually win. Inline `color` beats any Tailwind hover variant.
const LINK_BUTTON_STYLE = {
  fontFamily: "var(--font-inter)",
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

export default function Homepage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative isolate overflow-hidden">
      {/* Ripple backdrop — vertical hairlines clustered on the left and
          dispersing right. Sits above the black bg but below everything
          else via -z-10 inside the isolated root stacking context. */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {RIPPLE_POSITIONS.map((x, i) => {
          const opacity = 0.14 - (i / (RIPPLE_POSITIONS.length - 1)) * 0.11;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-white"
              style={{ left: `${x}%`, opacity }}
            />
          );
        })}
      </div>

      {/* Year corner */}
      <div
        className="fixed top-6 right-6 z-10 text-white/40"
        style={{
          fontSize: "0.75rem",
          fontFamily: "var(--font-inter)",
          letterSpacing: "0.05em",
        }}
      >
        20
        <br />/<br />
        26
      </div>

      <div className="max-w-6xl mx-auto pl-6 lg:pl-16 pr-6 md:pr-12 lg:pr-16 pt-24 lg:pt-12 pb-20">
        <header className="mb-20">
          {/* Eyebrow: logomark + hairline */}
          <div className="mb-8 flex items-center gap-4">
            <Image
              src="/dark-neil-mcardle-logomark.svg"
              alt="Neil McArdle"
              width={26}
              height={26}
              className="opacity-50"
              style={{ color: "transparent" }}
            />
            <div className="flex-1 h-[1px] bg-white/20" />
          </div>

          {/* Hero grid — photo spans both rows on desktop so the link
              bar in row 2 col 1 aligns to the photo's bottom edge. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(3rem, 10vw, 4.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: "0.9",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  marginBottom: "1.5rem",
                }}
              >
                NEIL
                <br />
                MCARDLE
              </h1>
              <div className="border-2 border-white/80 p-6">
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.8125rem",
                    color: "#ffffff",
                    lineHeight: "1.6",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Product Designer | UK
                </p>
              </div>
            </div>

            <div className="relative lg:row-span-2 max-w-[360px] lg:max-w-none">
              <div className="border-4 border-white/80 overflow-hidden aspect-square">
                <Image
                  src="/me.png"
                  alt="Neil McArdle"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover grayscale contrast-125"
                  priority
                />
              </div>
              {/* "Thinking..." label — LLM streaming aesthetic, a nod to
                  the AI work. Pulsing dot + shimmering text, transparent
                  so it floats over the photo. */}
              <div
                className="absolute top-5 left-5 flex items-center gap-2"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                <span className="thinking-shimmer text-[11px] font-medium tracking-wide">
                  Thinking...
                </span>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 border-white flex items-center justify-center bg-white">
                <Image
                  src="/neil-mcardle-logomark.svg"
                  alt="Neil McArdle mark"
                  width={64}
                  height={64}
                  className="w-16 h-16"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:self-end">
              <a
                href="https://www.linkedin.com/in/neilmcardle/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 border-2 border-white/80 text-white hover:bg-white hover:text-black transition-all"
                style={LINK_BUTTON_STYLE}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://github.com/neilmcardle"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 border-2 border-white/80 text-white hover:bg-white hover:text-black transition-all"
                style={LINK_BUTTON_STYLE}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://x.com/BetterNeil"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 border-2 border-white/80 text-white hover:bg-white hover:text-black transition-all"
                style={LINK_BUTTON_STYLE}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X</span>
              </a>
              {/* Primary CTA — filled so it reads as an action, not another
                  profile link. Sits last in the wrap so it stays grouped
                  with the social links on desktop. */}
              <a
                href="https://www.cal.eu/neilmca"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 border-2 border-white bg-white text-black hover:bg-transparent hover:text-white transition-all"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
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
          </div>
        </header>

        <section className="mb-20 mt-16">
          <div className="flex items-center gap-8 mb-12">
            <div
              className="text-white/40"
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-inter)",
                letterSpacing: "0.1em",
              }}
            >
              + SELECTED WORK
            </div>
            <div className="flex-1 h-[2px] bg-white/20" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.number} project={p} />
            ))}
          </div>
        </section>

        <footer className="pt-12 border-t-2 border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p
            className="text-white/40"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}
          >
            © 2026 Neil McArdle
          </p>
          <a
            href="mailto:neil@neilmcardle.com"
            className="text-white/60 hover:text-white transition-colors"
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
          className="text-white/40"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
          }}
        >
          {project.number}
        </div>
        <svg
          className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2
        className="text-white mb-4"
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
        className="text-white/60 max-w-2xl mb-4"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "0.875rem",
          lineHeight: 1.6,
        }}
      >
        {project.description}
      </p>
      <div
        className="text-white/40"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "0.6875rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        {project.category}
      </div>
    </>
  );

  const className =
    "project-card-trace group relative block border-2 border-white/30 hover:border-white transition-all duration-300 p-6 sm:p-8";

  if (project.external) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={project.href} className={className}>
      {content}
    </Link>
  );
}
