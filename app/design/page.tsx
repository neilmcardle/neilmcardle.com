import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Design System · Neil McArdle",
  description:
    "The visual language of neilmcardle.com, documented. Primitives, semantics and component tokens, exactly as the site ships.",
};

// The /design route documents the homepage's soft-UI dark language. Every value
// here is lifted from app/globals.css, tailwind.config.ts and app/page.tsx. The
// page reuses the shipped classes (soft-card, soft-inset, icon-chip, gold-btn,
// img-grain) rather than re-implementing them. Static, no client JS; the only
// motion is CSS (the gold trace rests/hovers, easing dots loop) and is paused
// under prefers-reduced-motion.

const GARAMOND = "var(--font-eb-garamond)";
const PLAYFAIR = "var(--font-playfair)";
const INTER = "var(--font-inter)";
const MONO = "var(--font-jetbrains-mono)";
const TAN = "var(--tan)";

const mono = (size: number, color: string, weight = 400, tracking = 0.13): CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  letterSpacing: `${tracking}em`,
  textTransform: "uppercase",
  color,
  fontWeight: weight,
  margin: 0,
});

// Mono used for spec strips and inline tokens. Same face, but mixed-case and
// tighter, so values like "cubic-bezier(.32,.72,0,1)" stay readable.
const specMono = (color = TAN): CSSProperties => ({
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: "0.02em",
  lineHeight: 1.5,
  color,
  margin: 0,
});

const HAIRLINE = "1px solid rgba(158,148,130,0.15)";

function Logomark({ size = 26, color = "var(--cream)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 78 78" fill={color} aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M0,0v76.8c0,.5.4,1,1,1h37c.5,0,1-.4,1-1v-37.8L0,0Z" />
      <path d="M78,78V1.2c0-.5-.4-1-1-1h-37c-.5,0-1,.4-1,1v37.8l39,39Z" />
    </svg>
  );
}

function Spark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.6 6.4L20 11l-6.4 1.6L12 19l-1.6-6.4L4 11l6.4-1.6L12 3z" />
    </svg>
  );
}

function Chevron({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function Section({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <section id={id} style={{ marginTop: "clamp(72px, 12vw, 112px)", scrollMarginTop: 24 }}>
      {children}
    </section>
  );
}

function SectionHeader({ index, eyebrow, title, intro }: { index: string; eyebrow: string; title: string; intro: string }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 18 }}>
        <span className="icon-chip" style={{ width: 36, height: 36, ...mono(12, "var(--gold)", 600) }}>
          {index}
        </span>
        <span style={mono(11, TAN)}>{eyebrow}</span>
      </div>
      <h2 style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", lineHeight: 1.2, color: "var(--cream)", margin: 0, textWrap: "balance" }}>
        {title}
      </h2>
      <p style={{ fontFamily: INTER, fontSize: 16, lineHeight: 1.6, color: "rgba(251,249,243,0.7)", maxWidth: 560, marginTop: 14, marginBottom: 0, textWrap: "pretty" }}>
        {intro}
      </p>
    </div>
  );
}

// Small caps eyebrow used to label sub-groups (e.g. "Primitives · Brand").
function GroupLabel({ children }: { children: ReactNode }) {
  return <p style={{ ...mono(11, TAN), marginBottom: 16 }}>{children}</p>;
}

function SpecStrip({ lines }: { lines: string[] }) {
  return (
    <div style={{ marginTop: 20 }}>
      {lines.map((l, i) => (
        <p key={i} style={{ ...specMono(), padding: "8px 0", borderTop: i === 0 ? "none" : HAIRLINE }}>
          {l}
        </p>
      ))}
    </div>
  );
}

const NAV = [
  { n: "01", label: "Logo", href: "#logo" },
  { n: "02", label: "Voice", href: "#voice" },
  { n: "03", label: "Colour", href: "#color" },
  { n: "04", label: "Type", href: "#type" },
  { n: "05", label: "Space", href: "#space" },
  { n: "06", label: "Components", href: "#components" },
  { n: "07", label: "Motion", href: "#motion" },
  { n: "08", label: "Imagery", href: "#imagery" },
];

const BRAND = [
  { name: "--cream", value: "#FBF9F3", note: "primary text" },
  { name: "--tan", value: "#9E9482", note: "muted labels · ~7:1" },
  { name: "--gold", value: "#D8B46A", note: "resting accent" },
  { name: "--gold-bright", value: "#F0D091", note: "highlight stop" },
  { name: "--gold-deep", value: "#B8923F", note: "shadow stop" },
  { name: "ink-on-gold", value: "#2A1E06", note: "text on gold" },
];

const SURFACES = [
  { name: "page", value: "#0F0F11", note: "rgb(15,15,17)" },
  { name: "recessed", value: "#0D0D0F", note: "soft-inset" },
  { name: "card-base", value: "#141416", note: "gradient dark stop" },
  { name: "card-light", value: "#1B1B1E", note: "gradient lit stop" },
  { name: "label-patch", value: "#1A1A1D", note: "inset border labels" },
  { name: "chip-light", value: "#202024", note: "icon-chip lit stop" },
];

const ROLES = [
  { c: "var(--cream)", role: "text / primary", d: "cream · headings, names, emphasis" },
  { c: "rgba(251,249,243,0.7)", role: "text / body", d: "cream @ 70–75% · running prose" },
  { c: "rgba(251,249,243,0.85)", role: "text / emphasis", d: "cream @ 85% · list items, dense copy" },
  { c: "var(--tan)", role: "text / muted", d: "tan · mono labels, captions, metadata" },
  { c: "var(--gold)", role: "text / accent", d: "gold · index numbers, active labels, glyphs" },
  { c: "linear-gradient(145deg, #1B1B1E 0%, #141416 100%)", role: "surface / raised", d: "145° gradient #1B1B1E → #141416 · cards" },
  { c: "#0D0D0F", role: "surface / recessed", d: "#0D0D0F · pressed-in panels, image wells" },
  { c: "rgba(255,255,255,0.08)", role: "border / hairline", d: "white @ 4.5–10% · card rims, frames" },
  { c: "rgba(158,148,130,0.25)", role: "border / muted", d: "tan @ 20–30% · dividers, quiet pills" },
  { c: "rgba(216,180,106,0.3)", role: "border / accent", d: "gold @ 30% over gold @ 10% fill · badges" },
];

const SCALE: { spec: string; render: ReactNode }[] = [
  { spec: "display · clamp(36→72px) · garamond 800", render: <span style={{ fontFamily: GARAMOND, fontWeight: 800, fontSize: "clamp(2.25rem, 6vw, 4.5rem)", lineHeight: 1.02, color: "var(--cream)" }}>NEIL McARDLE</span> },
  { spec: "h2 section · clamp(28→40px) · playfair 700", render: <span style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--cream)" }}>Why this exists</span> },
  { spec: "h3 card title · 22–28px · playfair 700", render: <span style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: "1.5rem", color: "var(--cream)" }}>Only your backlog.</span> },
  { spec: "lede · clamp(17→22px) · inter · lh 1.45", render: <span style={{ fontFamily: INTER, fontSize: "clamp(1.0625rem, 1.6vw, 1.375rem)", lineHeight: 1.45, color: "rgba(251,249,243,0.85)" }}>Digital design and build, on subscription.</span> },
  { spec: "body · 15–16px · inter · lh 1.6", render: <span style={{ fontFamily: INTER, fontSize: 15, lineHeight: 1.6, color: "rgba(251,249,243,0.7)" }}>Send it however&rsquo;s easiest, a Loom, a doc, a sketch. No forms, no intake call.</span> },
  { spec: "small · 14px · inter · lh 1.5", render: <span style={{ fontFamily: INTER, fontSize: 14, lineHeight: 1.5, color: "rgba(251,249,243,0.7)" }}>Email, payment, you&rsquo;re in. Two minutes.</span> },
  { spec: "label lg · 12–13px · mono · 0.13em", render: <span style={mono(13, "var(--cream)", 600)}>Selected client work</span> },
  { spec: "label · 11px · mono · 0.13em", render: <span style={mono(11, TAN)}>Clients and experience</span> },
  { spec: "micro · 10px · mono · 0.13em", render: <span style={mono(10, TAN)}>Product · AI · Solo-built</span> },
];

const SPACING = [
  { v: 8, note: "inline gaps, icon-to-label" },
  { v: 16, note: "within components" },
  { v: 24, note: "card padding, grid gaps" },
  { v: 48, note: "desktop card padding" },
  { v: 96, note: "between sections" },
];

const RADII = [
  { r: 8, note: "controls" },
  { r: 16, note: "cards, insets" },
  { r: 17, note: "image frames" },
  { r: 9999, note: "pills, buttons, chips" },
];

export default function DesignSystemPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0F0F11", color: "var(--cream)" }}>
      <style>{`
        .ds-link { color: ${TAN}; transition: color 200ms ease; }
        .ds-link:hover { color: var(--cream); }
        .ds-anchor:hover .ds-anchor-label { color: var(--cream); }
        @keyframes ds-slide { 0% { left: 6px; } 50% { left: calc(100% - 22px); } 100% { left: 6px; } }
        .ds-dot { position: absolute; top: 50%; width: 12px; height: 12px; margin-top: -6px;
          border-radius: 9999px; background: var(--gold);
          box-shadow: 0 0 10px rgba(216,180,106,0.55); animation: ds-slide 2.6s infinite; }
        .ds-ease-micro { animation-timing-function: ease; }
        .ds-ease-sheet { animation-timing-function: cubic-bezier(.32,.72,0,1); }
        .ds-ease-trace { animation-timing-function: cubic-bezier(.16,1,.3,1); }
        @media (prefers-reduced-motion: reduce) {
          .ds-dot { animation: none; left: 6px; }
          .gold-trace::after, .gold-btn-trace:hover::after { animation: none; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16" style={{ paddingTop: 32, paddingBottom: 64 }}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <header>
          <div className="flex items-center gap-4" style={{ marginBottom: "clamp(40px, 8vw, 72px)" }}>
            <Logomark size={26} />
            <div className="flex-1 h-px" style={{ background: "rgba(158,148,130,0.25)" }} />
            <span style={mono(12, TAN)}>20 / 26</span>
          </div>

          <p style={{ ...mono(12, "var(--gold)", 600), marginBottom: 20 }}>neilmcardle.com</p>
          <h1 style={{ fontFamily: GARAMOND, fontWeight: 800, fontSize: "clamp(2.75rem, 8vw, 4.75rem)", lineHeight: 1.0, letterSpacing: "0.01em", textTransform: "uppercase", color: "var(--cream)", margin: 0 }}>
            Design System
          </h1>
          <p style={{ fontFamily: INTER, fontSize: "clamp(1.0625rem, 1.6vw, 1.25rem)", lineHeight: 1.55, color: "rgba(251,249,243,0.75)", maxWidth: 620, marginTop: 24, marginBottom: 0, textWrap: "pretty" }}>
            The visual language of neilmcardle.com, documented. Primitives, semantics and component tokens, every value the site is built from, exactly as it ships.
          </p>

          <nav className="flex flex-wrap" style={{ gap: "12px 28px", marginTop: 40 }}>
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="ds-anchor inline-flex items-center gap-2" style={{ textDecoration: "none" }}>
                <span style={mono(11, "var(--gold)", 600)}>{item.n}</span>
                <span className="ds-anchor-label" style={{ ...mono(11, TAN), transition: "color 200ms ease" }}>{item.label}</span>
              </a>
            ))}
          </nav>
        </header>

        {/* ── 01 Logo ──────────────────────────────────────────────── */}
        <Section id="logo">
          <SectionHeader index="01" eyebrow="Logo" title="The mark and the name." intro="One custom shape, rotated to make the two forms that build an N from negative space, on a 78 × 78 grid. My own drawing, not a typeface. The wordmark beside it is the only place EB Garamond appears, at its heaviest weight, set in caps." />

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              { bg: "linear-gradient(145deg, #1B1B1E 0%, #141416 100%)", color: "var(--cream)", caption: "Primary · cream on dark", chip: "soft-card" },
              { bg: "linear-gradient(145deg, #1B1B1E 0%, #141416 100%)", color: "var(--gold)", caption: "Accent · gold, sparing use", chip: "soft-card" },
              { bg: "linear-gradient(180deg, var(--gold-bright) 0%, var(--gold) 50%, var(--gold-deep) 100%)", color: "#2A1E06", caption: "On gold · ink #2A1E06", chip: "" },
            ].map((cw, i) => (
              <div key={i} className={cw.chip} style={{ borderRadius: "1rem", padding: 28, background: cw.bg, ...(cw.chip ? {} : { border: "1px solid rgba(120,90,30,0.45)" }) }}>
                <div className="flex items-center justify-center" style={{ height: 120 }}>
                  <Logomark size={78} color={cw.color} />
                </div>
                <p style={{ ...specMono(cw.color === "#2A1E06" ? "rgba(42,30,6,0.7)" : TAN), marginTop: 8, textAlign: "center" }}>{cw.caption}</p>
              </div>
            ))}
          </div>

          <div className="soft-card" style={{ borderRadius: "1rem", padding: 28, marginTop: 16 }}>
            <div className="flex items-center gap-4">
              <Logomark size={26} />
              <div className="h-px" style={{ width: 28, background: "rgba(158,148,130,0.4)" }} />
              <span style={{ fontFamily: GARAMOND, fontWeight: 800, fontSize: 22, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cream)" }}>
                NEIL McARDLE
              </span>
            </div>
            <p style={{ ...specMono(), marginTop: 18 }}>Header lockup · mark 26px + hairline rule · wordmark EB Garamond 800</p>
          </div>

          <SpecStrip lines={[
            "clearspace · half the mark's width, all sides",
            "minimum · 16px digital",
            "colours · cream, gold or ink-on-gold only. Never rotated, outlined or shadowed.",
          ]} />
        </Section>

        {/* ── 02 Voice ─────────────────────────────────────────────── */}
        <Section id="voice">
          <SectionHeader index="02" eyebrow="Voice & tone" title="Reads like talking. Ships like work." intro="The copy is the brand as much as the gold is. Short declarative sentences, plain words, outcomes over process. Confidence comes from specifics, never from superlatives." />

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {[
              { label: "Short and declarative", body: "One idea per sentence. Full stops do the pacing. “Subscribe. Send the request. Approve the working thing when it lands.”" },
              { label: "Ship is the verb", body: "Talk about working product on a real domain, not deliverables or engagements. Days, not months. Built, not designed-then-handed-off." },
              { label: "Confident, never salesy", body: "No exclamation marks, no “world-class”, no urgency theatre. Scarcity is stated as fact: one client at a time, one slot open now." },
              { label: "Async courtesy", body: "Respect the reader's time the way the service respects the client's. No forms, no calls, no meetings, and no copy that wastes a line." },
            ].map((v) => (
              <div key={v.label} className="soft-card" style={{ borderRadius: "1rem", padding: 24 }}>
                <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 14 }}>{v.label}</p>
                <p style={{ fontFamily: INTER, fontSize: 15, lineHeight: 1.6, color: "rgba(251,249,243,0.7)", margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 16 }}>
            <div className="soft-inset" style={{ position: "relative", borderRadius: "1rem", padding: "26px 24px 24px" }}>
              <span style={{ position: "absolute", top: -8, left: 16, background: "#1A1A1D", padding: "0 8px", ...mono(10, "var(--gold)", 600) }}>Write this</span>
              <p style={{ fontFamily: INTER, fontSize: 15, lineHeight: 1.6, color: "rgba(251,249,243,0.85)", margin: 0 }}>
                Most requests ship in 2 to 4 working days. Because I take one client at a time, your work isn&rsquo;t sitting behind anyone else&rsquo;s.
              </p>
            </div>
            <div className="soft-inset" style={{ position: "relative", borderRadius: "1rem", padding: "26px 24px 24px" }}>
              <span style={{ position: "absolute", top: -8, left: 16, background: "#1A1A1D", padding: "0 8px", ...mono(10, TAN) }}>Not this</span>
              <p style={{ fontFamily: INTER, fontSize: 15, lineHeight: 1.6, color: "rgba(251,249,243,0.45)", margin: 0 }}>
                Our streamlined, world-class delivery process leverages an agile workflow to ensure rapid turnaround and stakeholder alignment at every touchpoint!
              </p>
            </div>
          </div>
        </Section>

        {/* ── 03 Colour ────────────────────────────────────────────── */}
        <Section id="color">
          <SectionHeader index="03" eyebrow="Colour" title="One warm family on near-black." intro="Cream for text, tan for the quiet mono labels, gold as the single accent, all in the same warm family, so the page reads as one palette, not three. Surfaces are six near-blacks, separated by light, not hue." />

          <GroupLabel>Primitives · Brand</GroupLabel>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
            {BRAND.map((s) => (
              <div key={s.name}>
                <div style={{ height: 76, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: s.value }} />
                <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.02em", color: "var(--cream)", margin: "10px 0 0" }}>{s.name}</p>
                <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.02em", color: TAN, margin: "4px 0 0" }}>{s.value} · {s.note}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <GroupLabel>Primitives · Surfaces</GroupLabel>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
              {SURFACES.map((s) => (
                <div key={s.name}>
                  <div style={{ height: 76, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: s.value }} />
                  <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.02em", color: "var(--cream)", margin: "10px 0 0" }}>{s.name}</p>
                  <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.02em", color: TAN, margin: "4px 0 0" }}>{s.value} · {s.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <GroupLabel>Semantics · Roles</GroupLabel>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: "8px 24px" }}>
              {ROLES.map((r, i) => (
                <div key={r.role} className="flex items-center gap-4" style={{ padding: "14px 0", borderTop: i === 0 ? "none" : HAIRLINE }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: r.c, border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }} />
                  <span style={{ ...mono(11, "var(--gold)", 600, 0.08), textTransform: "none", flex: "0 0 150px" }}>{r.role}</span>
                  <span style={{ ...specMono(), textTransform: "none" }}>{r.d}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 04 Type ──────────────────────────────────────────────── */}
        <Section id="type">
          <SectionHeader index="04" eyebrow="Typography" title="Four voices, each with one job." intro="EB Garamond speaks once. The name. Playfair carries every heading. Inter does the reading. JetBrains Mono handles labels, numbers and buttons, always tracked wide and set in caps." />

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {[
              { label: "EB Garamond 800 · wordmark only", render: <span style={{ fontFamily: GARAMOND, fontWeight: 800, fontSize: 28, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cream)" }}>NEIL McARDLE</span> },
              { label: "Playfair Display 700 · all headings", render: <span style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: 26, color: "var(--cream)" }}>One designer, on purpose.</span> },
              { label: "Inter 400–600 · body", render: <span style={{ fontFamily: INTER, fontSize: 15, lineHeight: 1.6, color: "rgba(251,249,243,0.7)" }}>I take on one client at a time and ship working product to your domain. Fast, async, no calls. Design and code from the same hands, so nothing gets lost in translation.</span> },
              { label: "JetBrains Mono 400–600 · labels, numbers, buttons", render: <span style={mono(12, TAN)}>One slot open now · 2026 · £5,000/month</span> },
            ].map((t) => (
              <div key={t.label} className="soft-card" style={{ borderRadius: "1rem", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 0 }}>{t.label}</p>
                <div>{t.render}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <GroupLabel>Scale · as shipped</GroupLabel>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: "8px 24px" }}>
              {SCALE.map((row, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-baseline" style={{ gap: 12, padding: "18px 0", borderTop: i === 0 ? "none" : HAIRLINE }}>
                  <span style={{ ...specMono(), flex: "0 0 220px" }}>{row.spec}</span>
                  <div style={{ minWidth: 0 }}>{row.render}</div>
                </div>
              ))}
            </div>
            <SpecStrip lines={[
              "tracking · 0.13em standard · 0.1em pills · 0.08em dense mono",
              "leading · 1.0–1.25 headings · 1.45–1.6 body",
              "wrap · balance on headings, pretty on prose",
            ]} />
          </div>
        </Section>

        {/* ── 05 Space & Radius ────────────────────────────────────── */}
        <Section id="space">
          <SectionHeader index="05" eyebrow="Space, radius & elevation" title="Lit from above, spaced to breathe." intro="A 4px base grid on Tailwind's scale. Elevation is the system's signature: raised panels carry an inset top highlight and a long soft drop shadow; recessed wells invert it." />

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <GroupLabel>Spacing rhythm</GroupLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {SPACING.map((s) => (
                  <div key={s.v} className="flex items-center gap-4">
                    <span style={{ height: 8, width: s.v, background: "linear-gradient(90deg, var(--gold-bright), var(--gold-deep))", borderRadius: 4, flexShrink: 0 }} />
                    <span style={{ ...specMono(), textTransform: "none" }}>{s.v} · {s.note}</span>
                  </div>
                ))}
              </div>
              <p style={{ ...specMono(), marginTop: 22, paddingTop: 16, borderTop: HAIRLINE }}>container · max-w 1152px · gutters 24px mobile → 64px desktop</p>
            </div>

            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <GroupLabel>Radius</GroupLabel>
              <div className="flex flex-wrap" style={{ gap: 18 }}>
                {RADII.map((r) => (
                  <div key={r.r}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(145deg, #202024 0%, #141416 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: r.r === 9999 ? 9999 : r.r }} />
                    <p style={{ ...specMono(), marginTop: 8 }}>{r.r === 9999 ? "pill" : r.r} · {r.note}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: HAIRLINE }}>
                <GroupLabel>Elevation</GroupLabel>
                <div className="flex" style={{ gap: 18 }}>
                  <div>
                    <div className="soft-card" style={{ width: 96, height: 60, borderRadius: 12 }} />
                    <p style={{ ...specMono(), marginTop: 8 }}>raised · top highlight + drop</p>
                  </div>
                  <div>
                    <div className="soft-inset" style={{ width: 96, height: 60, borderRadius: 12 }} />
                    <p style={{ ...specMono(), marginTop: 8 }}>recessed · inverted shadows</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 06 Components ────────────────────────────────────────── */}
        <Section id="components">
          <SectionHeader index="06" eyebrow="Components" title="The working parts." intro="The repeated assemblies the site is built from: section headers, buttons, card materials, badges, price figures and list rows. Each shown live, with its spec." />

          {/* Section header pattern */}
          <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
              <span className="icon-chip" style={{ width: 36, height: 36 }}><Spark size={16} /></span>
              <span style={mono(11, TAN)}>How it works</span>
              <div className="flex-1 h-px" style={{ background: "rgba(158,148,130,0.3)" }} />
            </div>
            <h3 style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--cream)", margin: 0 }}>Subscribe. Request. Receive.</h3>
            <SpecStrip lines={[
              "chip 36px · icon-chip, gold glyph",
              "eyebrow mono 11px · 0.13em · tan · caps",
              "title playfair 700 · clamp(28→40px)",
            ]} />
          </div>

          {/* Buttons & links */}
          <div className="soft-card" style={{ borderRadius: "1rem", padding: 28, marginTop: 16 }}>
            <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>Buttons &amp; links</p>
            <div className="flex flex-wrap items-center" style={{ gap: 24 }}>
              <span className="gold-btn gold-btn-trace inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full" style={{ ...mono(13, "#2A1E06", 600) }}>
                Claim the slot
                <span className="gold-btn-badge inline-flex items-center justify-center" style={{ width: 28, height: 28 }}><Chevron size={14} /></span>
              </span>
              <a href="#components" className="ds-link" style={mono(11, TAN)}>Listen on ElevenReader →</a>
              <a href="#components" className="ds-link" style={{ fontFamily: INTER, fontSize: 14 }}>Paintings</a>
            </div>
            <SpecStrip lines={[
              "gold-btn gradient 180° bright→gold→deep · ink text · pill · mono 600",
              "hover brightness 1.05 + rim glint sweep",
              "press translateY(1px), shadow collapses",
              "links tan → cream on hover, 200ms",
            ]} />
          </div>

          {/* Card materials */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 16 }}>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: 24 }}>
              <p style={{ ...mono(10, "var(--gold)", 600), marginBottom: 12 }}>soft-card</p>
              <p style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: 20, color: "var(--cream)", margin: "0 0 8px" }}>Raised panel</p>
              <p style={{ fontFamily: INTER, fontSize: 14, lineHeight: 1.55, color: "rgba(251,249,243,0.7)", margin: 0 }}>The default card. Inset top hairline reads as light from above; a long soft drop shadow lifts it off the page.</p>
            </div>
            <div className="soft-inset" style={{ position: "relative", borderRadius: "1rem", padding: "26px 24px 24px" }}>
              <span style={{ position: "absolute", top: -8, left: 16, background: "#1A1A1D", padding: "0 8px", ...mono(10, "var(--gold)", 600) }}>Included</span>
              <p style={{ fontFamily: INTER, fontSize: 14, lineHeight: 1.55, color: "rgba(251,249,243,0.7)", margin: 0 }}>Recessed sub-panel, nested inside a soft-card. Inverted shadows read as pressed-in. The floating label sits on a #1A1A1D patch.</p>
            </div>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: 24 }}>
              <p style={{ ...mono(10, "var(--gold)", 600), marginBottom: 16 }}>icon-chip</p>
              <div className="flex items-center" style={{ gap: 14 }}>
                <span className="icon-chip" style={{ width: 36, height: 36, ...mono(12, "var(--gold)", 600) }}>01</span>
                <span className="icon-chip" style={{ width: 48, height: 48 }}><Spark size={20} /></span>
                <span className="icon-chip" style={{ width: 64, height: 64 }}><Spark size={26} /></span>
              </div>
              <p style={{ fontFamily: INTER, fontSize: 14, lineHeight: 1.55, color: "rgba(251,249,243,0.7)", margin: "16px 0 0" }}>Circular raised chip in the card material. Gold glyph or index number. 36 / 48 / 64px.</p>
            </div>
          </div>

          {/* Badges & pills + Price */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 16 }}>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>Badges &amp; pills</p>
              <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
                <span className="inline-flex items-center gap-2 rounded-full" style={{ border: "1px solid rgba(216,180,106,0.3)", background: "rgba(216,180,106,0.1)", padding: "5px 12px", ...mono(10, "var(--gold)", 600) }}>
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--gold)" }} />
                  One slot open now
                </span>
                <span className="inline-flex items-center rounded-full" style={{ border: "1px solid rgba(158,148,130,0.3)", padding: "5px 12px", ...mono(11, TAN, 400, 0.1) }}>Pause anytime</span>
                <span style={mono(10, TAN)}>Product · AI · Solo-built</span>
              </div>
              <SpecStrip lines={[
                "slot badge gold text · gold 30% border · gold 10% fill",
                "quiet pill tan text · tan 30% border · no fill",
                "tag run bare mono micro, dot-separated",
              ]} />
            </div>

            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>Price figure</p>
              <div className="flex items-baseline" style={{ gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: "clamp(2.75rem, 8vw, 4rem)", lineHeight: 1, color: "var(--cream)" }}>£5,000</span>
                <span style={mono(14, TAN, 400, 0.08)}>/month</span>
                <span style={mono(10, TAN)}>+ VAT</span>
              </div>
              <SpecStrip lines={[
                "figure playfair 700 · clamp(44→64px)",
                "unit mono 14px tan · 0.08em",
              ]} />
            </div>
          </div>

          {/* Indexed list item + FAQ */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 16 }}>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>Indexed list item</p>
              <div className="flex items-start" style={{ gap: 20 }}>
                <span style={{ ...mono(12, "var(--gold)", 600), paddingTop: 2 }}>01</span>
                <div>
                  <div className="flex items-center" style={{ gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 600, color: "var(--cream)" }}>makeEbook</span>
                    <span style={mono(10, TAN)}>Product · AI · Solo-built</span>
                  </div>
                  <p style={{ fontFamily: INTER, fontSize: 14, lineHeight: 1.55, color: "rgba(251,249,243,0.7)", margin: "6px 0 0" }}>AI-first eBook creation platform, designed and built solo.</p>
                </div>
              </div>
              <SpecStrip lines={[
                "index gold mono 12px",
                "title inter 15px cream · tags mono micro",
              ]} />
            </div>

            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>FAQ entry</p>
              <div style={{ borderTop: "1px solid rgba(158,148,130,0.2)", paddingTop: 18 }}>
                <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 600, color: "var(--cream)", margin: "0 0 8px" }}>Do we need to get on calls?</p>
                <p style={{ fontFamily: INTER, fontSize: 15, lineHeight: 1.6, color: "rgba(251,249,243,0.7)", margin: 0 }}>No. It&rsquo;s async by design. That&rsquo;s what keeps it fast and keeps the time going into the work instead of meetings.</p>
              </div>
              <SpecStrip lines={[
                "q inter 600 16px cream",
                "a inter 15px cream 70% · lh 1.6",
              ]} />
            </div>
          </div>
        </Section>

        {/* ── 07 Motion ────────────────────────────────────────────── */}
        <Section id="motion">
          <SectionHeader index="07" eyebrow="Motion" title="Light moves, surfaces don't." intro="The signature move is the trace: a specular glint orbiting a rim, reading as light catching an edge, never a colour change. Everything else is quick, quiet and physical." />

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>Gold rim trace</p>
              <div className="gold-trace" style={{ position: "relative", height: 120, borderRadius: "1rem", background: "#0D0D0F", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={mono(10, TAN)}>Orbiting glint</span>
              </div>
              <p style={{ fontFamily: INTER, fontSize: 14, lineHeight: 1.55, color: "rgba(251,249,243,0.7)", margin: "16px 0 0" }}>Rests as a highlight in the top-left corner; orbits on hover, then settles back. Gold on dark surfaces, warm near-white on gold CTAs.</p>
            </div>

            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>Easing</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { cls: "ds-ease-micro", label: "micro · 200ms ease · hovers, colour" },
                  { cls: "ds-ease-sheet", label: "sheet · 500ms cubic-bezier(.32,.72,0,1)" },
                  { cls: "ds-ease-trace", label: "trace fast · 3.2s cubic-bezier(.16,1,.3,1)" },
                ].map((e) => (
                  <div key={e.cls}>
                    <div className="soft-inset" style={{ position: "relative", height: 24, borderRadius: 9999 }}>
                      <span className={`ds-dot ${e.cls}`} />
                    </div>
                    <p style={{ ...specMono(), marginTop: 8 }}>{e.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>Rules</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Press states move 1px down and collapse the glow. Nothing scales.",
                  "Reveals stagger in at 450ms ease, 8px rise, rows in sequence.",
                  "Ambient motion is hover-only. The page at rest is still, except a resting glint.",
                ].map((r, i) => (
                  <p key={i} style={{ fontFamily: INTER, fontSize: 14, lineHeight: 1.55, color: "rgba(251,249,243,0.7)", margin: 0 }}>{r}</p>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── 08 Imagery ───────────────────────────────────────────── */}
        <Section id="imagery">
          <SectionHeader index="08" eyebrow="Imagery" title="Grain over everything." intro="Every photo sits in a recessed well and carries a film-grain overlay, a tiled SVG fractal-noise texture at 16% opacity, overlay blend. It unifies disparate images and adds analog warmth." />

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div className="soft-card" style={{ borderRadius: "1rem", padding: 24 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 16 }}>Recessed image well</p>
              <div style={{ position: "relative", aspectRatio: "3 / 2", borderRadius: "1.05rem", overflow: "hidden", background: "#0D0D0F", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 2px 7px rgba(0,0,0,0.6)" }}>
                <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg, #16161a 0 14px, #1d1d22 14px 28px)" }} />
                <div className="img-grain" style={{ position: "absolute", inset: 0 }} />
                <span style={{ position: "absolute", left: 14, bottom: 12, ...mono(10, "rgba(251,249,243,0.55)") }}>project shot</span>
              </div>
              <SpecStrip lines={[
                "frame 3:2 · radius ~17px · white 10% border · #0D0D0F well",
                "grain svg fractal noise · 16% · overlay blend",
              ]} />
            </div>

            <div className="soft-card" style={{ borderRadius: "1rem", padding: 28 }}>
              <p style={{ ...mono(11, "var(--gold)", 600), marginBottom: 20 }}>Treatment rules</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Images never float. They sit pressed into a recessed well, grounded by an inset shadow.",
                  "Grain goes on top of every photo. It hides banding where shadows meet dark areas.",
                  "No duotones, no gold tints on photos. Colour belongs to the system, not the imagery.",
                ].map((r, i) => (
                  <p key={i} style={{ fontFamily: INTER, fontSize: 14, lineHeight: 1.55, color: "rgba(251,249,243,0.7)", margin: 0 }}>{r}</p>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="flex flex-wrap items-center" style={{ gap: 16, justifyContent: "space-between", marginTop: "clamp(72px, 12vw, 112px)", paddingTop: 28, borderTop: "1px solid rgba(158,148,130,0.2)" }}>
          <div className="flex items-center gap-3">
            <Logomark size={20} />
            <span style={{ fontFamily: INTER, fontSize: 12, color: "rgba(251,249,243,0.6)" }}>© 2026 Neil McArdle</span>
          </div>
          <span style={mono(10, TAN)}>Design system · v1.0 · June 2026</span>
        </footer>
      </div>
    </div>
  );
}
